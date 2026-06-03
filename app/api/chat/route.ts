import { getGeminiClient, getMasterPrompt } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 1. Obtener datos del usuario para verificar plan y límites
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan, messages_limit, messages_used_this_month, status')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Error al obtener perfil de usuario' }, { status: 500 })
    }

    if (userData.status === 'inactive') {
      return NextResponse.json({ error: 'Tu cuenta está inactiva' }, { status: 403 })
    }

    if (userData.plan === 'basic' && userData.messages_used_this_month >= userData.messages_limit) {
      return NextResponse.json({ error: 'Has alcanzado el límite de mensajes de tu plan' }, { status: 403 })
    }

    // 2. Parsear el request
    const body = await req.json()
    const { message, conversation_id, file_url, file_type } = body

    if (!message && !file_url) {
      return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 })
    }

    let currentConversationId = conversation_id

    // 3. Crear conversación si no existe
    if (!currentConversationId) {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .insert([{ 
          user_id: user.id, 
          title: message ? message.substring(0, 40) + '...' : 'Consulta con documento'
        }])
        .select()
        .single()

      if (convError) throw convError
      currentConversationId = convData.id
    } else {
      // Actualizar timestamp de la conversación
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversationId)
    }

    // 4. Guardar mensaje del usuario en DB
    const { data: userMessageData, error: userMsgError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: currentConversationId,
        role: 'user',
        content: message || '',
        file_url: file_url || null,
        file_type: file_type || null
      }])
      .select()
      .single()

    if (userMsgError) throw userMsgError

    // 5. Preparar historial para Gemini
    const { data: historyData } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })

    const chatHistory = historyData?.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content + (msg.file_url ? `\n[Archivo adjunto: ${msg.file_url}]` : '') }]
    })) || []

    // Asegurarnos de no duplicar el mensaje actual
    chatHistory.pop() 

    // 6. Configurar Gemini y enviar mensaje
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: getMasterPrompt(),
    })

    const chat = model.startChat({
      history: chatHistory,
    })

    let promptContent = message || ''
    if (file_url) {
      promptContent += `\n[El usuario ha adjuntado un documento en esta URL: ${file_url}. Analízalo según las instrucciones de manejo de archivos.]`
    }

    const result = await chat.sendMessage(promptContent)
    const assistantResponse = result.response.text()

    // 7. Guardar respuesta del asistente en DB
    const { data: assistantMessageData, error: asstMsgError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: currentConversationId,
        role: 'assistant',
        content: assistantResponse,
      }])
      .select()
      .single()

    if (asstMsgError) throw asstMsgError

    // 8. Incrementar contador de mensajes del usuario
    await supabase.rpc('increment_message_count', { user_id_param: user.id })
    // Como alternativa segura si no hay RPC:
    await supabase
      .from('users')
      .update({ messages_used_this_month: userData.messages_used_this_month + 1 })
      .eq('id', user.id)

    // 9. Retornar respuesta
    return NextResponse.json({
      message: userMessageData,
      assistant_message: assistantMessageData,
      conversation_id: currentConversationId,
      messages_used: userData.messages_used_this_month + 1,
      messages_limit: userData.messages_limit
    })

  } catch (error: any) {
    console.error('Error en chat API:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}

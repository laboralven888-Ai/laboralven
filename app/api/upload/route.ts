import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no soportado. Solo JPG, PNG, WEBP o PDF.' }, { status: 400 })
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo excede el límite de 5MB' }, { status: 400 })
    }

    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}/${uuidv4()}.${fileExtension}`

    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // Obtener URL pública o firmada
    const { data: urlData } = await supabase.storage
      .from('chat-files')
      .createSignedUrl(fileName, 60 * 60 * 24 * 7) // 7 días

    return NextResponse.json({ 
      url: urlData?.signedUrl,
      path: data.path,
      type: file.type
    })

  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: error.message || 'Error al subir archivo' }, { status: 500 })
  }
}

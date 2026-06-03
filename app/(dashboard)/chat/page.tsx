'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { MessageProps } from '@/components/chat/ChatMessage'
import { useAuth } from '@/contexts/AuthContext'

export default function NewChatPage() {
  const [messages, setMessages] = useState<MessageProps[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { refreshUser } = useAuth()

  const handleSendMessage = async (content: string, file?: File | null) => {
    setIsTyping(true)
    setError(null)

    // Agregar mensaje del usuario optimísticamente
    let fileUrl = null
    let fileType = null

    try {
      // 1. Subir archivo si existe
      if (file) {
        const formData = new FormData()
        formData.append('file', file)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const errData = await uploadRes.json()
          throw new Error(errData.error || 'Error subiendo archivo')
        }

        const uploadData = await uploadRes.json()
        fileUrl = uploadData.url
        fileType = uploadData.type
      }

      const tempUserMsg: MessageProps = {
        role: 'user',
        content,
        created_at: new Date().toISOString(),
        file_url: fileUrl,
        file_type: fileType,
      }
      setMessages((prev) => [...prev, tempUserMsg])

      // 2. Enviar a Gemini
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          file_url: fileUrl,
          file_type: fileType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al comunicarse con la IA')
      }

      // Si se creó una conversación nueva, redirigir a la URL con ID para que el layout recargue
      refreshUser() // Refrescar límites
      router.push(`/chat/${data.conversation_id}`)

    } catch (err: any) {
      console.error(err)
      setError(err.message)
      // Remover mensaje optimista si falló y no era un archivo subido (para simplificar)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <ChatWindow
      messages={messages}
      onSendMessage={handleSendMessage}
      isTyping={isTyping}
      error={error}
    />
  )
}

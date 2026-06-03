'use client'

import { useState, useEffect } from 'react'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { MessageProps } from '@/components/chat/ChatMessage'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function ExistingChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<MessageProps[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { refreshUser } = useAuth()
  const supabase = createClient()
  const conversationId = params.id

  useEffect(() => {
    fetchMessages()
  }, [conversationId])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError('Error al cargar el historial de mensajes')
    }
  }

  const handleSendMessage = async (content: string, file?: File | null) => {
    setIsTyping(true)
    setError(null)

    let fileUrl = null
    let fileType = null

    try {
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

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversation_id: conversationId,
          file_url: fileUrl,
          file_type: fileType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al comunicarse con la IA')
      }

      setMessages((prev) => [...prev, data.assistant_message])
      refreshUser()

    } catch (err: any) {
      console.error(err)
      setError(err.message)
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

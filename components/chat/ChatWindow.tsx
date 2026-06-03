import { useEffect, useRef } from 'react'
import { ChatMessage, MessageProps } from './ChatMessage'
import { ChatInput } from './ChatInput'

interface ChatWindowProps {
  messages: MessageProps[]
  onSendMessage: (message: string, file?: File | null) => Promise<void>
  isTyping: boolean
  error: string | null
}

export function ChatWindow({ messages, onSendMessage, isTyping, error }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll al fondo cuando hay nuevos mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      
      {/* Contenedor de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-20 mt-10">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mb-4">
                ⚖️
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Asistente Laboralven</h3>
              <p className="max-w-md">
                Escribe tu consulta sobre la LOTTT, prestaciones sociales, despidos, o sube un documento para que lo analice.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage key={msg.id || index} {...msg} />
            ))
          )}

          {isTyping && (
            <div className="flex items-end gap-2 max-w-[85%] flex-row mb-6">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-[#1e3a5f] text-white">
                ⚖️
              </div>
              <div className="bg-white border border-slate-200 px-4 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 text-center border border-red-100 max-w-xl mx-auto">
              {error}
            </div>
          )}
          
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
    </div>
  )
}

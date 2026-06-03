import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import ReactMarkdown from 'react-markdown'
import { formatDateTime } from '@/lib/utils'

export interface MessageProps {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  file_url?: string | null
  file_type?: string | null
}

export function ChatMessage({ role, content, created_at, file_url, file_type }: MessageProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col mb-6 ${isUser ? 'items-end' : 'items-start'}`}
    >
      <div className={`flex items-end gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
          isUser ? 'bg-blue-100 text-blue-700' : 'bg-[#1e3a5f] text-white'
        }`}>
          {isUser ? '👤' : '⚖️'}
        </div>

        {/* Burbuja */}
        <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-[#1e3a5f] text-white rounded-br-none' 
              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
          }`}>
            
            {/* Si hay archivo adjunto */}
            {file_url && (
              <div className="mb-3 rounded-lg overflow-hidden border border-white/20 bg-white/10 p-2">
                {file_type?.startsWith('image/') ? (
                  <img src={file_url} alt="Archivo adjunto" className="max-w-full h-auto max-h-48 object-contain rounded-md" />
                ) : (
                  <div className="flex items-center gap-2 text-sm p-2">
                    📄 <span>Documento adjunto</span>
                    <a href={file_url} target="_blank" rel="noreferrer" className="underline ml-2">Ver</a>
                  </div>
                )}
              </div>
            )}

            {/* Contenido (Markdown solo para asistente) */}
            <div className={`text-sm md:text-base leading-relaxed ${isUser ? 'whitespace-pre-wrap' : 'prose prose-sm md:prose-base max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0'}`}>
              {isUser ? (
                content
              ) : (
                <ReactMarkdown>{content}</ReactMarkdown>
              )}
            </div>
          </div>
          
          <span className="text-xs text-slate-400 px-1">
            {formatDateTime(created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

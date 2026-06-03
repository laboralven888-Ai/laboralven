import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatInputProps {
  onSendMessage: (message: string, file?: File | null) => Promise<void>
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!message.trim() && !file) || disabled || isUploading) return

    setIsUploading(true)
    try {
      await onSendMessage(message, file)
      setMessage('')
      setFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      // Validaciones básicas front-end
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('El archivo no debe pesar más de 5MB')
        return
      }
      setFile(selectedFile)
    }
  }

  return (
    <div className="bg-white border-t p-4 md:p-6 sticky bottom-0">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-end gap-2">
        
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1e3a5f]/20 focus-within:border-[#1e3a5f] transition-all">
          
          <AnimatePresence>
            {file && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-sm text-blue-800 truncate">
                  <span>📎</span>
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-blue-500 text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFile(null)}
                  className="text-blue-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-[#1e3a5f] transition-colors focus:outline-none"
              disabled={disabled || isUploading}
              title="Adjuntar documento o imagen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,application/pdf"
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Escribe tu consulta laboral..."
              className="flex-1 max-h-32 bg-transparent py-3 px-2 resize-none focus:outline-none disabled:opacity-50 text-sm md:text-base"
              rows={1}
              disabled={disabled || isUploading}
              style={{ minHeight: '48px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={(!message.trim() && !file) || disabled || isUploading}
          className="h-12 w-12 flex items-center justify-center rounded-xl bg-[#1e3a5f] text-white hover:bg-[#2a5a8f] transition-colors disabled:opacity-50 disabled:hover:bg-[#1e3a5f] flex-shrink-0"
        >
          {isUploading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -mr-0.5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          )}
        </button>
      </form>
      <div className="text-center mt-2">
        <p className="text-[10px] text-slate-400">
          LABORALVEN puede cometer errores. Considera verificar la información importante.
        </p>
      </div>
    </div>
  )
}

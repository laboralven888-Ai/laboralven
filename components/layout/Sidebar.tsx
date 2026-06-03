import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Conversation } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  conversations: Conversation[]
  isMobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export function Sidebar({ conversations, isMobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleNewChat = async () => {
    // Si ya estamos en /chat sin ID, no hacer nada
    if (pathname === '/chat') {
      if (window.innerWidth < 768) setMobileOpen(false)
      return
    }
    router.push('/chat')
    if (window.innerWidth < 768) setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#1e3a5f] text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/chat" className="font-bold text-xl flex items-center gap-2">
            ⚖️ LABORALVEN
          </Link>
          <button 
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Nueva Consulta
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-3">
            Tus Consultas
          </h3>
          
          <div className="space-y-1">
            {conversations.map((conv) => {
              const isActive = pathname === `/chat/${conv.id}`
              return (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  onClick={() => window.innerWidth < 768 && setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${
                    isActive 
                      ? 'bg-white/15 text-white font-medium' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {conv.title}
                </Link>
              )
            })}
            
            {conversations.length === 0 && (
              <p className="px-3 text-sm text-white/40 italic">
                No hay consultas recientes.
              </p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/history"
            onClick={() => window.innerWidth < 768 && setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === '/history' 
                ? 'bg-white/15 text-white font-medium' 
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ver todo el historial
          </Link>
        </div>
      </div>
    </>
  )
}

'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Conversation } from '@/lib/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isMobileOpen, setMobileOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      <Sidebar 
        conversations={conversations} 
        isMobileOpen={isMobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-hidden relative">
          {/* Le pasamos refreshConversations a los hijos si lo necesitan mediante clonación u otra forma,
              pero para simplificar en Next.js App Router, lo manejamos re-fetechando globalmente o
              permitiendo que el chat actualice la lista de ser necesario. */}
          {children}
        </main>
      </div>
    </div>
  )
}

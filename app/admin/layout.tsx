'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!appUser) {
        router.push('/')
      } else if (!appUser.is_admin) {
        router.push('/chat')
      }
    }
  }, [appUser, isLoading, router])

  if (isLoading || !appUser?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-[#1e3a5f] text-white flex items-center px-6 justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/chat" className="hover:bg-white/10 p-2 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="font-bold text-lg flex items-center gap-2">
            <span>🛡️</span> Admin Panel
          </h1>
        </div>
        <div className="text-sm text-blue-200">
          {appUser.email}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

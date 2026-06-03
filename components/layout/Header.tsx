import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { appUser, signOut } = useAuth()

  return (
    <header className="h-16 bg-white border-b flex items-center px-4 md:px-6 justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h2 className="font-semibold text-slate-800 hidden md:block">Asistente Virtual</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Indicador de mensajes */}
        {appUser && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border px-3 py-1.5 rounded-full text-xs">
            <span className="text-slate-500">Plan {appUser.plan.toUpperCase()}:</span>
            <span className={`font-semibold ${
              appUser.messages_used_this_month >= appUser.messages_limit 
                ? 'text-red-600' 
                : appUser.messages_used_this_month > (appUser.messages_limit * 0.8) 
                  ? 'text-amber-600' 
                  : 'text-blue-600'
            }`}>
              {appUser.plan === 'pro' 
                ? 'Ilimitado' 
                : `${appUser.messages_used_this_month} / ${appUser.messages_limit}`}
            </span>
          </div>
        )}

        {/* User Menu */}
        <div className="relative group">
          <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {appUser?.full_name?.charAt(0).toUpperCase() || appUser?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>
          
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all origin-top-right z-50">
            <div className="p-3 border-b">
              <p className="text-sm font-medium text-slate-800 truncate">{appUser?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{appUser?.email}</p>
            </div>
            <div className="p-1">
              {appUser?.is_admin && (
                <Link href="/admin" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                  Panel de Admin
                </Link>
              )}
              <button 
                onClick={signOut}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

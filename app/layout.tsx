import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'LABORALVEN — Asistente de Derecho Laboral',
  description: 'Asistente virtual de derecho laboral venezolano. Orientación sobre LOTTT, prestaciones sociales, despidos, vacaciones y más.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

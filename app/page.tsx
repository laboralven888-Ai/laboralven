'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.push('/chat')
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        })
        if (signUpError) throw signUpError
        
        // Asumiendo que tenemos auto-confirm activado o que manejará el correo.
        // Redirigir al chat, el middleware y AuthProvider verificarán si el perfil existe.
        // Nota: en Supabase, el perfil se crea por trigger.
        
        // Si el login fue exitoso tras signUp, vamos a chat
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/chat')
        } else {
          setError('Registro exitoso. Revisa tu correo para confirmar.')
        }
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Ocurrió un error. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Panel izquierdo - Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ backgroundColor: '#1e3a5f' }}
      >
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full" style={{ backgroundColor: '#3b82f6', filter: 'blur(80px)' }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full" style={{ backgroundColor: '#2a5a8f', filter: 'blur(100px)' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full" style={{ backgroundColor: '#60a5fa', filter: 'blur(60px)' }} />
        </div>

        {/* Logo y título */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
              ⚖️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">LABORALVEN</h1>
              <p className="text-xs text-blue-200 tracking-widest uppercase">Asistente Legal Virtual</p>
            </div>
          </div>
        </motion.div>

        {/* Contenido central */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 space-y-8"
        >
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Tu guía en<br />
              <span style={{ color: '#60a5fa' }}>Derecho Laboral</span><br />
              Venezolano
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed max-w-md">
              Orientación especializada sobre LOTTT, prestaciones sociales, despidos, 
              vacaciones y más. Respuestas claras y fundamentadas en la ley.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '📋', title: 'Contratos y Relación Laboral', desc: 'Tipos de contrato, derechos y obligaciones' },
              { icon: '💰', title: 'Prestaciones Sociales', desc: 'Cálculos según Art. 142 LOTTT' },
              { icon: '⚖️', title: 'Despidos y Estabilidad', desc: 'Inamovilidad, indemnizaciones, procedimientos' },
              { icon: '📄', title: 'Análisis de Documentos', desc: 'Envía contratos, liquidaciones o constancias' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
              >
                <span className="text-xl mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-blue-300 text-xs">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer del panel */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2 text-blue-300 text-xs">
            <span>🇻🇪</span>
            <span>Especializado en legislación laboral venezolana</span>
          </div>
          <p className="text-blue-400 text-xs mt-1">
            No reemplaza la asesoría legal presencial de un abogado.
          </p>
        </motion.div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12" style={{ backgroundColor: '#f8fafc' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#1e3a5f' }}>
              <span className="text-white">⚖️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>LABORALVEN</h1>
              <p className="text-xs text-gray-500 tracking-widest uppercase">Asistente Legal</p>
            </div>
          </div>

          {/* Tarjeta del formulario */}
          <div className="bg-white rounded-2xl shadow-lg border p-8" style={{ borderColor: '#e2e8f0' }}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {isLogin ? 'Accede a tu asistente laboral' : 'Regístrate para comenzar'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg text-sm"
                style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre completo"
                    required={!isLogin}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: '#e2e8f0', 
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none"
                  style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none"
                  style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all disabled:opacity-60"
                style={{ 
                  backgroundColor: loading ? '#2a5a8f' : '#1e3a5f',
                  boxShadow: '0 2px 8px rgba(30, 58, 95, 0.3)'
                }}
                onMouseEnter={(e) => { if (!loading) (e.target as HTMLElement).style.backgroundColor = '#2a5a8f' }}
                onMouseLeave={(e) => { if (!loading) (e.target as HTMLElement).style.backgroundColor = '#1e3a5f' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError('') }}
                className="text-sm transition-colors"
                style={{ color: '#3b82f6' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#1e3a5f'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#3b82f6'}
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            Al usar LABORALVEN aceptas que este servicio es informativo y no 
            reemplaza la asesoría legal presencial de un abogado.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

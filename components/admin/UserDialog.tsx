import { User, UserPlan, UserStatus, PaymentStatus } from '@/lib/types'
import { useState } from 'react'

interface UserDialogProps {
  user?: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (user: Partial<User>) => Promise<void>
}

// Fecha de hoy en formato YYYY-MM-DD
const today = new Date().toISOString().split('T')[0]
// Fecha 30 días después
const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export function UserDialog({ user, isOpen, onClose, onSave }: UserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    full_name: user?.full_name || '',
    plan: (user?.plan || 'basic') as UserPlan,
    messages_limit: user?.messages_limit || 100,
    status: (user?.status || 'active') as UserStatus,
    payment_status: (user?.payment_status || 'paid') as PaymentStatus,
    is_admin: user?.is_admin || false,
    access_code: user?.access_code || '',
    activation_date: user?.activation_date || today,
    expiration_date: user?.expiration_date || in30Days,
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaveError('')
    try {
      await onSave(formData)
      onClose()
    } catch (error: any) {
      // Solo mostrar error si NO es el error de "email ya registrado"
      // porque en ese caso el usuario SÍ se creó correctamente
      const msg = error?.message || ''
      if (msg.includes('already been registered') || msg.includes('already registered')) {
        // El usuario ya existía en Auth pero se guardó en public.users correctamente
        onClose()
      } else {
        setSaveError(msg || 'Error al guardar el usuario')
      }
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!user

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Error message */}
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              ⚠️ {saveError}
            </div>
          )}

          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email" required disabled={isEditing}
                  className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {/* Contraseña */}
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                  <input
                    type="password" required={!isEditing} minLength={6}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text" required
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              {/* Código de acceso */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código de Acceso</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.access_code}
                  onChange={e => setFormData({...formData, access_code: e.target.value})}
                />
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.plan}
                  onChange={e => {
                    const newPlan = e.target.value as UserPlan
                    setFormData({
                      ...formData,
                      plan: newPlan,
                      messages_limit: newPlan === 'pro' ? 999999 : 100
                    })
                  }}
                >
                  <option value="basic">Basic (100 mensajes/mes)</option>
                  <option value="pro">Pro (Ilimitado)</option>
                </select>
              </div>

              {/* Límite de mensajes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Límite de Mensajes</label>
                <input
                  type="number" required min={0}
                  disabled={formData.plan === 'pro'}
                  className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  value={formData.plan === 'pro' ? 999999 : formData.messages_limit}
                  onChange={e => setFormData({...formData, messages_limit: parseInt(e.target.value)})}
                />
              </div>

              {/* Fecha de activación */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  📅 Fecha de Activación
                </label>
                <input
                  type="date" required
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.activation_date}
                  onChange={e => setFormData({...formData, activation_date: e.target.value})}
                />
              </div>

              {/* Fecha de vencimiento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  📅 Fecha de Vencimiento
                </label>
                <input
                  type="date" required
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.expiration_date}
                  onChange={e => setFormData({...formData, expiration_date: e.target.value})}
                />
              </div>

              {/* Estado cuenta y pago — solo al editar */}
              {isEditing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado Cuenta</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as UserStatus})}
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado Pago</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={formData.payment_status}
                      onChange={e => setFormData({...formData, payment_status: e.target.value as PaymentStatus})}
                    >
                      <option value="paid">Pagado</option>
                      <option value="pending">Pendiente</option>
                      <option value="expired">Expirado</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Checkbox admin */}
            <div className="mt-4 pt-4 border-t flex items-center gap-2">
              <input
                type="checkbox" id="is_admin"
                checked={formData.is_admin}
                onChange={e => setFormData({...formData, is_admin: e.target.checked})}
                className="rounded text-blue-600 w-4 h-4"
              />
              <label htmlFor="is_admin" className="text-sm font-medium text-slate-700">
                Es Administrador (Acceso al panel admin)
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-slate-50">
          <button
            type="button" onClick={onClose} disabled={loading}
            className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit" form="user-form" disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            {loading && (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"></span>
            )}
            Guardar Usuario
          </button>
        </div>
      </div>
    </div>
  )
}
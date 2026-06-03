import { User, UserPlan, UserStatus, PaymentStatus } from '@/lib/types'
import { useState } from 'react'

interface UserDialogProps {
  user?: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (user: Partial<User>) => Promise<void>
}

export function UserDialog({ user, isOpen, onClose, onSave }: UserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '', // Solo para creación
    full_name: user?.full_name || '',
    plan: (user?.plan || 'basic') as UserPlan,
    messages_limit: user?.messages_limit || 100,
    status: (user?.status || 'active') as UserStatus,
    payment_status: (user?.payment_status || 'paid') as PaymentStatus,
    is_admin: user?.is_admin || false,
    access_code: user?.access_code || ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error(error)
      alert('Error al guardar el usuario')
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!user

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" required disabled={isEditing}
                  className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                  <input 
                    type="password" required={!isEditing} minLength={6}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" required
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código de Acceso</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.access_code} onChange={e => setFormData({...formData, access_code: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value as UserPlan})}
                >
                  <option value="basic">Basic (Mensajes limitados)</option>
                  <option value="pro">Pro (Ilimitado)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Límite de Mensajes</label>
                <input 
                  type="number" required min={0} disabled={formData.plan === 'pro'}
                  className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-slate-100"
                  value={formData.plan === 'pro' ? 999999 : formData.messages_limit} 
                  onChange={e => setFormData({...formData, messages_limit: parseInt(e.target.value)})}
                />
              </div>

              {isEditing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado Cuenta</label>
                    <select 
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as UserStatus})}
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado Pago</label>
                    <select 
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={formData.payment_status} onChange={e => setFormData({...formData, payment_status: e.target.value as PaymentStatus})}
                    >
                      <option value="paid">Pagado</option>
                      <option value="pending">Pendiente</option>
                      <option value="expired">Expirado</option>
                    </select>
                  </div>
                </>
              )}
            </div>

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
            {loading && <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>}
            Guardar Usuario
          </button>
        </div>
      </div>
    </div>
  )
}

import { User } from '@/lib/types'

export function UserStatusBadge({ status, isPlan }: { status: string, isPlan?: boolean }) {
  if (isPlan) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === 'pro' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-800 border border-slate-200'
      }`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200'
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'expired': return 'bg-slate-100 text-slate-800 border-slate-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const labels: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    paid: 'Pagado',
    pending: 'Pendiente',
    expired: 'Expirado'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {labels[status] || status}
    </span>
  )
}

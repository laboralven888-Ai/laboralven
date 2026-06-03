import { User } from '@/lib/types'
import { UserStatusBadge } from './UserStatusBadge'
import { formatDate } from '@/lib/utils'

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: string) => void
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Plan / Límite</th>
              <th className="px-6 py-4">Mensajes Usados</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{user.full_name || 'Sin nombre'}</div>
                    <div className="text-slate-500 text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <UserStatusBadge status={user.plan} isPlan />
                      {user.plan === 'basic' && (
                        <span className="text-xs text-slate-500">Max: {user.messages_limit}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-[100px]">
                        <div 
                          className={`h-2.5 rounded-full ${user.plan === 'pro' ? 'bg-purple-500' : 'bg-blue-600'}`} 
                          style={{ width: `${user.plan === 'pro' ? 100 : Math.min((user.messages_used_this_month / user.messages_limit) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">
                        {user.plan === 'pro' ? '∞' : `${user.messages_used_this_month}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <UserStatusBadge status={user.status} />
                      <UserStatusBadge status={user.payment_status} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <span className="text-amber-600 font-bold text-lg" title="Es administrador">🛡️</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`¿Eliminar al usuario ${user.email} de forma permanente?`)) {
                            onDelete(user.id)
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar usuario"
                        disabled={user.is_admin} // No permitir borrar admins fácilmente por UI
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { UserTable } from '@/components/admin/UserTable'
import { UserDialog } from '@/components/admin/UserDialog'

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  
  // Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Error cargando usuarios')
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        // Actualizar
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
        if (!res.ok) throw new Error('Error al actualizar')
        
        // Refrescar localmente
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } as User : u))
      } else {
        // Crear
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Error al crear usuario')
        }
        
        fetchUsers() // Refrescar todo porque la BD genera ID y fechas
      }
    } catch (error: any) {
      throw error
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      setUsers(users.filter(u => u.id !== id))
    } catch (error: any) {
      alert(error.message)
    }
  }

  const openNewUser = () => {
    setEditingUser(null)
    setIsDialogOpen(true)
  }

  const openEditUser = (user: User) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  // Estadísticas rápidas
  const totalUsers = users.length
  const proUsers = users.filter(u => u.plan === 'pro').length
  const activeUsers = users.filter(u => u.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Usuarios</p>
          <p className="text-3xl font-bold text-slate-800">{totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Usuarios PRO</p>
          <p className="text-3xl font-bold text-purple-600">{proUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Cuentas Activas</p>
          <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button 
          onClick={openNewUser}
          className="w-full md:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Crear Usuario
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
        </div>
      ) : (
        <UserTable 
          users={filteredUsers} 
          onEdit={openEditUser} 
          onDelete={handleDeleteUser} 
        />
      )}

      <UserDialog 
        isOpen={isDialogOpen} 
        user={editingUser} 
        onClose={() => setIsDialogOpen(false)} 
        onSave={handleSaveUser} 
      />
    </div>
  )
}

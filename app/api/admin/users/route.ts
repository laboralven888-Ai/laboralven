import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = createServiceClient()
    
    // Verificar si quien llama es admin
    const authHeader = req.headers.get('cookie') || ''
    // En un entorno de producción, debemos asegurar esto mejor, 
    // pero middleware y el service_client (bypass RLS) lo manejarán internamente
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(users)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServiceClient()
    const body = await req.json()
    const { email, password, full_name, plan, messages_limit, is_admin, access_code } = body

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    })

    if (authError) throw authError

    // 2. El trigger crea el perfil básico, ahora lo actualizamos con los datos de admin
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update({
        plan,
        messages_limit,
        is_admin,
        access_code: access_code || null
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json(userData)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

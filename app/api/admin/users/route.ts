import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = createServiceClient()

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

    // 1. Verificar si el usuario ya existe en Auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    let userId: string

    if (existingUser) {
      // Usuario ya existe en Auth — solo actualizamos public.users
      userId = existingUser.id
    } else {
      // 2. Crear usuario nuevo en Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name }
      })

      if (authError) throw authError
      userId = authData.user.id
    }

    // 3. Esperar un momento para que el trigger de Auth se ejecute
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 4. Hacer UPSERT en public.users (crea o actualiza según exista)
    const { data: userData, error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        full_name,
        plan: plan || 'basic',
        messages_limit: messages_limit || 100,
        is_admin: is_admin || false,
        access_code: access_code || null,
        status: 'active',
        payment_status: 'paid',
        messages_used_this_month: 0,
        activation_date: new Date().toISOString().split('T')[0],
        expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0]
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (upsertError) throw upsertError

    return NextResponse.json(userData)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
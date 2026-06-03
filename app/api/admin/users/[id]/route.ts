import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceClient()
    const body = await req.json()
    const id = params.id

    // Solo actualizar los campos permitidos
    const { 
      full_name, plan, messages_limit, status, payment_status, is_admin, 
      access_code, expiration_date 
    } = body

    const updateData: any = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (plan !== undefined) updateData.plan = plan
    if (messages_limit !== undefined) updateData.messages_limit = messages_limit
    if (status !== undefined) updateData.status = status
    if (payment_status !== undefined) updateData.payment_status = payment_status
    if (is_admin !== undefined) updateData.is_admin = is_admin
    if (access_code !== undefined) updateData.access_code = access_code
    if (expiration_date !== undefined) updateData.expiration_date = expiration_date

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceClient()
    const id = params.id

    // Eliminar de Auth, la tabla public.users lo eliminará por cascade
    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

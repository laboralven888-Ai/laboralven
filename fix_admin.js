const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixAdmin() {
  console.log('Buscando usuarios en Auth...')
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('Error Auth:', authError)
    return
  }

  const users = authData.users
  console.log(`Encontrados ${users.length} usuarios en Auth.`)

  for (const u of users) {
    if (u.email.includes('laboralven888@gmail.com')) {
      console.log(`Fijando privilegios para: ${u.email} (${u.id})`)
      
      const { data, error } = await supabase.from('users').upsert({
        id: u.id,
        email: 'laboralven888@gmail.com',
        full_name: 'Super Admin',
        is_admin: true,
        plan: 'pro',
        messages_limit: 999999,
        status: 'active'
      }).select()

      if (error) console.error('Error Upsert:', error)
      else console.log('Usuario actualizado correctamente:', data)
    }
  }
}

fixAdmin()

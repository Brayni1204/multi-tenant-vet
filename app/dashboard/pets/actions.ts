// Ruta: app/dashboard/pets/actions.ts
'use server'

// OJO: Importamos el createClient genérico para poder usar la clave de administrador
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

export async function createClientWithLogin(formData: FormData) {
    const clientData = {
        name: formData.get('name') as string,
        last_name: formData.get('last_name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        address: formData.get('address') as string,
        org_id: formData.get('org_id') as string,
    }
    const password = formData.get('password') as string

    // CAMBIO CLAVE: Creamos un cliente "Admin" con la Service Role Key.
    // Este cliente tiene permisos para crear usuarios.
    // ¡NUNCA uses la service_role_key en el lado del cliente!
    const supabaseAdmin = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Crear el usuario en Supabase Auth con el cliente admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: clientData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
            full_name: `${clientData.name} ${clientData.last_name}`
        }
    })

    if (authError) {
        return { error: `Error al crear el usuario: ${authError.message}` }
    }

    // 2. Crear el registro del cliente y vincularlo al nuevo user_id
    // Usamos el mismo cliente admin para saltarnos las políticas de RLS si fuera necesario
    const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({ ...clientData, user_id: authData.user.id })
        .select()
        .single()

    if (clientError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return { error: `Error al crear el cliente: ${clientError.message}` }
    }

    return { data: client }
}
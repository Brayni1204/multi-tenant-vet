// Ruta: app/dashboard/pets/actions.ts
'use server'

// Importamos el creador de cliente genérico para usar la clave de servicio
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

    // Creamos un cliente "Admin" que usa la Service Role Key para tener superpoderes.
    // ¡Esto NUNCA debe estar en el código del navegador!
    const supabaseAdmin = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Creamos el usuario en Supabase Auth usando el cliente con permisos de admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: clientData.email,
        password: password,
        email_confirm: true, // Lo damos por confirmado para simplificar
        user_metadata: {
            full_name: `${clientData.name} ${clientData.last_name}`
        }
    })

    if (authError) {
        return { error: `Error al crear el usuario: ${authError.message}` }
    }

    // 2. Creamos el registro del cliente en nuestra tabla 'clients' y lo vinculamos
    const { data: client, error: clientError } = await supabaseAdmin
        .from('profiles')
        .insert({ ...clientData, id: authData.user.id })
        .select()
        .single()

    if (clientError) {
        // Si la segunda parte falla, eliminamos el usuario que acabamos de crear para no dejar datos huérfanos.
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return { error: `Error al crear el cliente: ${clientError.message}` }
    }

    return { data: client }
}
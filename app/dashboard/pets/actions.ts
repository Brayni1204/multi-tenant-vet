// Ruta: app/dashboard/pets/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createClientWithLogin(formData: FormData) {
    const supabase = createClient()

    const clientData = {
        name: formData.get('name') as string,
        last_name: formData.get('last_name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        address: formData.get('address') as string,
        org_id: formData.get('org_id') as string,
    }
    const password = formData.get('password') as string

    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: clientData.email,
        password: password,
        email_confirm: true, // Lo damos por confirmado
        user_metadata: {
            full_name: `${clientData.name} ${clientData.last_name}`
        }
    })

    if (authError) {
        return { error: `Error al crear el usuario: ${authError.message}` }
    }

    // 2. Crear el registro del cliente y vincularlo al nuevo user_id
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({ ...clientData, user_id: authData.user.id })
        .select()
        .single()

    if (clientError) {
        // Si esto falla, eliminamos el usuario que acabamos de crear para no dejar basura
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { error: `Error al crear el cliente: ${clientError.message}` }
    }

    return { data: client }
}
// app/signup/[token]/actions.ts
'use server'

// OJO: Importamos el createClient genérico para poder inicializarlo
// con la clave de administrador.
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ACTIVE_ORG_COOKIE } from '@/lib/org'
import { Database } from '@/lib/database.types'

export async function signup(formData: FormData) {
    const token = formData.get('token') as string
    const companyName = formData.get('companyName') as string
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (token !== process.env.ADMIN_SIGNUP_TOKEN) {
        return { error: 'Token inválido.' }
    }

    // --- CAMBIO IMPORTANTE ---
    // Creamos un cliente "Admin" que usa la Service Role Key.
    // Este cliente tiene permisos para saltarse las políticas de RLS.
    // ¡NUNCA uses la service_role_key en el lado del cliente!
    const supabaseAdmin = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 2. Crear el usuario usando el cliente de Admin.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Lo marcamos como confirmado ya que es un proceso de confianza
        user_metadata: {
            full_name: fullName,
        },
    })

    if (authError) {
        return { error: `Error al crear el usuario: ${authError.message}` }
    }

    const user = authData.user
    if (!user) {
        return { error: 'No se pudo crear el usuario.' }
    }

    // 3. Crear la organización (usando el cliente de Admin)
    const { data: orgData, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({ name: companyName, created_by: user.id })
        .select()
        .single()

    if (orgError) {
        // Si hay un error, es una buena práctica eliminar el usuario que acabamos de crear.
        await supabaseAdmin.auth.admin.deleteUser(user.id)
        return { error: `Error al crear la empresa: ${orgError.message}` }
    }

    const organization = orgData;
    if (!organization) {
        return { error: "No se pudo crear la empresa." };
    }


    // 4. Vincular el usuario a la organización como administrador (usando el cliente de Admin)
    const { error: userOrgError } = await supabaseAdmin
        .from('user_organizations')
        .insert({ user_id: user.id, org_id: organization.id, role: 'admin' })

    if (userOrgError) {
        // Si esto falla, también eliminamos al usuario y la organización para mantener la consistencia.
        await supabaseAdmin.auth.admin.deleteUser(user.id)
        await supabaseAdmin.from('organizations').delete().eq('id', organization.id)
        return { error: `Error al vincular el usuario a la empresa: ${userOrgError.message}` }
    }

    // 5. Iniciar sesión con el usuario recién creado para obtener una sesión válida
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({ email, password });

    if (sessionError || !sessionData.session) {
        return { error: 'No se pudo iniciar sesión después del registro.' };
    }


    // 6. Establecer la organización activa en las cookies
    const cookieStore = await cookies()
    cookieStore.set(ACTIVE_ORG_COOKIE, organization.id, { path: '/' })

    // 7. Redirigir al dashboard
    redirect('/dashboard')
}
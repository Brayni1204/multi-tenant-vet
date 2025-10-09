// Ruta: app/api/signup/route.ts

import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

const ADMIN_SIGNUP_TOKEN = process.env.TECHINNOVATS_KEY

export async function POST(req: NextRequest) {
    const authToken = req.headers.get('Authorization')?.split('Bearer ')[1]

    if (authToken !== ADMIN_SIGNUP_TOKEN) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    try {
        const { company_name, user_email, user_password, user_full_name, subdomain } = await req.json()

        if (!company_name || !user_email || !user_password || !user_full_name || !subdomain) {
            return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
        }

        const supabaseAdmin = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Crear el usuario (el trigger 'handle_new_user' creará su perfil automáticamente)
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: user_email,
            password: user_password,
            email_confirm: true,
            user_metadata: {
                full_name: user_full_name,
            },
        })

        if (userError) {
            return NextResponse.json({ error: `Error al crear usuario: ${userError.message}` }, { status: 400 });
        }

        const user = userData.user;

        // 2. Crear la organización
        const { data: orgData, error: orgError } = await supabaseAdmin
            .from('organizations')
            .insert({ name: company_name, created_by: user.id, subdomain: subdomain })
            .select()
            .single()

        if (orgError) {
            await supabaseAdmin.auth.admin.deleteUser(user.id);
            return NextResponse.json({ error: `Error al crear la empresa: ${orgError.message}` }, { status: 500 });
        }

        // 3. Vincular el usuario a la organización CON EL ROL DE ADMIN
        const { error: linkError } = await supabaseAdmin
            .from('user_organizations')
            .insert({ user_id: user.id, org_id: orgData.id, role: 'admin' })

        if (linkError) {
            await supabaseAdmin.auth.admin.deleteUser(user.id);
            await supabaseAdmin.from('organizations').delete().eq('id', orgData.id);
            return NextResponse.json({ error: `Error al vincular usuario y empresa: ${linkError.message}` }, { status: 500 });
        }

        return NextResponse.json({ message: 'Empresa y admin creados con éxito', org_id: orgData.id }, { status: 201 })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

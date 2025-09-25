// Ruta: app/api/signup/route.ts

import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

// ESTE ES EL TOKEN SECRETO. Guárdalo en tu .env.local
const ADMIN_SIGNUP_TOKEN = process.env.ADMIN_SIGNUP_TOKEN

export async function POST(req: NextRequest) {
    const authToken = req.headers.get('Authorization')?.split('Bearer ')[1]

    // 1. Verificación de Seguridad
    if (authToken !== ADMIN_SIGNUP_TOKEN) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    try {
        const { company_name, user_email, user_password, user_full_name } = await req.json()

        // 2. Validación de Datos
        if (!company_name || !user_email || !user_password || !user_full_name) {
            return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
        }

        // Usamos el Service Role Key para tener permisos de administrador
        // OJO: NUNCA uses esto en el código del cliente/navegador
        const supabaseAdmin = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // Necesitas esta clave en tu .env.local
        )

        // 3. Llamada a la Función de la Base de Datos (Ahora sí la va a encontrar)
        const { data, error } = await supabaseAdmin.rpc('handle_new_company_signup', {
            company_name,
            user_email,
            user_password,
            user_full_name,
        })

        if (error) {
            throw error
        }

        return NextResponse.json({ message: 'Empresa creada con éxito', tenant_id: data }, { status: 201 })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
// Ruta: lib/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../database.types'

export async function createClient() {
    const cookieStore = await cookies() // Obtenemos la instancia de cookies aquí
    // Obtenemos la instancia de cookies aquí

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // AHORA SÍ, USAMOS ASYNC/AWAIT
                async get(name: string) {
                    return cookieStore.get(name)?.value
                },
                async set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Es seguro ignorar este error en Server Components
                    }
                },
                async remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // Lo mismo que 'set'
                    }
                },
            },
        }
    )
}
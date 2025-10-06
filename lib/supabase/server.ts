/* eslint-disable @typescript-eslint/no-unused-vars */
// Ruta: lib/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../database.types'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // CAMBIO: Eliminamos 'async' y 'await'
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                // CAMBIO: Eliminamos 'async' y 'await'
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Ignorar errores en Server Components es seguro
                        // si el middleware refresca la sesión.
                    }
                },
                // CAMBIO: Eliminamos 'async' y 'await'
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // Lo mismo que para 'set'.
                    }
                },
            },
        }
    )
}
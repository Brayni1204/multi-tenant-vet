// Ruta: lib/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../database.types'

// LA FUNCIÓN NO ES ASYNC
export function createClient() {
    // LA LLAMADA A cookies() NO LLEVA AWAIT
    const cookieStore = cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // ESTOS MÉTODOS INTERNOS SÍ DEBEN SER ASYNC
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
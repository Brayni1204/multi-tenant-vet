// Ruta: lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../database.types' // <-- Importamos el mapa

export function createClient() {
    const cookieStore = cookies()

    // Le decimos al cliente que use el mapa con <Database>
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Ignorar error si se llama desde un Server Component
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // Ignorar error si se llama desde un Server Component
                    }
                },
            },
        }
    )
}

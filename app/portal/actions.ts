// Ruta: app/portal/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function portalLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()

    // Obtenemos el host para redirigir al login del subdominio correcto
    const headersList = headers()
    const host = (await headersList).get('host')

    // Usamos el protocolo https para producción, pero en local http funcionará
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

    return redirect(`${protocol}://${host}/login`)
}
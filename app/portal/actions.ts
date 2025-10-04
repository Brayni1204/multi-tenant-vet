// Ruta: app/portal/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function portalLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()

    // Obtenemos el host para redirigir al login del subdominio correcto
    const headersList = await headers()
    const host = headersList.get('host')

    return redirect(`http://${host}/login`)
}
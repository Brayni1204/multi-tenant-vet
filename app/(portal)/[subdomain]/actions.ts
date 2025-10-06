// Ruta: app/[subdomain]/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function portalLogout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    // Redirigir a '/login' es suficiente, Next.js lo resolverá
    // como 'subdominio.localhost:3000/login'
    return redirect('/login')
}
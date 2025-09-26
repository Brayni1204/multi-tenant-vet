/* eslint-disable @typescript-eslint/no-unused-vars */
// Ruta: lib/org.ts

import 'server-only'
import { cookies } from 'next/headers'
import { createClient } from './supabase/server'

export const ACTIVE_ORG_COOKIE = 'active_org'

export type Org = {
    id: string
    name: string
}

export async function get_active_org(): Promise<{
    orgs: Org[]
    activeOrg: Org | null
}> {
    const cookieStore = await cookies() // No es necesario 'await' aquí
    // No es necesario 'await' aquí
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { orgs: [], activeOrg: null }
    }

    const { data, error } = await supabase
        .from('user_organizations')
        .select('organizations ( id, name )')
        .eq('user_id', user.id)

    if (error) {
        console.error('Error buscando empresas del usuario:', error)
        return { orgs: [], activeOrg: null }
    }

    // El ?. y el filter(Boolean) se aseguran de que no haya nulos
    const formattedOrgs = data.map((item) => item.organizations).filter(Boolean) as Org[]

    let activeOrg: Org | null = null
    const active_org_id = cookieStore.get(ACTIVE_ORG_COOKIE)?.value

    if (active_org_id) {
        activeOrg = formattedOrgs.find((org) => org.id === active_org_id) ?? null
    }

    // --- ESTA ES LA LÓGICA MEJORADA ---
    // Si después de todo, no hay una organización activa PERO el usuario sí tiene organizaciones,
    // seleccionamos la primera como activa y guardamos la cookie para futuras visitas.
    if (!activeOrg && formattedOrgs.length > 0) {
        activeOrg = formattedOrgs[0]
        // Usamos try...catch por si el 'set' se ejecuta en un entorno donde no puede modificar cookies (como durante un render estático)
        try {
            cookieStore.set(ACTIVE_ORG_COOKIE, activeOrg.id, { path: '/' })
        } catch (e) {
            // En un Server Component que se renderiza estáticamente, esto podría fallar.
            // No es un error crítico, la UI simplemente no tendrá una org pre-seleccionada.
            console.log('Could not set active org cookie in a statically rendered component.')
        }
    }

    return { orgs: formattedOrgs, activeOrg }
}
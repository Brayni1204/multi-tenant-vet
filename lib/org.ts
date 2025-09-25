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
    const cookieStore = await cookies()
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { orgs: [], activeOrg: null }
    }

    // --- CAMBIO CLAVE AQUÍ ---
    // Cambiamos 'user_tenants' y 'tenants' por las nuevas tablas.
    const { data, error } = await supabase
        .from('user_organizations')
        .select('organizations ( id, name )') // <-- Apuntamos a la tabla 'organizations'
        .eq('user_id', user.id)

    if (error) {
        console.error('Error buscando empresas del usuario:', error)
        return { orgs: [], activeOrg: null }
    }

    // El resto de la lógica ya es compatible con la nueva estructura
    const formattedOrgs = data.map((item) => item.organizations).filter(Boolean) as Org[]

    let activeOrg: Org | null = null
    const active_org_id = cookieStore.get(ACTIVE_ORG_COOKIE)?.value

    if (active_org_id) {
        activeOrg = formattedOrgs.find((org) => org.id === active_org_id) ?? null
    }

    if (!activeOrg && formattedOrgs.length > 0) {
        activeOrg = formattedOrgs[0]
        cookieStore.set(ACTIVE_ORG_COOKIE, activeOrg.id, { path: '/' })
    }

    return { orgs: formattedOrgs, activeOrg }
}
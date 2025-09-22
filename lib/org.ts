// Ruta: lib/org.ts

import 'server-only'

import { cookies } from 'next/headers'
import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'

export const ACTIVE_ORG_COOKIE = 'active_org'

export type Org = {
    id: string
    name: string
}
// Ruta: lib/supabase/middleware.ts
export async function get_active_org(): Promise<{
    orgs: Org[]
    activeOrg: Org | null
}> {
    const cookieStore = cookies()
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { orgs: [], activeOrg: null }
    }

    const { data, error } = await supabase
        .from('user_tenants')
        .select('tenants ( id, name )')
        .eq('user_id', user.id)

    if (error) {
        console.error('Error buscando empresas del usuario:', error)
        return { orgs: [], activeOrg: null }
    }

    const formattedOrgs = data.map(item => item.tenants).filter(Boolean) as Org[]

    let activeOrg: Org | null = null
    const active_org_id = cookieStore.get(ACTIVE_ORG_COOKIE)?.value

    if (active_org_id) {
        activeOrg = formattedOrgs.find((org) => org.id === active_org_id) ?? null
    }

    if (!activeOrg && formattedOrgs.length > 0) {
        activeOrg = formattedOrgs[0]
        await set_active_org(activeOrg.id)
    }

    return { orgs: formattedOrgs, activeOrg }
}

export async function set_active_org(org_id: string) {
    'use server'
    cookies().set(ACTIVE_ORG_COOKIE, org_id, { path: '/' })
    redirect('/dashboard')
}
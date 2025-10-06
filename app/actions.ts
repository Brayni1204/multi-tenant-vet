// Ruta: app/actions.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ACTIVE_ORG_COOKIE } from '@/lib/org'

export async function set_active_org(org_id: string) {
    (await cookies()).set(ACTIVE_ORG_COOKIE, org_id, { path: '/' })
    // Redirigimos para que la página se actualice con la nueva selección
    redirect('/dashboard')
}

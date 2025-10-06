// Ruta: app/dashboard/actions.ts

'use server' // <-- ESTO ES LO MÁS IMPORTANTE. Le dice a Next.js que este archivo es sagrado y solo del servidor.

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ACTIVE_ORG_COOKIE } from '@/lib/org'

export async function set_active_org(org_id: string) {
    (await cookies()).set(ACTIVE_ORG_COOKIE, org_id, { path: '/' })
    redirect('/dashboard') // Redirigimos para que la página se actualice con la nueva selección
}
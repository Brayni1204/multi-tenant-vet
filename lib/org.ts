import { cookies } from 'next/headers'
export const ACTIVE_ORG_COOKIE = 'active_org'
export const getActiveOrg = () => cookies().get(ACTIVE_ORG_COOKIE)?.value || null
import { cookies } from 'next/headers'

export const ACTIVE_ORG_COOKIE = 'active_org'

export const getActiveOrg = async () => {
    const store = await cookies()
    return store.get(ACTIVE_ORG_COOKIE)?.value ?? null
}

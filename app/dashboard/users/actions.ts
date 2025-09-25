// app/dashboard/users/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function addUserToOrg(formData: FormData) {
    const orgId = formData.get('orgId') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string

    const supabase = createClient()

    // 1. Invitar al usuario a la aplicación
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email)

    if (inviteError) {
        return { error: `Error al invitar al usuario: ${inviteError.message}` }
    }

    const user = inviteData.user
    if (!user) {
        return { error: 'No se pudo invitar al usuario.' }
    }

    // 2. Vincular el usuario a la organización
    const { error: userOrgError } = await supabase
        .from('user_organizations')
        .insert({ user_id: user.id, org_id: orgId, role })

    if (userOrgError) {
        return { error: `Error al vincular el usuario a la organización: ${userOrgError.message}` }
    }

    return { success: `Se ha enviado una invitación a ${email}.` }
}
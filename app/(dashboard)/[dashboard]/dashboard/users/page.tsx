// app/dashboard/users/page.tsx
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UsersList from './UsersList'
import AddUserForm from './AddUserForm'

export default async function UsersPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const store = cookies()
    const activeOrg = (await store).get('active_org')?.value ?? null

    if (!activeOrg) {
        return (
            <div className="p-4 border rounded-xl bg-yellow-50">
                Selecciona o crea una clínica para gestionar usuarios.
            </div>
        )
    }

    // Verificar si el usuario actual es administrador de la organización activa
    const { data: userOrg, error: userOrgError } = await supabase
        .from('user_organizations')
        .select('role')
        .eq('user_id', user.id)
        .eq('org_id', activeOrg)
        .single()

    if (userOrgError || userOrg?.role !== 'admin') {
        return (
            <div className="p-4 border rounded-xl bg-red-50">
                No tienes permisos para gestionar usuarios en esta organización.
            </div>
        )
    }

    return (
        <div className="grid gap-6">
            <h1 className="text-xl font-semibold">Gestionar Usuarios</h1>
            <AddUserForm orgId={activeOrg} />
            <UsersList orgId={activeOrg} />
        </div>
    )
}
// Ruta: app/(dashboard)/[subdomain]/dashboard/pets/components/PetsAndOwners.tsx
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UsersList from './UsersList'
import AddUserForm from './AddUserForm'
import { Card, CardContent } from '@/components/ui/card'

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
            <Card className="p-6 bg-red-50 border-red-300">
                <CardContent>
                    <p className="text-red-800 font-semibold">
                        Acceso Denegado: No tienes permisos de administrador para gestionar usuarios en esta organización.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Gestionar Usuarios</h1>

            {/* Colocamos el formulario de añadir usuario primero */}
            <Card className="shadow-lg p-6">
                <AddUserForm orgId={activeOrg} />
            </Card>

            {/* Luego la lista de usuarios */}
            <UsersList orgId={activeOrg} />
        </div>
    )
}
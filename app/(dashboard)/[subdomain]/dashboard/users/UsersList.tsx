// app/dashboard/users/UsersList.tsx
import { createClient } from '@/lib/supabase/server'

type User = {
    id: string
    full_name: string | null
    email: string | undefined
    role: string
}

export default async function UsersList({ orgId }: { orgId: string }) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('user_organizations')
        .select('role, profiles (id, full_name, email)')
        .eq('org_id', orgId)

    if (error) {
        return <p>Error al cargar los usuarios.</p>
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users: User[] = data.map((item: any) => ({
        id: item.profiles.id,
        full_name: item.profiles.full_name,
        email: item.profiles.email,
        role: item.role,
    }))

    return (
        <div className="bg-white border rounded-xl">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Rol</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b last:border-0">
                            <td className="p-3">{user.full_name}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3">{user.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
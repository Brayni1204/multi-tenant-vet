// Ruta: app/(dashboard)/[subdomain]/dashboard/users/UsersList.tsx
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Mail } from 'lucide-react';

type User = {
    id: string
    full_name: string | null
    email: string | undefined
    role: string
}

export default async function UsersList({ orgId }: { orgId: string }) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('user_organizations')
        .select('role, profiles (id, full_name, email)')
        .eq('org_id', orgId)

    if (error) {
        return <p className="text-red-500">Error al cargar los usuarios.</p>
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users: User[] = data.map((item: any) => ({
        id: item.profiles.id,
        full_name: item.profiles.full_name,
        email: item.profiles.email,
        role: item.role,
    }))

    const getRoleVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'client':
                return 'default';
            case 'veterinarian':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <Card className="shadow-lg p-0 border-none">
            <CardHeader className="border-b">
                <CardTitle className="text-xl">Miembros de la Clínica</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Detalles</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                            <UserIcon className="h-4 w-4 text-gray-500" />
                                            {user.full_name || 'Usuario sin nombre'}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                            <Mail className="h-3 w-3" />
                                            {user.email || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={getRoleVariant(user.role)} className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer hover:underline">
                                        {/* Aquí se pueden añadir botones de editar rol o eliminar */}
                                        Editar
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

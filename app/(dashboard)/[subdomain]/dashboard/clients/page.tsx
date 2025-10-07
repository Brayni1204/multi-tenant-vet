// Ruta: app/(dashboard)/[subdomain]/dashboard/clients/page.tsx

import { createClient } from '@/lib/supabase/server'
import { get_active_org } from '@/lib/org'
// Vamos a deshabilitar el formulario por ahora, lo arreglaremos después.
// import ClientForm from '@/components/ClientForm' 
import { redirect } from 'next/navigation'

export default async function ClientsPage() {
    const supabase = await createClient()
    const { activeOrg } = await get_active_org()

    if (!activeOrg) {
        return redirect('/dashboard')
    }

    // --- CORRECCIÓN DE LA CONSULTA ---
    // Buscamos en user_organizations y traemos la información de profiles.
    const { data: userOrgs, error } = await supabase
        .from('user_organizations')
        .select('role, profiles (*)') // Seleccionamos el rol y todos los datos del perfil anidado
        .eq('org_id', activeOrg.id)

    if (error) {
        console.error('Error al cargar clientes:', error)
    }

    // Filtramos para obtener solo los perfiles de los clientes
    const clients = userOrgs
        ?.filter(uo => uo.role === 'client' && uo.profiles)
        .map(uo => uo.profiles) ?? []


    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
                {/* <ClientForm activeOrgId={activeOrg.id} />  // Temporalmente deshabilitado */}
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clients && clients.length > 0 ? (
                                clients.map((client) => (
                                    <tr key={client!.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{client!.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{client!.phone ?? 'N/A'}</td>
                                        {/* El email está en auth.users, no en profiles, por eso no lo mostramos por ahora */}
                                        <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                        No se encontraron clientes. ¡Añade el primero!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
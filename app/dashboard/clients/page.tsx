// Ruta: app/dashboard/clients/page.tsx

import { createClient } from '@/lib/supabase/server'
import { get_active_org } from '@/lib/org'
import ClientForm from '@/components/ClientForm'
import { redirect } from 'next/navigation'

export default async function ClientsPage() {
    const supabase = createClient()
    const { activeOrg } = await get_active_org()

    if (!activeOrg) {
        // Si no hay empresa activa, no podemos hacer nada.
        // Esto podría pasar si un usuario no pertenece a ninguna empresa.
        return redirect('/dashboard')
    }

    // La magia de RLS: Pedimos los clientes sin filtrar.
    // Supabase automáticamente solo nos dará los de la empresa activa.
    const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error al cargar clientes:', error)
        // Podrías mostrar un mensaje de error aquí
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
                {/* El formulario para añadir nuevos clientes */}
                <ClientForm activeOrgId={activeOrg.id} />
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
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{client.name} {client.last_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{client.phone ?? 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{client.email ?? 'N/A'}</td>
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
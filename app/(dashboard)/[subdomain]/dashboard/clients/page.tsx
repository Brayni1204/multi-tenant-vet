// Ruta: app/(dashboard)/[subdomain]/dashboard/clients/page.tsx
import { createClient } from '@/lib/supabase/server';
import { get_active_org } from '@/lib/org';
import { redirect } from 'next/navigation';
import AddClientByDniForm from '@/components/AddClientByDniForm';

export default async function ClientsPage({ userEmail }: { userEmail?: string }) {
    const supabase = await createClient();
    const { activeOrg } = await get_active_org();

    if (!activeOrg) {
        return redirect('/dashboard');
    }

    // --- ESTA ES LA CONSULTA CORRECTA USANDO LA FUNCIÓN RPC ---
    const { data: clients, error } = await supabase.rpc('get_clients_for_admin', {
        target_org_id: activeOrg.id
    });

    if (error) {
        console.error('Error al cargar clientes:', error);
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
            </div>

            {userEmail !== 'demo@demo.com' && (
                <AddClientByDniForm orgId={activeOrg.id} />
            )}

            <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clients && clients.length > 0 ? (
                                clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{client.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{client.dni ?? 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{client.phone ?? 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                        No se encontraron clientes. ¡Añade el primero con su DNI!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
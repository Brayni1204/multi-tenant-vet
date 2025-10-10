// Ruta: app/(dashboard)/[subdomain]/dashboard/clients/page.tsx
import { createClient } from '@/lib/supabase/server';
import { get_active_org } from '@/lib/org';
import { redirect } from 'next/navigation';
import AddClientByDniForm from '@/components/AddClientByDniForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ClientData = {
    dni: string | null;
    full_name: string | null;
    id: string;
    phone: string | null;
}

export default async function ClientsPage({ }: { userEmail?: string }) {
    const supabase = await createClient();
    const { activeOrg } = await get_active_org();

    if (!activeOrg) {
        return redirect('/dashboard');
    }

    const { data: clients, error } = await supabase.rpc('get_clients_for_admin', {
        target_org_id: activeOrg.id
    });

    if (error) {
        console.error('Error al cargar clientes:', error);
    }

    const typedClients: ClientData[] = clients as ClientData[] || [];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>

            {/* Componente para añadir cliente por DNI */}
            <AddClientByDniForm orgId={activeOrg.id} />

            <Card className="p-0 border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="text-lg">Lista de Clientes Registrados</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre Completo</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DNI</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {typedClients.length > 0 ? (
                                    typedClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.full_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.dni ?? 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.phone ?? 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer hover:underline">Ver Detalles</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                            No se encontraron clientes. ¡Añade el primero con su DNI!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
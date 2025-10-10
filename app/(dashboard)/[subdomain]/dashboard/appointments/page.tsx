// Ruta: app/(dashboard)/[subdomain]/dashboard/appointments/page.tsx
import { createClient } from '@/lib/supabase/server';
import { get_active_org, Organization } from '@/lib/org';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Definición de tipos para la función RPC o la consulta de citas
type AppointmentWithDetails = {
    id: string;
    starts_at: string;
    ends_at: string;
    status: string;
    reason: string | null;
    pets: { name: string, species: string } | null;
    veterinarians: { full_name: string } | null;
    owner: { full_name: string } | null;
};

export default async function AppointmentsPage() {
    const { activeOrg } = await get_active_org();
    const supabase = await createClient();

    if (!activeOrg) {
        return redirect('/dashboard');
    }

    // Consulta de citas (limitada por ahora)
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
            id,
            starts_at,
            ends_at,
            status,
            reason,
            pets ( name, species ),
            veterinarians ( full_name ),
            owner:profiles ( full_name )
        `)
        .eq('org_id', activeOrg.id)
        .order('starts_at', { ascending: false });

    if (error) {
        console.error('Error fetching appointments:', error);
    }

    const typedAppointments: AppointmentWithDetails[] = appointments as AppointmentWithDetails[] || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <CalendarIcon className="h-7 w-7 text-blue-600" />
                    Citas Programadas
                </h1>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" /> Nueva Cita
                </Button>
            </div>

            {/* Aquí iría la vista de calendario o la lista detallada */}
            <Card className="shadow-lg p-0">
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Próximas Citas ({typedAppointments.length})</h2>
                    {typedAppointments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 border rounded-lg bg-gray-50">
                            No hay citas programadas para esta clínica.
                        </p>
                    ) : (
                        // Muestra una tabla simplificada de citas
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Mascota</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Dueño</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Veterinario</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {typedAppointments.map((appt) => (
                                        <tr key={appt.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(appt.starts_at).toLocaleString()}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{appt.pets?.name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{appt.owner?.full_name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{appt.veterinarians?.full_name ?? 'Sin asignar'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <Badge variant={appt.status === 'scheduled' ? 'default' : 'secondary'} className="capitalize">{appt.status}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

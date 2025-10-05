// Ruta: app/portal/[subdomain]/citas/page.tsx

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, PawPrint } from "lucide-react";
import { redirect } from "next/navigation";

export default async function MisCitasPage() {
    const supabase = createClient();

    // Obtenemos el usuario actual
    const { data: { user } } = await supabase.auth.getUser();

    // Aunque el layout ya protege la ruta, es buena práctica verificar de nuevo.
    if (!user) {
        return redirect('/login');
    }

    // Buscamos el perfil de cliente del usuario para obtener su client_id
    const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!client) {
        return <p>No se encontró tu perfil de cliente.</p>;
    }

    // ¡La consulta clave! Buscamos las citas de este cliente.
    // Usamos select() para obtener datos de las tablas relacionadas.
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
            id,
            starts_at,
            status,
            reason,
            pets ( name, species ),
            veterinarians ( full_name )
        `)
        .eq('client_id', client.id) // Filtramos por el ID del cliente
        .order('starts_at', { ascending: false }); // Mostramos las más recientes primero

    if (error) {
        console.error("Error fetching appointments: ", error);
        return <p>Error al cargar las citas.</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Citas</h1>
            {appointments.length === 0 ? (
                <Card className="text-center">
                    <CardContent className="p-8">
                        <p className="text-gray-600">No tienes ninguna cita programada o pasada.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appt) => (
                        <Card key={appt.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <PawPrint className="h-5 w-5 text-blue-600" />
                                            {appt.pets?.name ?? 'Mascota eliminada'} ({appt.pets?.species ?? 'N/A'})
                                        </CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Atendido por: {appt.veterinarians?.full_name ?? 'Sin asignar'}
                                        </p>
                                    </div>
                                    <Badge variant={appt.status === 'scheduled' ? 'default' : 'secondary'}>
                                        {appt.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4">{appt.reason ?? 'Sin motivo especificado.'}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(appt.starts_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{new Date(appt.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
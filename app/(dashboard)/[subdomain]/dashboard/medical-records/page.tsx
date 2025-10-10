// Ruta: app/(dashboard)/[subdomain]/dashboard/medical-records/page.tsx
import { createClient } from '@/lib/supabase/server';
import { get_active_org } from '@/lib/org';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PetWithSummary = {
    id: string;
    name: string;
    species: string;
    owner_id: string;
    owner: { full_name: string } | null;
    total_appointments: number;
};

export default async function MedicalRecordsPage() {
    const { activeOrg } = await get_active_org();
    const supabase = await createClient();

    if (!activeOrg) {
        return redirect('/dashboard');
    }

    // Nota: Para una funcionalidad real, usarías una función compleja de Postgres/RPC
    // para obtener el conteo de citas de cada mascota de forma eficiente.
    const { data: pets, error } = await supabase
        .from('pets')
        .select(`
            id,
            name,
            species,
            owner_id,
            owner:profiles ( full_name )
        `)
        .eq('org_id', activeOrg.id)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching pets for records:', error);
    }

    const petsWithSummary: PetWithSummary[] = (pets as unknown as PetWithSummary[] || []).map(pet => ({
        ...pet,
        total_appointments: 0 // Placeholder: Esta data debe venir de una RPC/JOIN eficiente en un proyecto real.
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Stethoscope className="h-7 w-7 text-green-600" />
                Historiales Clínicos
            </h1>
            <p className="text-gray-600">Selecciona una mascota para ver su historial médico completo.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {petsWithSummary.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 py-10 border rounded-lg bg-gray-50">
                        No hay mascotas registradas en esta clínica.
                    </p>
                ) : (
                    petsWithSummary.map((pet) => (
                        <Card key={pet.id} className="shadow-md hover:shadow-lg transition-shadow border-green-200">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <PawPrint className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-500">Citas: {pet.total_appointments}</span>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <CardTitle className="text-lg font-semibold">{pet.name} ({pet.species})</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">Dueño: {pet.owner?.full_name ?? 'N/A'}</p>
                                <Button size="sm" className="mt-4 w-full bg-green-600 hover:bg-green-700">Ver Historial Completo</Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

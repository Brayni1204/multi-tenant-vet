// Ruta: app/dashboard/pets/page.tsx

import { createClient } from '@/lib/supabase/server'
import { get_active_org } from '@/lib/org'

import PetsAndOwners from '../pets/components/PetsAndOwners' // Crearemos este componente a continuación

export default async function PetsPage() {
    const supabase = createClient()
    const { activeOrg } = await get_active_org()

    if (!activeOrg) {
        return (
            <div className="p-4 border rounded-xl bg-yellow-50">
                Selecciona o crea una clínica para gestionar mascotas.
            </div>
        )
    }

    // Obtenemos las mascotas y clientes (dueños) que pertenecen a la organización activa
    // RLS (Row Level Security) se encargará de filtrar los datos automáticamente
    const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('*, clients (*)') // Obtenemos la mascota y su cliente asociado
        .order('name', { ascending: true })

    const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })

    if (petsError || clientsError) {
        console.error('Error fetching data:', petsError || clientsError)
        // Aquí podrías mostrar un mensaje de error
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Mascotas y Dueños</h1>
            </div>
            {/* Pasamos los datos al componente del lado del cliente */}
            <PetsAndOwners
                initialPets={pets || []}
                initialClients={clients || []}
                activeOrgId={activeOrg.id}
            />
        </div>
    )
}
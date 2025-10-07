// Ruta: app/(dashboard)/[subdomain]/dashboard/pets/page.tsx
import { createClient } from '@/lib/supabase/server'
import { get_active_org } from '@/lib/org'
import PetsAndOwners from './components/PetsAndOwners'

export default async function PetsPage() {
    const supabase = await createClient()
    const { activeOrg } = await get_active_org()

    if (!activeOrg) {
        return (
            <div className="p-4 border rounded-xl bg-yellow-50">
                Selecciona o crea una clínica para gestionar.
            </div>
        )
    }

    // Obtenemos las mascotas y su perfil de dueño asociado
    const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('*, owner:profiles (*)') // Obtenemos la mascota y su perfil de dueño
        .eq('org_id', activeOrg.id)
        .order('name', { ascending: true })

    // Obtenemos todos los perfiles que son 'clients' en esta organización
    const { data: ownersData, error: ownersError } = await supabase
        .from('user_organizations')
        .select('profile:profiles (*)')
        .eq('org_id', activeOrg.id)
        .eq('role', 'client');

    const owners = ownersData ? ownersData.map(item => item.profile).filter(Boolean) : [];

    if (petsError || ownersError) {
        console.error('Error fetching data:', petsError || ownersError)
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Mascotas y Dueños</h1>
            </div>
            {/* Pasamos los datos al componente del lado del cliente */}
            <PetsAndOwners
                initialPets={pets || []}
                initialOwners={owners || []} // <-- CORREGIDO
                activeOrgId={activeOrg.id}
            />
        </div>
    )
}
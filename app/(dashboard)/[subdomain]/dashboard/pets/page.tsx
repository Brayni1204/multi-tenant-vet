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

    const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('*, owner:profiles (*)')
        .eq('org_id', activeOrg.id)
        .order('name', { ascending: true })

    // --- CORRECCIÓN AQUÍ ---
    // Obtenemos los perfiles que pertenecen a la organización activa.
    const { data: ownersData, error: ownersError } = await supabase
        .from('profiles')
        .select('*, user_organizations!inner(org_id, role)')
        .eq('user_organizations.org_id', activeOrg.id)
        .eq('user_organizations.role', 'client')

    if (petsError || ownersError) {
        console.error('Error fetching data:', petsError || ownersError)
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Mascotas y Dueños</h1>
            </div>
            <PetsAndOwners
                initialPets={pets || []}
                initialOwners={ownersData || []} // Pasamos los perfiles de dueños
                activeOrgId={activeOrg.id}
            />
        </div>
    )
}
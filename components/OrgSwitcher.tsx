// Ruta: components/OrgSwitcher.tsx

'use client'

import { type Org } from '@/lib/org'
// ¡AQUÍ ESTÁ EL CAMBIO! Importamos la acción desde su nuevo archivo.
import { set_active_org } from '@/app/[subdomain]/dashboard/actions'

export default function OrgSwitcher({
    orgs,
    activeOrg,
}: {
    orgs: Org[]
    activeOrg: Org | null
}) {
    const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const org_id = e.target.value
        // Llamamos a la Server Action. Ahora sí funciona.
        set_active_org(org_id)
    }

    return (
        <div className="flex items-center gap-2">
            <select
                name="org"
                id="org"
                value={activeOrg?.id ?? ''}
                onChange={handleOrgChange}
                className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {orgs.map((org) => (
                    <option key={org.id} value={org.id}>
                        {org.name}
                    </option>
                ))}
            </select>
        </div>
    )
}
// Ruta: components/OrgSwitcher.tsx
'use client'

import { type Org } from '@/lib/org'
// ¡CORRECCIÓN! Importamos la acción desde el nuevo archivo central.
import { set_active_org } from '@/app/actions'

export default function OrgSwitcher({
    orgs,
    activeOrg,
}: {
    orgs: Org[]
    activeOrg: Org | null
}) {
    const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const org_id = e.target.value
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
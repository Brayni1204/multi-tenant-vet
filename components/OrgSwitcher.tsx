// Ruta: components/OrgSwitcher.tsx

'use client'; // Esto le dice a Next.js: "Este componente es interactivo, se ejecuta en el navegador"

import { type Org, set_active_org } from '@/lib/org';

export default function OrgSwitcher({
    orgs,
    activeOrg,
}: {
    orgs: Org[];
    activeOrg: Org | null;
}) {
    const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const org_id = e.target.value;
        // Cuando el usuario cambia la selección, llamamos a la función del servidor.
        set_active_org(org_id);
    };

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
    );
}
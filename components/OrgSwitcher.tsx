'use client'

// Importamos el tipo Organization (el tipo correcto)
import { Organization } from '@/lib/org'
import { set_active_org } from '@/app/actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Importamos los componentes Select

export default function OrgSwitcher({
    orgs,
    activeOrg,
}: {
    // Usamos el tipo corregido: Organization
    orgs: Organization[]
    activeOrg: Organization | null
}) {
    // La función Select de shadcn devuelve el valor, no el evento
    const handleOrgChange = (value: string) => {
        set_active_org(value)
    }

    return (
        <div className="flex items-center gap-2 w-full">
            {/* Usamos el componente Select mejorado */}
            <Select onValueChange={handleOrgChange} value={activeOrg?.id ?? ''}>
                <SelectTrigger className="w-full h-10 px-4 text-base font-semibold border-gray-200 shadow-sm transition-all hover:border-blue-300">
                    <SelectValue placeholder="Seleccionar Clínica" />
                </SelectTrigger>
                <SelectContent>
                    {orgs.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                            {org.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

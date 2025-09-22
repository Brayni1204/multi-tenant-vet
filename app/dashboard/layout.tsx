import OrgSwitcher from '@/components/OrgSwitcher'
import { createClient } from '@/lib/supabase/server'
import { get_active_org } from '@/lib/org'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // 1. Obtenemos los datos en el Servidor
    const { orgs, activeOrg } = await get_active_org()

    return (
        <div>
            <nav className="border-b p-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold">{activeOrg?.name ?? 'Dashboard'}</h1>
                {/* 2. Pasamos los datos como props al Componente de Cliente */}
                <OrgSwitcher orgs={orgs} activeOrg={activeOrg} />
            </nav>
            <div className="p-4">{children}</div>
        </div>
    )
}

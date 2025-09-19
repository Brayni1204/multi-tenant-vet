import { ReactNode } from 'react'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrgSwitcher from '@/components/OrgSwitcher'


export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const supabase = createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) redirect('/login')


    // Cargamos orgs del usuario
    const { data: orgs } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name')


    return (
        <div className="min-h-dvh">
            <header className="sticky top-0 bg-white border-b">
                <div className="mx-auto max-w-5xl flex items-center justify-between p-4">
                    <strong>Vet Clinic</strong>
                    <OrgSwitcher orgs={orgs || []} />
                </div>
            </header>
            <main className="mx-auto max-w-5xl p-4">{children}</main>
        </div>
    )
}
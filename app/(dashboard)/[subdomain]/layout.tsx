import { createClient } from "@/lib/supabase/server";
import { get_active_org } from "@/lib/org";
import { redirect } from "next/navigation";
import { Metadata } from 'next';
import { DashboardSidebar } from "@/components/DashboardSidebar"; // Importa el nuevo componente

export async function generateMetadata({ params }: { params: { subdomain: string } }): Promise<Metadata> {
    const supabase = await createClient();
    const { subdomain } = await params;

    const { data: organization } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('subdomain', subdomain)
        .single();

    return {
        title: organization?.name ? `${organization.name} | Portal Administrativo` : 'Portal Administrativo',
    };
}

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { subdomain: string };
}) {

    const supabase = await createClient();
    const { subdomain } = await params;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${subdomain}/login`);
    }

    const { orgs, activeOrg } = await get_active_org();

    if (!activeOrg) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-600">No perteneces a ninguna organización o no se ha podido cargar.</p>
            </div>
        );
    }

    const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('role')
        .eq('user_id', user.id)
        .eq('org_id', activeOrg.id)
        .single();

    if (userOrg?.role !== 'admin') {
        redirect(`/`);
    }

    return (
        <div className="min-h-screen w-full flex bg-[#f7f8f9]">
            <DashboardSidebar subdomain={subdomain} orgs={orgs} activeOrg={activeOrg} />
            <main className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
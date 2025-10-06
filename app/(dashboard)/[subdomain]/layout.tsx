// Ruta: app/(dashboard)/[subdomain]/layout.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { get_active_org } from "@/lib/org";
import { logout } from "@/app/auth/actions";
import OrgSwitcher from "@/components/OrgSwitcher";
import { Users, Dog, Home, LogOut } from "lucide-react";
import { redirect } from "next/navigation";

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
            <div className="flex h-screen items-center justify-center">
                <p>No perteneces a ninguna organización o no se ha podido cargar.</p>
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
        redirect(`/${subdomain}`);
    }

    return (
        <div className="min-h-screen w-full flex bg-gray-50">
            <aside className="w-64 flex-shrink-0 border-r bg-white flex-col hidden sm:flex">
                <div className="h-16 flex items-center px-4 border-b">
                    <OrgSwitcher orgs={orgs} activeOrg={activeOrg} />
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-all hover:bg-gray-100">
                        <Home className="h-4 w-4" />
                        Inicio
                    </Link>
                    <Link href="/dashboard/clients" className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-all hover:bg-gray-100">
                        <Users className="h-4 w-4" />
                        Clientes
                    </Link>
                    <Link href="/dashboard/pets" className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-all hover:bg-gray-100">
                        <Dog className="h-4 w-4" />
                        Mascotas
                    </Link>
                    <Link href="/dashboard/users" className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-all hover:bg-gray-100">
                        <Users className="h-4 w-4" />
                        Usuarios
                    </Link>
                </nav>
                <div className="mt-auto p-4 border-t">
                    <form action={logout}>
                        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50">
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </aside>
            <main className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

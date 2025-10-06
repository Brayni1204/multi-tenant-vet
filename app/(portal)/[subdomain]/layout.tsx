// Ruta: app/[subdomain]/layout.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PawPrint, LogOut } from "lucide-react";
import { portalLogout } from "./actions";

export default async function PortalLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { subdomain: string };
}) {
    const supabase = await createClient();
    const { subdomain } = await params;

    const { data: { user } } = await supabase.auth.getUser();

    const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('subdomain', subdomain)
        .single();

    if (orgError || !organization) {
        return <div><h1>Portal no encontrado</h1></div>;
    }

    let userRole: string | null = null;
    if (user) {
        const { data: orgRoleData } = await supabase
            .from('user_organizations')
            .select('role')
            .eq('user_id', user.id)
            .eq('org_id', organization.id)
            .single();
        userRole = orgRoleData?.role ?? null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="bg-white shadow-md z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <PawPrint className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-800">{organization.name}</span>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/" className="text-gray-600 hover:text-blue-600">Inicio</Link>

                        {user && (
                            <Link href="/citas" className="text-gray-600 hover:text-blue-600">Mis Citas</Link>
                        )}

                        {userRole === 'admin' && (
                            <Link href="/dashboard" className="text-sm font-medium text-green-600 hover:text-green-800">
                                Ir al Dashboard
                            </Link>
                        )}

                        {user ? (
                            <form action={portalLogout}>
                                <button type="submit" className="flex items-center text-sm text-red-500 hover:text-red-700">
                                    <LogOut className="h-4 w-4 mr-1" />
                                    Salir
                                </button>
                            </form>
                        ) : (
                            <Link href="/login" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                Ingresar
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
            <footer className="text-center p-4 bg-white border-t text-sm text-gray-500">
                © {new Date().getFullYear()} {organization.name}. Todos los derechos reservados.
            </footer>
        </div>
    );
}
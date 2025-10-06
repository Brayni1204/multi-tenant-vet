// Ruta: app/portal/[subdomain]/layout.tsx

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PawPrint, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { portalLogout } from "./actions"; // Crearemos esto en el siguiente paso

export default async function PortalLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { subdomain: string };
}) {
    const supabase = await createClient();
    const { subdomain } = params;


    // 1. Verificamos si hay un usuario logueado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Si no hay usuario, lo mandamos a la página de login de este portal
        return redirect(`/login`);
    }

    // 2. Obtenemos la organización basada en el subdominio
    const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('subdomain', subdomain)
        .single();

    if (orgError || !organization) {
        return <div><h1>Portal no encontrado</h1></div>;
    }

    // 3. Verificamos que el usuario logueado es un cliente de ESTA organización
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, org_id')
        .eq('user_id', user.id)
        .single();

    // Si el usuario no es un cliente o no pertenece a esta organización, lo sacamos.
    if (clientError || !client || client.org_id !== organization.id) {
        // Podríamos redirigir a una página de "acceso denegado", pero por ahora lo mandamos al login.
        return redirect(`/login`);
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white shadow-md z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <PawPrint className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-800">
                            {organization.name}
                        </span>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/" className="text-gray-600 hover:text-blue-600">Inicio</Link>
                        <Link href="/citas" className="text-gray-600 hover:text-blue-600">Mis Citas</Link>
                        {/* Botón para cerrar sesión */}
                        <form action={portalLogout}>
                            <button type="submit" className="flex items-center text-sm text-red-500 hover:text-red-700">
                                <LogOut className="h-4 w-4 mr-1" />
                                Salir
                            </button>
                        </form>
                    </nav>
                </div>
            </header>
            <main className="flex-1 bg-gray-50">
                <div className="container mx-auto p-4 sm:p-6">
                    {children}
                </div>
            </main>
            <footer className="text-center p-4 bg-white border-t text-sm text-gray-500">
                © {new Date().getFullYear()} {organization.name}. Todos los derechos reservados.
            </footer>
        </div>
    );
}
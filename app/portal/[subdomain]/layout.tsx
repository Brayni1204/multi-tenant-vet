// Ruta: app/portal/[subdomain]/layout.tsx

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { PawPrint } from "lucide-react";

export default async function PortalLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { subdomain: string };
}) {
    const supabase = createClient();

    // Obtenemos el nombre de la organización para mostrarlo en el layout
    const { data: organization } = await supabase
        .from('organizations')
        .select('name')
        .eq('subdomain', params.subdomain)
        .single();

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white shadow-md z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <PawPrint className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-800">
                            {organization?.name ?? 'Portal del Cliente'}
                        </span>
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/" className="text-gray-600 hover:text-blue-600">Inicio</Link>
                        <Link href="/citas" className="text-gray-600 hover:text-blue-600">Mis Citas</Link>
                        {/* Aquí añadiremos "Mis Mascotas" después */}
                    </nav>
                </div>
            </header>
            <main className="flex-1 bg-gray-50">
                <div className="container mx-auto p-4 sm:p-6">
                    {children}
                </div>
            </main>
            <footer className="text-center p-4 bg-white border-t text-sm text-gray-500">
                © {new Date().getFullYear()} {organization?.name}. Todos los derechos reservados.
            </footer>
        </div>
    );
}
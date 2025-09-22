// Ruta: app/dashboard/layout.tsx

import OrgSwitcher from '@/components/OrgSwitcher';
import { createClient } from '@/lib/supabase/server';
import { get_active_org } from '@/lib/org';
import { redirect } from 'next/navigation';
import { logout } from '@/app/auth/actions';
import Link from 'next/link'; // Importamos Link para la navegación

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const { orgs, activeOrg } = await get_active_org();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Barra de Navegación Lateral */}
            <aside className="w-64 bg-white border-r">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-bold">Menú</h2>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-gray-200">
                        Inicio
                    </Link>
                    <Link href="/dashboard/clients" className="block px-4 py-2 rounded-md hover:bg-gray-200">
                        Clientes
                    </Link>
                    {/* Aquí añadiremos más enlaces después (Mascotas, Citas, etc.) */}
                </nav>
            </aside>

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col">
                <header className="border-b p-4 flex justify-between items-center bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800">
                            {activeOrg?.name ?? 'Dashboard'}
                        </h1>
                        <OrgSwitcher orgs={orgs} activeOrg={activeOrg} />
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                            Cerrar Sesión
                        </button>
                    </form>
                </header>
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
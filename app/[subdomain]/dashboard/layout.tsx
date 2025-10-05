// Ruta: app/dashboard/layout.tsx

import OrgSwitcher from '@/components/OrgSwitcher';
import { createClient } from '@/lib/supabase/server';
import { get_active_org } from '@/lib/org';
import { redirect } from 'next/navigation';
import { logout } from '@/app/auth/actions';
import Link from 'next/link';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Si no hay usuario, se va al login.
    if (!user) {
        return redirect('/login');
    }

    // 2. ¡VERIFICACIÓN DE ROL!
    //    Comprobamos si el usuario es un administrador/empleado en la tabla 'user_organizations'.
    const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('org_id')
        .eq('user_id', user.id);

    // Si el conteo es 0, no pertenece a ninguna organización. ¡Es un cliente intentando entrar!
    if (!userOrg || userOrg.length === 0) {
        await supabase.auth.signOut(); // Cerramos su sesión de forma segura
        return redirect('/login?error=access_denied');   // Y lo mandamos al login con un mensaje (opcional)
    }

    // Si pasó la verificación, cargamos sus datos de organización.
    const { orgs, activeOrg } = await get_active_org();

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white border-r">
                <div className="p-4 border-b"><h2 className="text-lg font-bold">Menú</h2></div>
                <nav className="p-4 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-gray-200">Inicio</Link>
                    <Link href="/dashboard/clients" className="block px-4 py-2 rounded-md hover:bg-gray-200">Clientes</Link>
                    <Link href="/dashboard/pets" className="block px-4 py-2 rounded-md hover:bg-gray-200">Mascotas</Link>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="border-b p-4 flex justify-between items-center bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800">{activeOrg?.name ?? 'Dashboard'}</h1>
                        <OrgSwitcher orgs={orgs} activeOrg={activeOrg} />
                    </div>
                    <form action={logout}>
                        <button type="submit" className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700">
                            Cerrar Sesión
                        </button>
                    </form>
                </header>
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
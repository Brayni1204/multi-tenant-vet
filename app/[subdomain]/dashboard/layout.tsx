// Ruta: app/dashboard/layout.tsx

import OrgSwitcher from '@/components/OrgSwitcher';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/app/auth/actions';
import Link from 'next/link';

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { subdomain: string };
}) {
    const supabase = createClient();
    const { subdomain } = params;

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Si no hay usuario, se va al login.
    if (!user) {
        return redirect(`/${subdomain}/login`);
    }

    // 2. ¡VERIFICACIÓN DE ROL!
    //    Comprobamos si el usuario es un administrador/empleado en la tabla 'user_organizations'.
    const { data: activeOrg, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('subdomain', subdomain)
        .single();

    if (orgError || !activeOrg) {
        return redirect('/?error=org_not_found'); // O una página de error 404
    }

    // Verificamos si el usuario pertenece a ESTA organización
    const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('org_id')
        .eq('user_id', user.id)
        .eq('org_id', activeOrg.id)
        .maybeSingle();

    if (!userOrg) {
        await supabase.auth.signOut();
        return redirect(`/${subdomain}/login?error=access_denied`);
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white border-r">
                <div className="p-4 border-b"><h2 className="text-lg font-bold">Menú</h2></div>
                <nav className="p-4 space-y-2">
                    {/* CORRECCIÓN DE RUTAS: Usamos rutas relativas */}
                    <Link href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-gray-200">Inicio</Link>
                    <Link href="/dashboard/clients" className="block px-4 py-2 rounded-md hover:bg-gray-200">Clientes</Link>
                    <Link href="/dashboard/pets" className="block px-4 py-2 rounded-md hover:bg-gray-200">Mascotas</Link>
                    <Link href="/dashboard/users" className="block px-4 py-2 rounded-md hover:bg-gray-200">Usuarios</Link>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="border-b p-4 flex justify-between items-center bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800">{activeOrg.name}</h1>
                        {/* El OrgSwitcher ya no es necesario aquí, la URL manda. Lo quitamos. */}
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
// Ruta: app/portal/[subdomain]/page.tsx

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import Link from "next/link";

export default async function PortalHomePage() {
    const supabase = createClient();

    // CORRECCIÓN: Se elimina el 'await' innecesario
    const headersList = await headers();
    const host = headersList.get('host')!;
    const subdomain = host.split('.')[0];

    // ... (el resto del código se queda igual)
    const { data: organization, error } = await supabase
        .from('organizations')
        .select('name')
        .eq('subdomain', subdomain)
        .single();

    if (error || !organization) {
        return <div><h1>Portal no encontrado</h1><p>Subdominio buscado: {subdomain}</p></div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-3xl font-bold text-gray-800">
                    Bienvenido al Portal de Clientes de
                </h1>
                <h2 className="text-4xl font-extrabold text-blue-600 mt-2">
                    {organization.name}
                </h2>
                <p className="mt-4 text-gray-600">
                    Aquí podrás gestionar tus citas y ver el historial de tus mascotas.
                </p>
                <Link href="/citas">
                    <button className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        Ver Mis Citas
                    </button>
                </Link>
            </div>
        </div>
    );
}
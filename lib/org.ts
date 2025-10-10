/* eslint-disable @typescript-eslint/no-unused-vars */
// Ruta: lib/org.ts

import 'server-only';
import { cookies } from 'next/headers';
import { createClient } from './supabase/server';
import { Database } from '@/types/supabase'; // Importamos el tipo de la DB

export const ACTIVE_ORG_COOKIE = 'active_org';

// Definimos el tipo Organization directamente de la base de datos.
// Esto garantiza que el tipo sea completo y preciso.
export type Organization = Database['public']['Tables']['organizations']['Row'];

export async function get_active_org(): Promise<{
    orgs: Organization[];
    activeOrg: Organization | null;
}> {
    const cookieStore = await cookies();
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { orgs: [], activeOrg: null };
    }

    // Cambiamos la consulta para seleccionar TODAS las columnas de 'organizations'
    const { data, error } = await supabase
        .from('user_organizations')
        .select('organizations ( * )') // Usamos '*' para obtener todos los campos
        .eq('user_id', user.id);

    if (error) {
        console.error('Error buscando empresas del usuario:', error);
        return { orgs: [], activeOrg: null };
    }

    // Extraemos las organizaciones y las formateamos con el tipo correcto
    const formattedOrgs = data.map((item) => item.organizations).filter(Boolean) as Organization[];

    let activeOrg: Organization | null = null;
    const active_org_id = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

    if (active_org_id) {
        activeOrg = formattedOrgs.find((org) => org.id === active_org_id) ?? null;
    }

    if (!activeOrg && formattedOrgs.length > 0) {
        activeOrg = formattedOrgs[0];
        try {
            cookieStore.set(ACTIVE_ORG_COOKIE, activeOrg.id, { path: '/' });
        } catch (e) {
            console.log('Could not set active org cookie in a statically rendered component.');
        }
    }

    return { orgs: formattedOrgs, activeOrg };
}
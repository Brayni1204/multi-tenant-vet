// supabase/functions/validate-user-org/index.ts

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Definimos un tipo para la respuesta para mayor claridad
type ValidationResponse = {
    isMember: boolean;
    error?: string;
}

Deno.serve(async (req: Request) => {
    // Manejo de CORS - importante para que el navegador permita la llamada
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
            }
        });
    }

    try {
        const { subdomain } = await req.json();
        if (!subdomain) {
            throw new Error("Subdomain is required");
        }

        const authHeader = req.headers.get('Authorization')!;

        const supabase: SupabaseClient = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response(JSON.stringify({ isMember: false, error: 'Not authenticated' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 1. Buscar la organización por subdominio
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .eq('subdomain', subdomain)
            .single();

        if (orgError || !org) {
            // Si no se encuentra la organización, el usuario no puede ser miembro
            return new Response(JSON.stringify({ isMember: false }),
                { headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 2. Verificar si el usuario pertenece a esa organización
        const { data: userOrg, error: userOrgError } = await supabase
            .from('user_organizations')
            .select('user_id', { count: 'exact' }) // Es más eficiente solo contar
            .eq('user_id', user.id)
            .eq('org_id', org.id);

        // Si hubo un error en la consulta o el conteo es 0, no es miembro
        const isMember = !userOrgError && (userOrg?.length ?? 0) > 0;

        const response: ValidationResponse = { isMember };
        return new Response(JSON.stringify(response),
            { headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
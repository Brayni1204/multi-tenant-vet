// Ruta: supabase/functions/validate-user-org/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Encabezados de CORS que reutilizaremos en todas las respuestas
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Function cold start: validate-user-org');

Deno.serve(async (req: Request) => {
  console.log('--- New request received ---');

  // Responder a la petición de "pre-vuelo" de CORS
  if (req.method === 'OPTIONS') {
    console.log('Responding to OPTIONS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { subdomain } = await req.json();
    console.log(`Payload received. Subdomain: "${subdomain}"`);
    if (!subdomain) throw new Error("Subdomain is required");

    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader) throw new Error("Not authenticated");
    console.log('Authorization header found.');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    console.log('Supabase client created for the user.');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");
    console.log(`User identified: ${user.id} (${user.email})`);
    
    // 1. Buscar la organización
    console.log(`Searching for organization with subdomain: "${subdomain}"`);
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (orgError || !org) {
      console.error(`Organization not found for subdomain "${subdomain}". Error:`, orgError);
      return new Response(JSON.stringify({ isMember: false }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    console.log(`Organization found: ${org.id}`);

    // 2. Verificar la membresía
    console.log(`Checking membership for user ${user.id} in org ${org.id}`);
    const { error: userOrgError, count } = await supabase
      .from('user_organizations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('org_id', org.id);

    if (userOrgError) console.error('Error querying user_organizations:', userOrgError);

    const isMember = count !== null && count > 0;
    console.log(`Membership check result count: ${count}`);
    console.log(`Final decision: isMember = ${isMember}`);

    return new Response(JSON.stringify({ isMember }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Caught a critical error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
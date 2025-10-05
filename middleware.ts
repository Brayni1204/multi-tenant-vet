// Ruta: middleware.ts

import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { supabase, response } = createClient(request);
    await supabase.auth.getSession();

    const url = request.nextUrl;
    const hostname = request.headers.get('host')!;

    // Define tu dominio raíz. Para desarrollo local será 'localhost:3000'
    // Para producción, será 'veterinaria.techinnovats.com' (o el dominio que uses)
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

    // Si el hostname es el dominio raíz, no hacemos nada y dejamos que Next maneje la ruta.
    // Esto es útil para páginas como el marketing, landing page, etc.
    if (hostname === rootDomain) {
        return response;
    }

    // Extraemos el subdominio. Por ejemplo, de 'chavez.localhost:3000', obtendremos 'chavez'.
    const subdomain = hostname.replace(`.${rootDomain}`, '');

    // Re-escribimos la URL para que Next.js la entienda.
    // Por ejemplo, una petición a 'chavez.localhost:3000/dashboard' se convertirá en
    // una petición interna a 'localhost:3000/chavez/dashboard'.
    // Next.js podrá entonces usar un grupo de rutas como `app/[subdomain]/dashboard` para renderizar la página.
    const rewrittenUrl = new URL(`/${subdomain}${url.pathname}`, request.url);
    return NextResponse.rewrite(rewrittenUrl, response);
}

export const config = {
    // El matcher se asegura de que el middleware se ejecute en TODAS las rutas,
    // excepto en las de sistema de Next.js.
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    ],
}
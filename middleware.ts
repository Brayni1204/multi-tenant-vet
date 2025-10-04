// Ruta: middleware.ts

import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { supabase, response } = createClient(request)
    const { data: { session } } = await supabase.auth.getSession()

    const url = request.nextUrl
    const hostname = request.headers.get('host')!
    const rootDomain = 'localhost:3000'

    // CASO 1: Es un subdominio (Portal de Cliente)
    if (hostname !== rootDomain) {
        const subdomain = hostname.split('.')[0]
        const newPath = `/portal/${subdomain}${url.pathname}`
        
        // Si un cliente no logueado intenta acceder a algo que no sea su login, lo mandamos al login del portal
        if (!session && url.pathname !== '/login') {
            return NextResponse.redirect(new URL(`/login`, `http://${hostname}`))
        }

        const rewrittenUrl = new URL(newPath, request.url)
        return NextResponse.rewrite(rewrittenUrl, response)
    }

    // --- CASO 2: Es el dominio principal (Dashboard) ---

    // Si el usuario está logueado y visita la página raíz o de login, lo mandamos al dashboard.
    if (session && (url.pathname === '/' || url.pathname === '/login')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Si el usuario NO está logueado y trata de acceder a una ruta protegida (como /dashboard),
    // lo mandamos a la página de login.
    if (!session && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
}

export const config = {
    matcher: [
        // CAMBIO CLAVE: Excluimos explícitamente la ruta de login del matcher principal
        // para que no se ejecute en bucle. Las redirecciones se manejan arriba.
        '/((?!_next/static|_next/image|favicon.ico|api|login).*)',
        // Añadimos las rutas que sí queremos proteger explícitamente
        '/', 
        '/dashboard/:path*',
        '/portal/:path*',
    ],
}
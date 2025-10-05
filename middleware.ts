// Ruta: middleware.ts

import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Tarea 1: Refrescar la sesión del usuario. Esto es todo lo que hace con Supabase.
    const { supabase, response } = createClient(request)
    await supabase.auth.getSession()

    // Tarea 2: Manejar el enrutamiento por subdominio.
    const url = request.nextUrl
    const hostname = request.headers.get('host')!
    const rootDomain = 'localhost:3000'

    if (hostname !== rootDomain) {
        const subdomain = hostname.split('.')[0]
        const portalPath = `/portal/${subdomain}${url.pathname}`
        const rewrittenUrl = new URL(portalPath, request.url)
        return NextResponse.rewrite(rewrittenUrl, response)
    }

    // Para el dominio principal, simplemente continuamos. La protección de rutas se hará en los layouts.
    return response
}

export const config = {
    matcher: [
        /*
         * Ejecuta el middleware en TODAS las rutas excepto las de sistema y API.
         * Esto es más simple y efectivo.
         */
        '/((?!_next/static|_next/image|favicon.ico|api|login|signup).*)',
    ],
}
// Ruta: middleware.ts

import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { supabase, response } = createClient(request)
    await supabase.auth.getSession()

    const url = request.nextUrl
    const hostname = request.headers.get('host')!
    const rootDomain = 'localhost:3000'

    if (hostname === rootDomain) {
        return response
    }

    const subdomain = hostname.split('.')[0]
    request.headers.set('x-subdomain', subdomain)

    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    // Añadimos ${subdomain} para construir la ruta correcta.
    url.pathname = `/portal/${subdomain}${url.pathname}`

    return NextResponse.rewrite(url, { request })
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|login|api).*)',
    ],
}
// Ruta: middleware.ts

import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { supabase, response } = createClient(request)
    const { data: { session } } = await supabase.auth.getSession()

    const url = request.nextUrl
    const hostname = request.headers.get('host')!
    const rootDomain = 'localhost:3000' // Cambiar en producción

    // --- LÓGICA DE SUBDOMINIOS (PORTAL DE CLIENTES) ---
    if (hostname !== rootDomain) {
        const subdomain = hostname.split('.')[0]
        const portalPath = `/portal/${subdomain}${url.pathname}`
        const rewrittenUrl = new URL(portalPath, request.url)

        // Si no hay sesión y no se está pidiendo el login, se redirige al login del portal
        if (!session && url.pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', `http://${hostname}`))
        }

        // Si hay sesión y se pide el login, se redirige a la raíz del portal
        if (session && url.pathname === '/login') {
            return NextResponse.redirect(new URL('/', `http://${hostname}`))
        }

        return NextResponse.rewrite(rewrittenUrl, response)
    }

    // --- LÓGICA DEL DOMINIO PRINCIPAL (DASHBOARD) ---

    // Si hay sesión y se visita la raíz o el login, redirigir al dashboard
    if (session && (url.pathname === '/' || url.pathname === '/login')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Si no hay sesión y se intenta acceder a una ruta protegida, redirigir al login
    if (!session && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Si no hay sesión y se está en la raíz, redirigir al login
    if (!session && url.pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|signup).*)',
    ],
}
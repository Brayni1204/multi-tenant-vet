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
    url.pathname = `/portal/${subdomain}${url.pathname}`

    return NextResponse.rewrite(url, response)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|login|api).*)',
    ],
}
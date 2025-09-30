// Ruta: middleware.ts

import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Este middleware ahora solo se encarga de refrescar la sesión de Supabase.
  // Next.js se encargará del enrutamiento de subdominios gracias a la carpeta @portal.
  const { supabase, response } = createClient(request);

  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
// Ruta: middleware.ts

import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'
//import { redirect } from 'next/navigation'

export default function IndexPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Bienvenido a Vet Clinic SaaS</h1>
      <p className="mt-4 text-lg text-gray-600">
        Accede a tu clínica a través de tu subdominio personalizado.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Ejemplo: <code className="bg-gray-200 p-1 rounded">chavez.localhost:3000</code>
      </p>
    </div>
  )
}

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
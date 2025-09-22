/** @type {import('next').NextConfig} */
const nextConfig = {
  // Esta configuración mágica a veces soluciona los problemas de 'fetch failed'
  // Forzando a Next.js a usar una implementación de fetch más estable.
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr'],
  },
};

export default nextConfig;
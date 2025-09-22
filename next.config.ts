/** @type {import('next').NextConfig} */
const nextConfig = {
  // This magic configuration sometimes solves 'fetch failed' issues
  // by forcing Next.js to use a more stable fetch implementation.
  experimental: {
    serverExternalPackages: ['@supabase/ssr'],
  },
};

export default nextConfig;
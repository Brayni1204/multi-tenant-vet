import './globals.css'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Vet Clinic SaaS',
  description: 'Multi-tenant demo con Supabase + Next.js',
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
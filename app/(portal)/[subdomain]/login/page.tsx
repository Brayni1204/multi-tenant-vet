// Ruta: app/(portal)/[subdomain]/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // 1. Iniciar sesión normalmente
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (signInError) {
            setError(signInError.message)
            setLoading(false)
            return;
        }

        if (user) {
            try {
                // 2. Obtener el subdominio actual
                const subdomain = window.location.hostname.split('.')[0];

                // 3. Llamar a una Edge Function para verificar la pertenencia (más seguro)
                const { data, error: validationError } = await supabase.functions.invoke('validate-user-org', {
                    body: { subdomain }
                });

                if (validationError || !data?.isMember) {
                    // 4. Si no es miembro, cerrar sesión y mostrar error
                    await supabase.auth.signOut();
                    setError("No tienes acceso a esta clínica. Verifica el subdominio o contacta al administrador.");
                    setLoading(false);
                    return;
                }

                // 5. Si es miembro, redirigir al dashboard
                window.location.href = '/dashboard';

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                await supabase.auth.signOut();
                setError(e.message || "Ocurrió un error inesperado durante la validación.");
                setLoading(false);
            }
        }
    }

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Redirige al usuario de vuelta a la página principal del portal
                // después de iniciar sesión con Google.
                redirectTo: `${window.location.origin}/`
            }
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Acceso para Clientes</h1>

                {/* --- AÑADIMOS EL BOTÓN DE GOOGLE --- */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 font-bold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    {/* Puedes añadir un SVG del logo de Google aquí */}
                    <svg className="w-5 h-5" viewBox="0 0 48 48">...</svg>
                    Ingresar con Google
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">O continúa con tu email</span>
                    </div>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-4">
                    ¿No tienes una cuenta?{' '}
                </p>
            </div>
        </div>
    )
}
'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function LoginPage() {
    const supabase = createClient()

    useEffect(() => {
        const { data: { subscription } } =
            supabase.auth.onAuthStateChange((_e, session) => {
                if (session) window.location.href = '/dashboard'
            })
        return () => subscription.unsubscribe()
        // ⬇️ satisface react-hooks/exhaustive-deps
    }, [supabase])

    return (
        <main className="grid place-items-center min-h-dvh p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
                <h1 className="text-2xl font-semibold mb-4">Ingresar / Registrarse</h1>
                <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} />
            </div>
        </main>
    )
}

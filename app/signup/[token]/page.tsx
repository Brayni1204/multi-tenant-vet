// app/signup/[token]/page.tsx
'use client'

import { useState, use } from 'react' // <-- 1. IMPORTA 'use'
import { useRouter } from 'next/navigation'
import { signup } from './actions'

// 2. CAMBIA EL TIPO DE 'params' PARA REFLEJAR QUE ES UNA PROMESA
export default function SignupPage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter()

    // 3. USA EL HOOK use() PARA OBTENER EL TOKEN
    const { token } = use(params)

    const [companyName, setCompanyName] = useState('')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('token', token)
        formData.append('companyName', companyName)
        formData.append('fullName', fullName)
        formData.append('email', email)
        formData.append('password', password)

        const result = await signup(formData)

        if (result.error) {
            setError(result.error)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Registrar Nueva Empresa
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Nombre de la Empresa"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Nombre Completo del Administrador"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="email"
                            placeholder="Email del Administrador"
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
                        {loading ? 'Registrando...' : 'Registrar Empresa'}
                    </button>
                </form>
            </div>
        </div>
    )
}
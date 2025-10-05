// app/dashboard/users/AddUserForm.tsx
'use client'

import { useState } from 'react'
import { addUserToOrg } from './actions'

export default function AddUserForm({ orgId }: { orgId: string }) {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('user')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        const formData = new FormData()
        formData.append('orgId', orgId)
        formData.append('email', email)
        formData.append('role', role)

        const result = await addUserToOrg(formData)

        if (result.error) {
            setError(result.error)
        } else if (result.success) { // <-- CAMBIO AQUÍ
            setSuccess(result.success)
            setEmail('')
            setRole('user')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-3 bg-white border rounded-xl p-4">
            <h2 className="text-lg font-semibold">Añadir Nuevo Usuario</h2>
            <div className="grid gap-1 sm:grid-cols-2">
                <div className="grid gap-1">
                    <label className="text-sm">Email del Usuario</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border rounded-lg px-3 py-2"
                    />
                </div>
                <div className="grid gap-1">
                    <label className="text-sm">Rol</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <button
                type="submit"
                disabled={loading}
                className="mt-2 px-4 py-2 rounded-xl bg-black text-white"
            >
                {loading ? 'Añadiendo...' : 'Añadir Usuario'}
            </button>
        </form>
    )
}
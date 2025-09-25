// Ruta: components/ClientForm.tsx

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ClientForm({ activeOrgId }: { activeOrgId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        const formData = new FormData(event.currentTarget)

        const name = formData.get('name') as string
        const last_name = formData.get('last_name') as string

        if (!name.trim() || !last_name.trim()) {
            setError('Nombre y Apellido son obligatorios.')
            return
        }

        const supabase = createClient()
        const { error: insertError } = await supabase.from('clients').insert({
            name,
            last_name,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            address: formData.get('address') as string,
            tenant_id: activeOrgId, // Aquí se asigna la empresa correcta
        })

        if (insertError) {
            setError(`Error al crear cliente: ${insertError.message}`)
        } else {
            setIsOpen(false) // Cierra el modal
            router.refresh() // Recarga los datos de la página para ver el nuevo cliente
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
                + Añadir Cliente
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">Nuevo Cliente</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" placeholder="Nombre" className="w-full border p-2 rounded" required />
                            <input name="last_name" placeholder="Apellido" className="w-full border p-2 rounded" required />
                            <input name="phone" placeholder="Teléfono" className="w-full border p-2 rounded" />
                            <input type="email" name="email" placeholder="Email" className="w-full border p-2 rounded" />
                            <textarea name="address" placeholder="Dirección" className="w-full border p-2 rounded" />

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
// Ruta: components/AddClientByDniForm.tsx
'use client'

import { useState, useTransition } from 'react';
import { addClientByDni } from '@/app/(dashboard)/[subdomain]/dashboard/clients/actions';

export default function AddClientByDniForm({ orgId }: { orgId: string }) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [dni, setDni] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
            setError(null);
            setSuccess(null);
            const result = await addClientByDni(formData);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(result.success || 'Cliente añadido con éxito.');
                setDni(''); // Limpiar el input
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50">
            <input type="hidden" name="orgId" value={orgId} />
            <div className="flex-1">
                <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                    DNI del Cliente
                </label>
                <input
                    id="dni"
                    name="dni"
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    maxLength={8}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ingrese 8 dígitos"
                />
            </div>
            <div className="self-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isPending ? 'Buscando...' : '+ Añadir Cliente'}
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2 w-full col-span-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mt-2 w-full col-span-2">{success}</p>}
        </form>
    );
}
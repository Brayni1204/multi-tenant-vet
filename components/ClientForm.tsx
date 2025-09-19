'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'


export default function ClientForm() {
    const supabase = createClient()
    const [orgId, setOrgId] = useState<string | null>(null)
    const [full_name, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')


    useEffect(() => {
        const c = document.cookie.split('; ').find(r => r.startsWith('active_org='))?.split('=')[1]
        if (c) setOrgId(c)
    }, [])


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!orgId) return alert('Selecciona una clínica (arriba a la derecha).')
        const { error } = await supabase.from('clients').insert({ org_id: orgId, full_name, email, phone })
        if (error) return alert(error.message)
        setFullName(''); setEmail(''); setPhone('')
        window.location.reload()
    }


    return (
        <form onSubmit={onSubmit} className="grid gap-3 bg-white border rounded-xl p-4">
            <div className="grid gap-1">
                <label className="text-sm">Nombre completo</label>
                <input className="border rounded-lg px-3 py-2" value={full_name} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="grid gap-1 sm:grid-cols-2">
                <div className="grid gap-1">
                    <label className="text-sm">Email</label>
                    <input className="border rounded-lg px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-1">
                    <label className="text-sm">Teléfono</label>
                    <input className="border rounded-lg px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
            </div>
            <button className="mt-2 px-4 py-2 rounded-xl bg-black text-white">Guardar</button>
        </form>
    )
}
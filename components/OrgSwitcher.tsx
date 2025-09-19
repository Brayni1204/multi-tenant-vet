'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ACTIVE_ORG_COOKIE } from '@/lib/org'


type Org = { id: string; name: string }
export default function OrgSwitcher({ orgs }: { orgs: Org[] }) {
    const supabase = createClient()
    const [active, setActive] = useState<string | null>(null)


    useEffect(() => {
        const saved = document.cookie
            .split('; ')
            .find((r) => r.startsWith(`${ACTIVE_ORG_COOKIE}=`))?.split('=')[1]
        if (saved) setActive(saved)
    }, [])


    const setCookie = (id: string) => {
        document.cookie = `${ACTIVE_ORG_COOKIE}=${id}; path=/; max-age=${60 * 60 * 24 * 365}`
        setActive(id)
        window.location.reload()
    }


    const createOrg = async () => {
        const name = prompt('Nombre de la nueva clínica')
        if (!name) return
        const { data, error } = await supabase
            .from('organizations')
            .insert({ name })
            .select('id')
            .single()
        if (error) return alert(error.message)
        await supabase.from('user_organizations').insert({ org_id: data!.id, role: 'owner' })
        setCookie(data!.id)
    }


    return (
        <div className="flex items-center gap-2">
            <select
                className="border rounded-lg px-3 py-2"
                value={active ?? ''}
                onChange={(e) => setCookie(e.target.value)}
            >
                <option value="">Seleccionar clínica…</option>
                {orgs.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                ))}
            </select>
            <button onClick={createOrg} className="px-3 py-2 rounded-xl bg-black text-white">+ Nueva</button>
        </div>
    )
}
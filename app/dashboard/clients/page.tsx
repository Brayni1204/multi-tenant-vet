import ClientForm from '@/components/ClientForm'
import { createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'


export default async function ClientsPage() {
    const supabase = createServerSupabase()
    const activeOrg = cookies().get('active_org')?.value || null


    let clients: any[] = []
    if (activeOrg) {
        const { data } = await supabase
            .from('clients')
            .select('id, full_name, email, phone, created_at')
            .eq('org_id', activeOrg)
            .order('created_at', { ascending: false })
        clients = data || []
    }


    return (
        <div className="grid gap-6">
            <h1 className="text-xl font-semibold">Clientes</h1>
            <ClientForm />
            {!activeOrg && (
                <div className="p-4 border rounded-xl bg-yellow-50">Selecciona o crea una clínica para ver/crear clientes.</div>
            )}
            {activeOrg && (
                <div className="bg-white border rounded-xl">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left p-3">Nombre</th>
                                <th className="text-left p-3">Email</th>
                                <th className="text-left p-3">Teléfono</th>
                                <th className="text-left p-3">Creado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((c) => (
                                <tr key={c.id} className="border-b last:border-0">
                                    <td className="p-3">{c.full_name}</td>
                                    <td className="p-3">{c.email}</td>
                                    <td className="p-3">{c.phone}</td>
                                    <td className="p-3">{new Date(c.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
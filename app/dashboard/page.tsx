import Link from 'next/link'
export default function DashboardHome() {
    return (
        <div className="grid gap-4">
            <h1 className="text-xl font-semibold">Panel</h1>
            <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/dashboard/clients" className="block rounded-xl border p-6 bg-white hover:shadow">
                    Clientes
                </Link>
                <div className="rounded-xl border p-6 bg-white text-gray-400">Próximamente: Mascotas, Citas…</div>
            </div>
        </div>
    )
}
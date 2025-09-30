// Ruta: app/portal/[subdomain]/citas/page.tsx

export default function MisCitasPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Citas</h1>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600">
                    Próximamente, aquí podrás ver y gestionar todas las citas de tus mascotas.
                </p>
                <p className="mt-4 text-sm text-gray-500">
                    (El siguiente paso será implementar el inicio de sesión para clientes).
                </p>
            </div>
        </div>
    );
}
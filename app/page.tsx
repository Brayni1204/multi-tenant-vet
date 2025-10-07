// Ruta: app/page.tsx

export default function IndexPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Bienvenido a Vet Clinic SaaS</h1>
      <p className="mt-4 text-lg text-gray-600">
        Accede a tu clínica a través de tu subdominio personalizado.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Ejemplo: <code className="bg-gray-200 p-1 rounded">chavez.localhost:3000</code>
      </p>
    </div>
  )
}
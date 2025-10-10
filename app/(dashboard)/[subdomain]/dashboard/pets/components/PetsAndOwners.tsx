// Ruta: app/(dashboard)/[subdomain]/dashboard/pets/components/PetsAndOwners.tsx
'use client'

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Importamos CardDescription
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Calendar, PawPrint } from "lucide-react"

// Tipos actualizados
type OwnerProfile = {
    id: string;
    name: string | null;
    last_name: string | null;
    full_name: string | null;
    dni?: string | null;
};

type PetWithOwner = {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    sex: string | null;
    birth_date: string | null;
    owner: OwnerProfile | null;
};

export default function PetsAndOwners({ initialPets, initialOwners, activeOrgId }: { initialPets: PetWithOwner[], initialOwners: OwnerProfile[], activeOrgId: string }) {
    const supabase = createClient();
    const [pets] = useState(initialPets);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [petFormData, setPetFormData] = useState({ owner_id: "", name: "", species: "", breed: "", sex: "", birth_date: "" });

    const handlePetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const dataToInsert = {
            ...petFormData,
            org_id: activeOrgId,
            breed: petFormData.breed || null,
            sex: petFormData.sex || null,
            birth_date: petFormData.birth_date || null,
            owner_id: petFormData.owner_id, // Aseguramos el owner_id
        };

        const { data: newPet, error } = await supabase
            .from("pets")
            .insert(dataToInsert)
            // Seleccionamos la mascota recién creada y su dueño
            .select('*, owner:profiles (*)')
            .single();

        if (!error && newPet) {
            // El API de Supabase devuelve la fila, pero si el JOIN no es perfecto
            // el tipo `owner:profiles (*)` podría no ser 100% preciso para el estado local.
            // Para fines de demo, asumiremos que es correcto o recargaremos la página.
            // Aquí, por simplicidad, recargaremos los datos en lugar de mutar el estado.
            window.location.reload();
        } else {
            console.error("Error creating pet:", error);
        }

        setIsSubmitting(false);
    };

    const filteredPets = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.owner && pet.owner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Buscar mascotas por nombre, especie o dueño..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" />Agregar Mascota</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Nueva Mascota</DialogTitle></DialogHeader>
                        <form onSubmit={handlePetSubmit} className="space-y-4">
                            <div>
                                <Label>Dueño (ID)</Label>
                                {/* Implementación de Select mejorada */}
                                <Select required onValueChange={(value) => setPetFormData({ ...petFormData, owner_id: value })}>
                                    <SelectTrigger><SelectValue placeholder={initialOwners.length > 0 ? "Seleccionar dueño" : "No hay dueños registrados"} /></SelectTrigger>
                                    <SelectContent>{initialOwners.map((owner) => <SelectItem key={owner.id} value={owner.id}>{owner.full_name} ({owner.dni})</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Nombre</Label><Input onChange={(e) => setPetFormData({ ...petFormData, name: e.target.value })} required /></div>
                                <div>
                                    <Label>Especie</Label>
                                    <Select required onValueChange={(value) => setPetFormData({ ...petFormData, species: value })}>
                                        <SelectTrigger><SelectValue placeholder="Especie" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Perro">Perro</SelectItem>
                                            <SelectItem value="Gato">Gato</SelectItem>
                                            <SelectItem value="Ave">Ave</SelectItem>
                                            <SelectItem value="Conejo">Conejo</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Raza</Label><Input onChange={(e) => setPetFormData({ ...petFormData, breed: e.target.value })} /></div>
                                <div>
                                    <Label>Sexo</Label>
                                    <Select onValueChange={(value) => setPetFormData({ ...petFormData, sex: value })}>
                                        <SelectTrigger><SelectValue placeholder="Sexo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Macho</SelectItem>
                                            <SelectItem value="F">Hembra</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div><Label>Fecha de Nacimiento</Label><Input type="date" onChange={(e) => setPetFormData({ ...petFormData, birth_date: e.target.value })} /></div>
                            <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={isSubmitting || initialOwners.length === 0}>
                                {isSubmitting ? 'Registrando...' : 'Registrar Mascota'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPets.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 py-10">No se encontraron mascotas que coincidan con la búsqueda.</p>
                ) : (
                    filteredPets.map((pet) => (
                        <Card key={pet.id} className="shadow-lg hover:shadow-xl transition-shadow border-blue-200">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <PawPrint className="h-6 w-6 text-blue-600" />
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    {pet.species}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <CardTitle className="text-xl font-extrabold">{pet.name}</CardTitle>
                                <CardDescription className="text-sm text-gray-500 mt-1">{pet.breed || 'Raza Desconocida'}</CardDescription>
                                <div className="mt-4 space-y-1 text-sm">
                                    <p className="font-medium text-gray-700 truncate">Dueño: {pet.owner?.full_name}</p>
                                    <p className="text-gray-500">Sexo: {pet.sex === 'M' ? 'Macho' : (pet.sex === 'F' ? 'Hembra' : 'N/A')}</p>
                                    {pet.birth_date && (
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            <span>Nacimiento: {new Date(pet.birth_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                                <Button size="sm" variant="outline" className="mt-4 w-full border-blue-400 text-blue-600 hover:bg-blue-50">Ver Historial</Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

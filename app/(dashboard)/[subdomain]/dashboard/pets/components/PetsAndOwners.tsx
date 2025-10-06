// Ruta: app/(dashboard)/[subdomain]/dashboard/pets/components/PetsAndOwners.tsx
'use client'

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"

// Tipos actualizados
type OwnerProfile = {
    id: string;
    name: string | null;
    last_name: string | null;
    email?: string | null;
};

type PetWithOwner = {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    sex?: string | null;
    birth_date?: string | null;
    owner: OwnerProfile | null;
};

export default function PetsAndOwners({ initialPets, initialOwners, activeOrgId }: { initialPets: PetWithOwner[], initialOwners: OwnerProfile[], activeOrgId: string }) {
    const supabase = createClient();
    const [pets, setPets] = useState(initialPets);
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
        };

        const { data: newPet, error } = await supabase
            .from("pets")
            .insert(dataToInsert)
            .select('*, owner:profiles (*)')
            .single();

        if (!error && newPet) {
            setPets(currentPets => [newPet, ...currentPets]);
            setIsPetDialogOpen(false);
            setPetFormData({ owner_id: "", name: "", species: "", breed: "", sex: "", birth_date: "" });
        } else {
            console.error("Error creating pet:", error);
        }

        setIsSubmitting(false);
    };

    const filteredPets = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.owner && `${pet.owner.name} ${pet.owner.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Buscar mascotas por nombre, especie o dueño..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Agregar Mascota</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Nueva Mascota</DialogTitle></DialogHeader>
                        <form onSubmit={handlePetSubmit} className="space-y-4">
                            <div>
                                <Label>Dueño</Label>
                                <Select required onValueChange={(value) => setPetFormData({ ...petFormData, owner_id: value })}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar dueño" /></SelectTrigger>
                                    <SelectContent>{initialOwners.map((owner) => <SelectItem key={owner.id} value={owner.id}>{owner.name} {owner.last_name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Nombre</Label><Input onChange={(e) => setPetFormData({ ...petFormData, name: e.target.value })} required /></div>
                                <div>
                                    <Label>Especie</Label>
                                    <Select required onValueChange={(value) => setPetFormData({ ...petFormData, species: value })}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar especie" /></SelectTrigger>
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
                                        <SelectTrigger><SelectValue placeholder="Seleccionar sexo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Macho</SelectItem>
                                            <SelectItem value="F">Hembra</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div><Label>Fecha de Nacimiento</Label><Input type="date" onChange={(e) => setPetFormData({ ...petFormData, birth_date: e.target.value })} /></div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Registrando...' : 'Registrar Mascota'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPets.map((pet) => (
                    <Card key={pet.id}>
                        <CardContent className="p-4">
                            <h3 className="font-semibold">{pet.name} <Badge variant="secondary">{pet.species}</Badge></h3>
                            <p className="text-sm text-gray-600">Dueño: {pet.owner?.name} {pet.owner?.last_name}</p>
                            <p className="text-sm text-gray-500">{pet.breed} - {pet.sex === 'M' ? 'Macho' : (pet.sex === 'F' ? 'Hembra' : '')}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

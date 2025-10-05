// Ruta: app/dashboard/pets/components/PetsAndOwners.tsx

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { createClientWithLogin } from '../actions'

// Tipos
interface Client {
    id: string;
    name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
}

interface Pet {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    sex?: string | null;
    birth_date?: string | null;
    clients: Client;
}

export default function PetsAndOwners({ initialPets, initialClients, activeOrgId }: { initialPets: Pet[], initialClients: Client[], activeOrgId: string }) {
    const supabase = createClient()

    const [pets, setPets] = useState(initialPets)
    const [clients, setClients] = useState(initialClients)
    const [searchTerm, setSearchTerm] = useState("")

    const [isPetDialogOpen, setIsPetDialogOpen] = useState(false)
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [petFormData, setPetFormData] = useState({ client_id: "", name: "", species: "", breed: "", sex: "", birth_date: "" });
    // No necesitamos el estado para el formulario del cliente si usamos FormData directamente

    const handlePetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
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
            .select('*, clients (*)')
            .single();

        if (!error && newPet) {
            setPets(currentPets => [newPet, ...currentPets]);
            setIsPetDialogOpen(false);
            setPetFormData({ client_id: "", name: "", species: "", breed: "", sex: "", birth_date: "" });
        } else {
            console.error("Error creating pet:", error);
        }

        setIsSubmitting(false);
    }

    const handleClientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        formData.append('org_id', activeOrgId);

        const result = await createClientWithLogin(formData);

        // --- INICIO DE LA CORRECCIÓN ---
        // Comprobamos que no haya error Y que 'result.data' exista y no sea nulo.
        if (!result.error && result.data) {
            // TypeScript ahora sabe que result.data es un objeto 'Client' válido.
            setClients(currentClients => [result.data, ...currentClients]);
            setIsClientDialogOpen(false);
            (e.target as HTMLFormElement).reset(); // Limpiamos el formulario
        } else {
            console.error("Error creating client:", result.error);
            // Aquí podrías mostrar el error al usuario
        }
        // --- FIN DE LA CORRECCIÓN ---

        setIsSubmitting(false);
    };


    const filteredPets = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${pet.clients.name} ${pet.clients.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredClients = clients.filter(client =>
        `${client.name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone && client.phone.includes(searchTerm))
    );

    return (
        <Tabs defaultValue="mascotas" className="space-y-6">
            <TabsList>
                <TabsTrigger value="mascotas">Mascotas</TabsTrigger>
                <TabsTrigger value="duenos">Dueños</TabsTrigger>
            </TabsList>

            {/* Pestaña de Mascotas */}
            <TabsContent value="mascotas" className="space-y-6">
                <div className="flex justify-between">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input placeholder="Buscar mascotas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
                        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Agregar Mascota</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Nueva Mascota</DialogTitle></DialogHeader>
                            <form onSubmit={handlePetSubmit} className="space-y-4">
                                <div>
                                    <Label>Dueño</Label>
                                    <Select required onValueChange={(value) => setPetFormData({ ...petFormData, client_id: value })}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar dueño" /></SelectTrigger>
                                        <SelectContent>{clients.map((client) => <SelectItem key={client.id} value={client.id}>{client.name} {client.last_name}</SelectItem>)}</SelectContent>
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
                                <p className="text-sm text-gray-600">Dueño: {pet.clients.name} {pet.clients.last_name}</p>
                                <p className="text-sm text-gray-500">{pet.breed} - {pet.sex === 'M' ? 'Macho' : (pet.sex === 'F' ? 'Hembra' : '')}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            {/* Pestaña de Dueños */}
            <TabsContent value="duenos" className="space-y-6">
                <div className="flex justify-between">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input placeholder="Buscar dueños..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Agregar Dueño</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Nuevo Dueño (Cliente)</DialogTitle></DialogHeader>
                            <form onSubmit={handleClientSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Nombre</Label><Input name="name" required /></div>
                                    <div><Label>Apellido</Label><Input name="last_name" required /></div>
                                </div>
                                <div><Label>Teléfono</Label><Input name="phone" required /></div>
                                <div><Label>Email (será su usuario)</Label><Input name="email" type="email" required /></div>
                                <div><Label>Contraseña Temporal</Label><Input name="password" type="password" required /></div>
                                <div><Label>Dirección</Label><Input name="address" /></div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Registrando...' : 'Registrar Dueño'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                        <Card key={client.id}>
                            <CardContent className="p-4">
                                <h3 className="font-semibold">{client.name} {client.last_name}</h3>
                                <p className="text-sm text-gray-600">{client.phone}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    );
}
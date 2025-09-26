/* eslint-disable @typescript-eslint/no-unused-vars */
// Ruta: app/dashboard/pets/components/PetsAndOwners.tsx

'use client'

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'

// Asumiendo que tienes estos componentes de shadcn/ui
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"

// Tipos que coinciden 100% con tu nuevo esquema
interface Client {
    id: string;
    name: string; // Corregido de first_name a name
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
    sex?: string | null; // Será 'M' o 'F'
    birth_date?: string | null;
    clients: Client; // El cliente asociado
}

export default function PetsAndOwners({ initialPets, initialClients, activeOrgId }: { initialPets: Pet[], initialClients: Client[], activeOrgId: string }) {
    const supabase = createClient()
    const router = useRouter()

    const [pets, setPets] = useState(initialPets)
    const [clients, setClients] = useState(initialClients)
    const [searchTerm, setSearchTerm] = useState("")

    const [isPetDialogOpen, setIsPetDialogOpen] = useState(false)
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)

    const [petFormData, setPetFormData] = useState({
        client_id: "",
        name: "",
        species: "",
        breed: "",
        sex: "",
        birth_date: "",
    })

    const [clientFormData, setClientFormData] = useState({
        name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
    })

    const handlePetSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await supabase.from("pets").insert([{
            ...petFormData,
            org_id: activeOrgId
        }])

        if (!error) {
            setIsPetDialogOpen(false)
            router.refresh()
        } else {
            console.error("Error creating pet:", error)
        }
    }

    const handleClientSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await supabase.from("clients").insert([{
            ...clientFormData,
            org_id: activeOrgId
        }])

        if (!error) {
            setIsClientDialogOpen(false)
            router.refresh()
        } else {
            console.error("Error creating client:", error)
        }
    }

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
                                    <div><Label>Especie</Label><Input onChange={(e) => setPetFormData({ ...petFormData, species: e.target.value })} required /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Raza</Label><Input onChange={(e) => setPetFormData({ ...petFormData, breed: e.target.value })} /></div>
                                    <div>
                                        <Label>Sexo</Label>
                                        <Select onValueChange={(value) => setPetFormData({ ...petFormData, sex: value })}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar sexo" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="M">Macho</SelectItem> {/* Corregido a 'M' */}
                                                <SelectItem value="F">Hembra</SelectItem> {/* Corregido a 'F' */}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div><Label>Fecha de Nacimiento</Label><Input type="date" onChange={(e) => setPetFormData({ ...petFormData, birth_date: e.target.value })} /></div>
                                <Button type="submit" className="w-full">Registrar Mascota</Button>
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
                                <p className="text-sm text-gray-500">{pet.breed} - {pet.sex === 'M' ? 'Macho' : 'Hembra'}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="duenos" className="space-y-6">
                <div className="flex justify-between">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input placeholder="Buscar dueños..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Agregar Dueño</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Nuevo Dueño</DialogTitle></DialogHeader>
                            <form onSubmit={handleClientSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Nombre</Label><Input onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })} required /></div>
                                    <div><Label>Apellido</Label><Input onChange={(e) => setClientFormData({ ...clientFormData, last_name: e.target.value })} required /></div>
                                </div>
                                <div><Label>Teléfono</Label><Input onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })} required /></div>
                                <div><Label>Email</Label><Input type="email" onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })} /></div>
                                <div><Label>Dirección</Label><Input onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })} /></div>
                                <Button type="submit" className="w-full">Registrar Dueño</Button>
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
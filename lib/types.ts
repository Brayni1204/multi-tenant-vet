// lib/types.ts
export type ClientRow = {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    created_at: string
}

export type PetRow = {
    id: string
    org_id: string
    client_id: string
    name: string
    species: string
    breed: string | null
    sex: 'M' | 'F' | null
    birth_date: string | null // date en texto
    created_at: string
}

export type VetRow = {
    id: string
    org_id: string
    full_name: string
    license_code: string | null
    created_at: string
}

export type AppointmentRow = {
    id: string
    org_id: string
    pet_id: string
    veterinarian_id: string | null
    starts_at: string
    ends_at: string
    reason: string | null
    status: 'scheduled' | 'done' | 'cancelled'
}

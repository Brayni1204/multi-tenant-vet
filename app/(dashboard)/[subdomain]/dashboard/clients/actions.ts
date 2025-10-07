/* eslint-disable @typescript-eslint/no-explicit-any */
// Ruta: app/(dashboard)/[subdomain]/dashboard/clients/actions.ts
'use server'

//import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
import { revalidatePath } from 'next/cache'

// Define la estructura de la respuesta de la API de DNI
type DniApiResponse = {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    numeroDocumento: string;
}

export async function addClientByDni(formData: FormData) {
    const dni = formData.get('dni') as string
    const orgId = formData.get('orgId') as string

    if (!dni || !orgId) {
        return { error: 'Faltan DNI o ID de organización.' }
    }

    // --- 1. Consultar API externa ---
    try {
        const apiResponse = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
            headers: {
                'Authorization': `Bearer ${process.env.DNI_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!apiResponse.ok) {
            throw new Error('El DNI no fue encontrado o hubo un error en la consulta.');
        }

        const dniData: DniApiResponse = await apiResponse.json();
        const fullName = `${dniData.nombres} ${dniData.apellidoPaterno} ${dniData.apellidoMaterno}`;

        // --- 2. Usar cliente Admin de Supabase para crear usuario ---
        const supabaseAdmin = createAdminClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verificar si el cliente ya existe en esta organización por DNI
        const { data: existingProfile, } = await supabaseAdmin
            .from('profiles')
            .select('id, user_organizations!inner(org_id)')
            .eq('dni', dniData.numeroDocumento)
            .eq('user_organizations.org_id', orgId)
            .maybeSingle();

        if (existingProfile) {
            return { error: `El cliente con DNI ${dniData.numeroDocumento} ya está registrado en esta clínica.` };
        }

        // --- 3. Crear el usuario en Supabase Auth ---
        // Usamos un email temporal. El cliente lo actualizará al reclamar su cuenta.
        const tempEmail = `${dniData.numeroDocumento}@placeholder.vet`;
        const tempPassword = `temp_${Date.now()}`; // Contraseña temporal aleatoria

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: tempEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
            },
        });

        if (authError) {
            // Si el email temporal ya existe, podría ser un cliente registrado en otra clínica
            if (authError.message.includes('duplicate key value')) {
                return { error: `Este DNI ya está asociado a otra cuenta en el sistema.` };
            }
            throw new Error(`Error al crear usuario de autenticación: ${authError.message}`);
        }

        // --- 4. Actualizar la tabla 'profiles' con los datos del DNI ---
        // El trigger debería haber creado el perfil, aquí lo actualizamos
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: fullName,
                name: dniData.nombres,
                last_name: `${dniData.apellidoPaterno} ${dniData.apellidoMaterno}`,
                dni: dniData.numeroDocumento,
            })
            .eq('id', authData.user.id);

        if (profileError) {
            throw new Error(`Error al actualizar el perfil: ${profileError.message}`);
        }

        // --- 5. Vincular usuario a la organización con rol de 'client' ---
        const { error: linkError } = await supabaseAdmin
            .from('user_organizations')
            .insert({ user_id: authData.user.id, org_id: orgId, role: 'client' });

        if (linkError) {
            throw new Error(`Error al vincular el cliente a la clínica: ${linkError.message}`);
        }

        // Refrescar los datos de la página de clientes
        revalidatePath('/dashboard/clients');
        return { success: `Cliente ${fullName} registrado con éxito.` };

    } catch (error: any) {
        console.error("Error en addClientByDni:", error);
        return { error: error.message };
    }
}
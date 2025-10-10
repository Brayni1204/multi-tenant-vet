// components/DashboardSidebar.tsx

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import OrgSwitcher from "@/components/OrgSwitcher";
import { logout } from "@/app/auth/actions";
import { Users, Dog, Home, LogOut, PawPrint, Calendar, ClipboardList } from "lucide-react";
import { Database } from "@/types/supabase";

export type Organization = Database['public']['Tables']['organizations']['Row'];

export function DashboardSidebar({ subdomain, orgs, activeOrg }: { subdomain: string; orgs: Organization[]; activeOrg: Organization }) {
    const pathname = usePathname();

    const linkClasses = (path: string) => {
        // Remove the subdomain from the pathname to make it match the link href
        const pathnameWithoutSubdomain = pathname.replace(`/${subdomain}`, '');
        const isActive = pathnameWithoutSubdomain === path || (path === '/dashboard' && pathnameWithoutSubdomain === '/');

        return `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${isActive ? 'bg-[#e3f2fd] text-[#1a73e8]' : 'text-[#4a4a4a] hover:bg-[#f3f4f6] hover:text-[#1a73e8]'
            }`;
    };

    return (
        <aside className="w-72 flex-shrink-0 border-r border-[#e0e0e0] bg-white flex-col hidden md:flex shadow-lg">
            <div className="h-20 flex items-center px-6 border-b border-[#e0e0e0]">
                <div className="flex items-center space-x-2 text-xl font-bold text-[#4a4a4a]">
                    <PawPrint className="h-6 w-6 text-[#1a73e8]" />
                    <span>AdminVet</span>
                </div>
            </div>
            <div className="p-4 border-b border-[#e0e0e0]">
                <OrgSwitcher orgs={orgs} activeOrg={activeOrg} />
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <Link href={`/dashboard`} className={linkClasses('/dashboard')}>
                    <Home className="h-5 w-5" />
                    Inicio
                </Link>
                <Link href={`/dashboard/clients`} className={linkClasses('/dashboard/clients')}>
                    <Users className="h-5 w-5" />
                    Clientes
                </Link>
                <Link href={`/dashboard/pets`} className={linkClasses('/dashboard/pets')}>
                    <Dog className="h-5 w-5" />
                    Mascotas
                </Link>
                <Link href={`/dashboard/appointments`} className={linkClasses('/dashboard/appointments')}>
                    <Calendar className="h-5 w-5" />
                    Citas
                </Link>
                <Link href={`/dashboard/medical-records`} className={linkClasses('/dashboard/medical-records')}>
                    <ClipboardList className="h-5 w-5" />
                    Historiales
                </Link>
                <Link href={`/dashboard/users`} className={linkClasses('/dashboard/users')}>
                    <Users className="h-5 w-5" />
                    Usuarios
                </Link>
            </nav>
            <div className="mt-auto p-4 border-t border-[#e0e0e0]">
                <form action={logout}>
                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-[#e83a3a] transition-all hover:bg-[#ffebeb]">
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                    </button>
                </form>
            </div>
        </aside>
    );
}
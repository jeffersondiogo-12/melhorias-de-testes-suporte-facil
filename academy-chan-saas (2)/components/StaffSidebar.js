// components/StaffSidebar.js
import Link from 'next/link';
import { Users, LayoutDashboard, LogOut, MessageSquare, Settings, UserPlus } from 'lucide-react';

// Componente Sidebar separado para ser reutilizado
export default function StaffSidebar({ user, handleLogout, activePath }) {
    const isAdmin = user?.role === 'admin';
    return (
        <aside className="w-20 lg:w-64 bg-dark text-white flex flex-col fixed h-full transition-all duration-300 z-30">
            <div className="p-6 flex items-center gap-3 border-b border-gray-700">
                <div className="w-8 h-8 bg-brand rounded-lg"></div>
                <span className="font-bold text-xl hidden lg:block">Academy-chan PRO</span> 
            </div>
            
            <nav className="flex-1 py-6 space-y-1">
                {/* Chamados (Principal para Agente/Admin) */}
                <Link href="/dashboard/tickets" className={`px-4 py-3 ${activePath === 'tickets' ? 'bg-brand/10 border-r-4 border-brand text-brand' : 'text-gray-400 hover:text-white hover:bg-white/5'} flex items-center gap-4 cursor-pointer transition-colors`}>
                    <MessageSquare size={22} /> <span className="hidden lg:block font-medium">Chamados</span>
                </Link>
                {/* Empresas */}
                <Link href="/dashboard" className={`px-4 py-3 ${activePath === 'companies' ? 'bg-brand/10 border-r-4 border-brand text-brand' : 'text-gray-400 hover:text-white hover:bg-white/5'} flex items-center gap-4 cursor-pointer transition-colors`}>
                    <Users size={22} /> <span className="hidden lg:block font-medium">Empresas</span>
                </Link>
                {/* Relatórios (Habilitado) */}
                <Link href="/dashboard/reports" className={`px-4 py-3 ${activePath === 'reports' ? 'bg-brand/10 border-r-4 border-brand text-brand' : 'text-gray-400 hover:text-white hover:bg-white/5'} flex items-center gap-4 cursor-pointer transition-colors`}>
                    <LayoutDashboard size={22} /> <span className="hidden lg:block font-medium">Relatórios</span> 
                </Link>
                {/* Gestão de Staff (Apenas Admin) */}
                {isAdmin && activePath !== 'create-user' && (
                    <Link href="/dashboard/create-user" className="px-4 py-3 text-red-400 hover:text-red-300 hover:bg-white/5 flex items-center gap-4 cursor-pointer transition-colors">
                        <UserPlus size={22} /> <span className="hidden lg:block font-medium">Criar Usuário Staff</span>
                    </Link>
                )}
            </nav>

            <div className="p-4 mt-auto border-t border-gray-700">
                <div className='mb-2 text-sm text-gray-300 hidden lg:block'>Logado como: {user?.role}</div>
                <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-white w-full">
                    <LogOut size={20} /> <span className="hidden lg:block text-sm">Sair</span>
                </button>
            </div>
        </aside>
    )
}
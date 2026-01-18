// components/ClientSidebar.js
import Link from 'next/link';
import { LayoutDashboard, Users, MessageSquare, User, LogOut } from 'lucide-react';

export default function ClientSidebar({ user, handleLogout, activePath }) {
    const canManageUsers = user?.role === 'company_admin' || user?.role === 'company_manager';

    return (
        <aside className="w-20 lg:w-64 bg-dark text-white flex flex-col fixed h-full transition-all duration-300 z-30">
            <div className="p-6 flex items-center gap-3 border-b border-gray-700">
                <div className="w-8 h-8 bg-brand rounded-lg"></div>
                <span className="font-bold text-xl hidden lg:block">Portal Cliente</span>
            </div>

            <nav className="flex-1 py-6 space-y-1">
                <Link href="/client-dashboard" className={`px-4 py-3 ${activePath === 'dashboard' ? 'bg-brand/10 border-r-4 border-brand text-brand' : 'text-gray-400 hover:text-white hover:bg-white/5'} flex items-center gap-4 cursor-pointer transition-colors`}>
                    <LayoutDashboard size={22} /> <span className="hidden lg:block font-medium">Painel</span>
                </Link>

                {canManageUsers && (
                    <Link href={`/dashboard/company/${user.companyId}`} className={`px-4 py-3 ${activePath === 'users' ? 'bg-brand/10 border-r-4 border-brand text-brand' : 'text-gray-400 hover:text-white hover:bg-white/5'} flex items-center gap-4 cursor-pointer transition-colors`}>
                        <Users size={22} /> <span className="hidden lg:block font-medium">Gerenciar Usuários</span>
                    </Link>
                )}

                <Link href={`/company/${user.companyId}/chat`} className={`px-4 py-3 ${activePath === 'chats' ? 'bg-brand/10 border-r-4 border-brand text-brand' : 'text-gray-400 hover:text-white hover:bg-white/5'} flex items-center gap-4 cursor-pointer transition-colors`}>
                    <MessageSquare size={22} /> <span className="hidden lg:block font-medium">Chats</span>
                </Link>
            </nav>

            <div className="p-4 mt-auto border-t border-gray-700">
                <Link href={`/dashboard/user/${user.id}`} className="flex items-center gap-3 text-gray-400 hover:text-white w-full mb-4">
                    <User size={20} /> <span className="hidden lg:block text-sm">Meu Perfil</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-white w-full">
                    <LogOut size={20} /> <span className="hidden lg:block text-sm">Sair</span>
                </button>
            </div>
        </aside>
    );
}
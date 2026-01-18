'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTickets, getReportData } from '@/lib/api';
import Link from 'next/link';
import { Plus, MessageSquare, FileText, BarChart, XCircle } from 'lucide-react';
import ClientSidebar from '../../components/ClientSidebar';
import ModuleBlocked from '@/components/ModuleBlocked';

export default function ClientDashboard() {
    const [tickets, setTickets] = useState([]);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const u = JSON.parse(sessionStorage.getItem('user'));
        if (!u || !['company_user', 'company_admin', 'company_manager'].includes(u.role)) return router.push('/');
        // Adiciona o avatar ao objeto do usuário para uso na sidebar
        const userWithAvatar = { ...u, avatar: u.avatar || `https://i.pravatar.cc/150?u=${u.id}` };
        setUser(userWithAvatar);
        getTickets(u).then(res => setTickets(res.data));
    }, []);

    const getAccessLevel = (moduleId) => {
        return user?.permissions ? user.permissions[moduleId] : 'NEGADO';
    }

    const handleLogout = () => {
        sessionStorage.clear();
        router.push('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-surface flex">
            <ClientSidebar user={user} handleLogout={handleLogout} activePath="dashboard" />

            <main className="flex-1 ml-20 lg:ml-64 p-8">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-dark mb-2">Bem-vindo, {user.name}</h2>
                        <p className="text-gray-500">Este é o seu painel de cliente. Gerencie seus chamados e serviços.</p>
                    </div>
                    {/* Permite abrir chamado apenas se tiver acesso TOTAL */}
                    {getAccessLevel('MOD_TICKETS') === 'TOTAL' && (
                        <Link href="/new-ticket" className="bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-bold transition-transform hover:-translate-y-0.5">
                            <Plus size={20} /> Abrir Chamado
                        </Link>
                    )}
                </div>

                {/* Módulos de Acesso (Dependente da Permissão) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: TICKETS */}
                    {getAccessLevel('MOD_TICKETS') !== 'NEGADO' ? (
                        <div className={`col-span-1 md:col-span-2 bg-white rounded-xl shadow-card p-6 border-t-4 ${getAccessLevel('MOD_TICKETS') === 'TOTAL' ? 'border-brand' : 'border-amber-400'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-dark flex items-center gap-2"><MessageSquare size={20} className='text-brand'/> Gestão de Tickets</h2>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getAccessLevel('MOD_TICKETS') === 'TOTAL' ? 'bg-brand/20 text-brand' : 'bg-amber-400/20 text-amber-700'}`}>{getAccessLevel('MOD_TICKETS')}</span>
                            </div>
                            
                            <div className="space-y-3 max-h-96 overflow-auto pr-2">
                                {tickets.length > 0 ? tickets.map(t => (
                                    <Link key={t.id} href={`/ticket/${t.id}`} className="block border border-gray-100 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <span className='font-medium text-sm text-dark'>{t.subject} <span className='text-gray-400 text-xs'>({t.number})</span></span>
                                            <span className={`badge ${t.status === 'Resolvido' ? 'badge-resolvido' : t.status === 'Em andamento' ? 'badge-andamento' : 'badge-pendente'}`}>
                                                {t.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{t.description}</p>
                                    </Link>
                                )) : (
                                    <p className="text-gray-400 text-center p-4 border border-dashed rounded-lg">Nenhum chamado visível ou acesso negado.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <ModuleBlocked title="Tickets" icon={<XCircle size={20} />} className='col-span-1 md:col-span-2' />
                    )}

                    {/* Card 2: FINANCEIRO */}
                    {getAccessLevel('MOD_FINANCE') !== 'NEGADO' ? (
                        <div className={`bg-white rounded-xl shadow-card p-6 border-t-4 ${getAccessLevel('MOD_FINANCE') === 'TOTAL' ? 'border-brand' : 'border-amber-400'}`}>
                            <h2 className="text-xl font-bold mb-4 text-dark flex items-center gap-2"><FileText size={20} className='text-dark'/> Financeiro</h2>
                            {getAccessLevel('MOD_FINANCE') === 'TOTAL' ? (
                                <p className="text-2xl font-bold text-red-500">R$ 1.500,00 <span className="text-sm text-gray-500 font-normal">em aberto</span></p>
                            ) : (
                                <p className="text-sm text-amber-500">Acesso apenas para consulta (Read Only). Contate o Agente para ação.</p>
                            )}
                        </div>
                    ) : (
                        <ModuleBlocked title="Financeiro" icon={<XCircle size={20} />} />
                    )}

                    {/* Card 3: RELATÓRIOS (Demonstração de Card Pequeno Bloqueado) */}
                    {getAccessLevel('MOD_REPORTS') !== 'NEGADO' ? (
                        <div className={`bg-white rounded-xl shadow-card p-6 border-t-4 ${getAccessLevel('MOD_REPORTS') === 'TOTAL' ? 'border-brand' : 'border-amber-400'}`}>
                            <h2 className="text-xl font-bold mb-4 text-dark flex items-center gap-2"><BarChart size={20} className='text-dark'/> Relatórios</h2>
                            <p className="text-sm text-gray-500">Acesso aos dashboards de performance.</p>
                        </div>
                    ) : (
                        <ModuleBlocked title="Relatórios" icon={<XCircle size={20} />} />
                    )}

                </div>
            </main>
        </div>
    );
}
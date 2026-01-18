'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTickets } from '@/lib/api';
import StaffSidebar from '@/components/StaffSidebar'; 
import { MessageSquare, BarChart, Search } from 'lucide-react';

export default function AgentTicketsDashboard() {
    const [tickets, setTickets] = useState([]);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // NOVO: Estado para termo de pesquisa
    const router = useRouter();

    useEffect(() => { 
        const u = JSON.parse(sessionStorage.getItem('user'));
        if (!u || !['agent', 'admin'].includes(u.role)) return router.push('/');
        setUser(u);
        loadTickets(u); 
    }, []);

    const loadTickets = async (user) => {
        const { data } = await getTickets(user);
        setTickets(data);
    };
    
    const handleLogout = () => {sessionStorage.clear(); router.push('/')};
    
    // NOVO: Lógica de Filtragem
    const filteredTickets = tickets.filter(ticket =>
        ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-surface flex">
            {/* Sidebar */}
            <StaffSidebar user={user} handleLogout={handleLogout} activePath="tickets" />
            
            {/* Conteúdo */}
            <main className="flex-1 ml-20 lg:ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-dark">Todos os Chamados ({tickets.length})</h2>
                    <Link href="/dashboard/reports" className="bg-brand text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-brand-dark transition-all shadow-md">
                        <BarChart size={18} /> Ver Relatórios
                    </Link>
                </header>

                {/* NOVO: Campo de Pesquisa */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Pesquisar por número, assunto ou cliente..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4">Chamado</th>
                                <th className="p-4 hidden sm:table-cell">Assunto</th>
                                <th className="p-4">Empresa / Cliente</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Utiliza a lista filtrada */}
                            {filteredTickets.map(t => ( 
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-brand">{t.number}</td>
                                    <td className="p-4 text-sm text-gray-700 hidden sm:table-cell">{t.subject}</td>
                                    <td className="p-4 text-sm text-gray-500">{t.clientName} ({t.companyId})</td>
                                    <td className="p-4 text-center">
                                        <span className={`badge ${t.status === 'Resolvido' ? 'badge-resolvido' : t.status === 'Em andamento' ? 'badge-andamento' : 'badge-pendente'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/ticket/${t.id}`} className="text-dark bg-gray-200 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors">
                                            Responder/Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Mensagem de Sem Resultados */}
                    {filteredTickets.length === 0 && searchTerm && 
                        <p className="p-8 text-center text-gray-500">Nenhum chamado encontrado com o termo "{searchTerm}".</p>
                    }
                    {/* Mensagem de Lista Vazia */}
                    {tickets.length === 0 && !searchTerm && 
                        <p className="p-8 text-center text-gray-500">Nenhum chamado registrado no sistema.</p>
                    }
                </div>
            </main>
        </div>
    );
}
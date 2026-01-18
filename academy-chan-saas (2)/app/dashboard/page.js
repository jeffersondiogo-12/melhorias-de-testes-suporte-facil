'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// IMPORTANTE: Adicionado getTickets
import { getCompanies, createCompany, createUser, getTickets } from '@/lib/api'; 
import StaffSidebar from '@/components/StaffSidebar'; 
// IMPORTANTE: Adicionado MessageSquare para o ícone
import { Building2, Plus, MessageSquare } from 'lucide-react'; 

// Página Principal: Gestão de Empresas E RESUMO DE CHAMADOS
export default function CompanyDashboard() {
    const [companies, setCompanies] = useState([]);
    // NOVO: Estado para os últimos tickets
    const [latestTickets, setLatestTickets] = useState([]); 
    const [showModal, setShowModal] = useState(false);
    const [newComp, setNewComp] = useState({ id: '', name: '', cnpj: '' });
    const [createInitialAdmin, setCreateInitialAdmin] = useState(false);
    const [initialAdmin, setInitialAdmin] = useState({ name: '', email: '', password: '', role: 'company_admin', permissions: { 'MOD_TICKETS': 'TOTAL', 'MOD_FINANCE': 'LEITURA', 'MOD_REPORTS': 'LEITURA' } });
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => { 
        const u = JSON.parse(sessionStorage.getItem('user'));
        if (!u || !['agent', 'admin'].includes(u.role)) return router.push('/');
        setUser(u);
        load(u); // Passa o usuário para carregar os tickets
    }, []);

    const load = async (u) => {
        // 1. Carregar Empresas
        const companyResponse = await getCompanies();
        setCompanies(companyResponse.data);
        
        // 2. Carregar Tickets e criar o resumo
        const ticketResponse = await getTickets(u); 
        // Ordena por ID (mais recente primeiro) e pega os 3 primeiros
        const sortedTickets = ticketResponse.data
            .sort((a, b) => b.id - a.id)
            .slice(0, 3);
        setLatestTickets(sortedTickets);
    };

    const handleCreate = async () => {
        if (!newComp.name || !newComp.cnpj || !newComp.id) return alert('Preencha todos os campos, incluindo o número da empresa!');
        try {
            const comp = await createCompany(newComp);
            if (createInitialAdmin) {
                // Criar usuário admin vinculado à empresa
                await createUser({
                    name: initialAdmin.name || `${comp.data.name} Admin`,
                    email: initialAdmin.email || `admin@${comp.data.id}`,
                    password: initialAdmin.password || 'changeme',
                    role: initialAdmin.role,
                    companyId: comp.data.id,
                    permissions: initialAdmin.permissions || {}
                });
            }
            setShowModal(false);
            setNewComp({ id: '', name: '', cnpj: '' });
            setCreateInitialAdmin(false);
            setInitialAdmin({ name: '', email: '', password: '', role: 'company_admin', permissions: { 'MOD_TICKETS': 'TOTAL', 'MOD_FINANCE': 'LEITURA', 'MOD_REPORTS': 'LEITURA' } });
            load(user); // Recarrega com o usuário
        } catch (err) {
            alert(err?.response?.data?.message || 'Erro ao criar empresa');
        }
    };
    
    const handleLogout = () => {sessionStorage.clear(); router.push('/')};
    
    if (!user) return null; // Espera o usuário carregar

    return (
        <div className="min-h-screen bg-surface flex">
            {/* Sidebar */}
            <StaffSidebar user={user} handleLogout={handleLogout} activePath="companies" />
            
            {/* Conteúdo */}
            <main className="flex-1 ml-20 lg:ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-dark">Painel Principal</h2>
                    <button onClick={() => setShowModal(true)} className="bg-brand text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-brand-dark transition-all shadow-md">
                        <Plus size={18} /> Nova Empresa
                    </button>
                </header>

                {/* NOVO: Layout em Grid para incluir o Resumo de Chamados na lateral */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Coluna Principal: Lista de Empresas (3/4 da largura no desktop) */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {companies.map(comp => (
                            <div key={comp.id} className="bg-white p-6 rounded-xl shadow-card hover:shadow-floating transition-all border-l-4 border-brand">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-dark">{comp.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">CNPJ: {comp.cnpj}</p>
                                    </div>
                                    <Building2 className="text-gray-300" size={24} />
                                </div>
                                <div className="mt-6 pt-4 border-t flex justify-end">
                                    <Link href={`/dashboard/company/${comp.id}`} className="text-brand font-semibold text-sm hover:underline flex items-center gap-1">
                                        Gerenciar Usuários (Clientes)
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Coluna Lateral: Resumo dos Chamados (1/4 da largura no desktop) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-card border-t-4 border-dark">
                            <h3 className="font-bold text-lg text-dark mb-4 border-b pb-2 flex items-center gap-2">
                                <MessageSquare size={18} className='text-dark'/> Últimos Chamados
                            </h3>
                            
                            {latestTickets.length > 0 ? (
                                <div className="space-y-3">
                                    {latestTickets.map(t => (
                                        <Link 
                                            key={t.id} 
                                            href={`/ticket/${t.id}`} 
                                            className="block p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <p className="text-xs font-bold text-brand">{t.number}</p>
                                            <p className="text-sm font-medium text-gray-800 truncate">{t.subject}</p>
                                            <span className={`badge ${t.status === 'Resolvido' ? 'badge-resolvido' : t.status === 'Em andamento' ? 'badge-andamento' : 'badge-pendente'} mt-1`}>
                                                {t.status}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Nenhum chamado recente.</p>
                            )}
                            
                            <Link href="/dashboard/tickets" className="block mt-4 pt-4 border-t text-sm text-brand font-semibold hover:underline">
                                Ver Todos os Chamados
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Nova Empresa (Permanece o mesmo) */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-dark">Cadastrar Nova Empresa</h3>
                            <input className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition" 
                                placeholder="Número da Empresa (ID)" value={newComp.id} onChange={e => setNewComp({...newComp, id: e.target.value})} required/>
                            <input className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition" 
                                placeholder="Nome da Empresa" value={newComp.name} onChange={e => setNewComp({...newComp, name: e.target.value})} required/>
                            <input className="w-full border p-3 mb-4 rounded-lg focus:ring-2 focus:ring-brand outline-none transition" 
                                placeholder="CNPJ" value={newComp.cnpj} onChange={e => setNewComp({...newComp, cnpj: e.target.value})} required/>

                            <label className="flex items-center gap-2 text-sm mb-3">
                                <input type="checkbox" checked={createInitialAdmin} onChange={e => setCreateInitialAdmin(e.target.checked)} />
                                <span>Criar conta administrativa inicial para esta empresa</span>
                            </label>

                            {createInitialAdmin && (
                                <div className="border p-3 rounded mb-3 bg-gray-50">
                                    <input className="w-full border p-2 mb-2 rounded" placeholder="Nome do Admin" value={initialAdmin.name} onChange={e => setInitialAdmin({...initialAdmin, name: e.target.value})} />
                                    <input className="w-full border p-2 mb-2 rounded" placeholder="E-mail (login)" value={initialAdmin.email} onChange={e => setInitialAdmin({...initialAdmin, email: e.target.value})} />
                                    <input className="w-full border p-2 mb-2 rounded" placeholder="Senha inicial" value={initialAdmin.password} onChange={e => setInitialAdmin({...initialAdmin, password: e.target.value})} />
                                    <div className="flex gap-2 mb-2">
                                        <label className="flex-1">
                                            <div className="text-xs text-gray-600">Papel</div>
                                            <select className="w-full p-2 border rounded" value={initialAdmin.role} onChange={e => setInitialAdmin({...initialAdmin, role: e.target.value})}>
                                                <option value="company_admin">Administrador da Empresa</option>
                                                <option value="company_manager">Gerente</option>
                                                <option value="company_user">Usuário Cliente</option>
                                            </select>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <label className="text-xs">Chamados
                                            <select className="w-full p-2 border rounded mt-1" value={initialAdmin.permissions['MOD_TICKETS']} onChange={e => setInitialAdmin({...initialAdmin, permissions: {...initialAdmin.permissions, 'MOD_TICKETS': e.target.value}})}>
                                                <option value="TOTAL">TOTAL</option>
                                                <option value="LEITURA">LEITURA</option>
                                                <option value="NEGADO">NEGADO</option>
                                            </select>
                                        </label>
                                        <label className="text-xs">Financeiro
                                            <select className="w-full p-2 border rounded mt-1" value={initialAdmin.permissions['MOD_FINANCE']} onChange={e => setInitialAdmin({...initialAdmin, permissions: {...initialAdmin.permissions, 'MOD_FINANCE': e.target.value}})}>
                                                <option value="TOTAL">TOTAL</option>
                                                <option value="LEITURA">LEITURA</option>
                                                <option value="NEGADO">NEGADO</option>
                                            </select>
                                        </label>
                                        <label className="text-xs">Relatórios
                                            <select className="w-full p-2 border rounded mt-1" value={initialAdmin.permissions['MOD_REPORTS']} onChange={e => setInitialAdmin({...initialAdmin, permissions: {...initialAdmin.permissions, 'MOD_REPORTS': e.target.value}})}>
                                                <option value="TOTAL">TOTAL</option>
                                                <option value="LEITURA">LEITURA</option>
                                                <option value="NEGADO">NEGADO</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>
                            )}
                        <div className="flex gap-2">
                            <button onClick={handleCreate} className="flex-1 bg-brand text-white p-3 rounded-lg font-bold hover:bg-brand-dark transition">Salvar</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCompanyUsers, createUser, MOCK_COMPANIES } from '@/lib/api'; 
import Link from 'next/link';
import { ArrowLeft, UserPlus, Settings } from 'lucide-react';

export default function CompanyUsers() {
    const { id } = useParams();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'company_user', companyId: parseInt(id), permissions: { 'MOD_TICKETS': 'TOTAL', 'MOD_FINANCE': 'LEITURA', 'MOD_REPORTS': 'LEITURA' } });
    const companyName = MOCK_COMPANIES.find(c => c.id == id)?.name || 'Empresa';

    useEffect(() => { 
        const u = JSON.parse(sessionStorage.getItem('user'));
        // Allow global agent/admin OR company_admin/company_manager of this company
        if (!u || !(
            ['agent', 'admin'].includes(u.role) ||
            (['company_admin', 'company_manager'].includes(u.role) && u.companyId == id))) {
            return router.push('/');
        }
        load(); 
    }, [id]);

    const load = async () => {
        const { data } = await getCompanyUsers(id);
        setUsers(data);
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) return alert('Preencha todos os campos!');
        await createUser(newUser);
        setShowModal(false);
        setNewUser(prev => ({...prev, name: '', email: '', password: ''}));
        load();
    };

    return (
        <div className="min-h-screen bg-surface p-8">
            <div className="max-w-5xl mx-auto">
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-dark transition-colors">
                    <ArrowLeft size={18} /> Voltar para Gestão de Empresas
                </button>

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-dark">Usuários de <span className='text-brand'>{companyName}</span></h1>
                        <p className='text-gray-500'>Gerencie acessos de clientes da empresa. Aqui você define quem pode fazer o que (CRUD).</p>
                    </div>
                    <div className="flex gap-2">
                        <a href={`/company/${id}/chat`} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-200">Abrir Chats</a>
                        <button onClick={() => setShowModal(true)} className="bg-brand text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-brand-dark transition-all">
                            <UserPlus size={18} /> Novo Usuário
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4">Nome</th>
                                <th className="p-4">Email (Login)</th>
                                <th className="p-4">Papel</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-dark">{u.name}</td>
                                    <td className="p-4 text-gray-500 text-sm">{u.email}</td>
                                            <td className="p-4"><span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">{u.role?.toUpperCase() || 'CLIENTE'}</span></td>
                                    <td className="p-4 text-center">
                                        <Link href={`/dashboard/user/${u.id}`} className="inline-flex items-center gap-1 text-dark bg-gray-200 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors">
                                            <Settings size={14} /> Permissões & Dados
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <p className="p-8 text-center text-gray-500">Nenhum usuário cliente cadastrado.</p>}
                </div>
            </div>

            {/* Modal Criar Usuário */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-dark">Novo Usuário</h3>
                        <input className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition" placeholder="Nome Completo" 
                            value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required/>
                        <input className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition" placeholder="Email (Login)" 
                            value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required/>
                        <input className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition" type="password" placeholder="Senha Inicial" 
                            value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required/>

                        <div className="mb-3">
                            <label className="text-xs text-gray-600">Papel</label>
                            <select className="w-full p-2 border rounded" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                <option value="company_user">Usuário Cliente</option>
                                <option value="company_admin">Administrador da Empresa</option>
                                <option value="company_manager">Gerente</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                            <label className="text-xs">Chamados
                                <select className="w-full p-2 border rounded mt-1" value={newUser.permissions['MOD_TICKETS']} onChange={e => setNewUser({...newUser, permissions: {...newUser.permissions, 'MOD_TICKETS': e.target.value}})}>
                                    <option value="TOTAL">TOTAL</option>
                                    <option value="LEITURA">LEITURA</option>
                                    <option value="NEGADO">NEGADO</option>
                                </select>
                            </label>
                            <label className="text-xs">Financeiro
                                <select className="w-full p-2 border rounded mt-1" value={newUser.permissions['MOD_FINANCE']} onChange={e => setNewUser({...newUser, permissions: {...newUser.permissions, 'MOD_FINANCE': e.target.value}})}>
                                    <option value="TOTAL">TOTAL</option>
                                    <option value="LEITURA">LEITURA</option>
                                    <option value="NEGADO">NEGADO</option>
                                </select>
                            </label>
                            <label className="text-xs">Relatórios
                                <select className="w-full p-2 border rounded mt-1" value={newUser.permissions['MOD_REPORTS']} onChange={e => setNewUser({...newUser, permissions: {...newUser.permissions, 'MOD_REPORTS': e.target.value}})}>
                                    <option value="TOTAL">TOTAL</option>
                                    <option value="LEITURA">LEITURA</option>
                                    <option value="NEGADO">NEGADO</option>
                                </select>
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleCreateUser} className="flex-1 bg-brand text-white p-3 rounded-lg font-bold hover:bg-brand-dark transition">Salvar</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
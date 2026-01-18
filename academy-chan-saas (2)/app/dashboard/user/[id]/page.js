'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserDetails, updateUser, SYSTEM_MODULES } from '@/lib/api';
import { ArrowLeft, Save, KeyRound } from 'lucide-react';

export default function UserPermissions() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('cadastro'); 
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [permissions, setPermissions] = useState({});

    useEffect(() => {
        const load = async () => {
            const u = JSON.parse(sessionStorage.getItem('user'));
            if (!u) return router.push('/');

            // Global agents/admins can edit any user
            if (['agent', 'admin'].includes(u.role)) {
                const { data } = await getUserDetails(id);
                setUser(data);
                setFormData({ name: data.name, email: data.email, password: '' });
                setPermissions(data.permissions || {});
                return;
            }

            // Company admins/managers can edit users of their own company only
            if (['company_admin', 'company_manager'].includes(u.role)) {
                const { data } = await getUserDetails(id);
                if (data.companyId != u.companyId) return router.push('/');
                setUser(data);
                setFormData({ name: data.name, email: data.email, password: '' });
                setPermissions(data.permissions || {});
                return;
            }

            // Otherwise deny
            return router.push('/');
        };
        load();
    }, [id]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const dataToUpdate = { 
                name: formData.name,
                permissions: permissions
            };
            if (formData.password) {
                dataToUpdate.password = formData.password;
            }

            await updateUser(id, dataToUpdate);
            alert('Dados e Permissões salvos com sucesso!');
        } catch(e) {
            alert('Erro ao salvar: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-10 text-center text-gray-500">Carregando...</div>;

    const isClientUser = user.role === 'company_user';

    return (
        <div className="min-h-screen bg-surface p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-floating overflow-hidden">
                
                <div className="bg-white p-6 border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-dark">Gerenciar Usuário: {user.name}</h1>
                        <p className="text-sm text-gray-500">Papel: <span className='font-bold uppercase'>{user.role}</span> | Empresa: {user.companyId || 'N/A'}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => isClientUser ? router.push(`/dashboard/company/${user.companyId}`) : router.push('/dashboard/tickets')} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Voltar</button>
                        <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-brand text-white rounded-lg font-bold hover:bg-brand-dark flex items-center gap-2 transition-colors shadow-md disabled:opacity-50">
                            {loading ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
                        </button>
                    </div>
                </div>

                <div className="flex border-b px-6 pt-4 bg-gray-50">
                    <button 
                        onClick={() => setActiveTab('cadastro')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'cadastro' ? 'border-t-2 border-l-2 border-r-2 border-b-0 bg-white border-gray-200 text-brand rounded-t-lg relative top-[1px]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        CADASTRO & SENHA
                    </button>
                    {isClientUser && (
                        <button 
                            onClick={() => setActiveTab('permissoes')}
                            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'permissoes' ? 'border-t-2 border-l-2 border-r-2 border-b-0 bg-white border-gray-200 text-brand rounded-t-lg relative top-[1px]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            LIBERAÇÃO (PERMISSÕES CRUD)
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {activeTab === 'cadastro' && (
                        <div className="space-y-6 max-w-lg animate-fade-in">
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded text-sm">
                                Você pode alterar o nome e redefinir a senha do usuário. O email/login não é editável.
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Usuário</label>
                                <input className="w-full bg-gray-50 border p-3 rounded-lg text-dark focus:ring-2 focus:ring-brand outline-none" 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Login)</label>
                                <input className="w-full bg-gray-200 border p-3 rounded-lg text-gray-600 outline-none" 
                                    value={formData.email} disabled/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nova Senha (Deixe em branco para não alterar)</label>
                                <div className="flex gap-2">
                                    <input className="w-full bg-gray-50 border p-3 rounded-lg text-dark focus:ring-2 focus:ring-brand outline-none" 
                                        type="password" placeholder="********" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" onClick={() => setFormData({...formData, password: Math.random().toString(36).slice(-8)})} className="bg-dark text-white px-4 rounded-lg text-sm whitespace-nowrap flex items-center gap-1 hover:bg-dark-lighter transition">
                                        <KeyRound size={16} /> Gerar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'permissoes' && isClientUser && (
                        <div className="animate-fade-in">
                            <div className="bg-brand-light border border-brand/50 p-4 rounded-lg mb-6 text-sm text-brand-dark font-medium">
                                Defina o nível de acesso (CRUD) que este usuário terá em cada módulo da empresa.
                            </div>

                            <table className="w-full border-collapse border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-3 text-left text-xs font-bold text-gray-600 uppercase w-1/3">Módulo</th>
                                        <th className="border p-3 text-left text-xs font-bold text-gray-600 uppercase hidden sm:table-cell">Funcionalidades Chave</th>
                                        <th className="border p-3 text-left text-xs font-bold text-gray-600 uppercase w-40">Permissão</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {SYSTEM_MODULES.map(mod => (
                                        <tr key={mod.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="border p-3 font-medium text-dark">{mod.name}</td>
                                            <td className="border p-3 text-sm text-gray-500 hidden sm:table-cell">
                                                {mod.components.join(' • ')}
                                            </td>
                                            <td className="border p-3">
                                                <select 
                                                    className="w-full border border-gray-300 p-2 rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand outline-none transition"
                                                    value={permissions[mod.id] || 'NEGADO'}
                                                    onChange={(e) => setPermissions({...permissions, [mod.id]: e.target.value})}
                                                >
                                                    <option value="NEGADO">🚫 NEGADO (Sem Acesso)</option>
                                                    <option value="LEITURA">👁️ CONSULTA (Read Only)</option>
                                                    <option value="TOTAL">✅ TOTAL (CRUD)</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
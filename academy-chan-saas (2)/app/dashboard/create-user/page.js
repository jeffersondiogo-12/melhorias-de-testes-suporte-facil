'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '@/lib/api';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function CreateStaffUser() {
    const router = useRouter();
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'agent', companyId: null });
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const u = JSON.parse(sessionStorage.getItem('user'));
        if (u?.role !== 'admin') { 
            alert('Apenas o Admin Supremo pode criar novos Agentes/Admins.');
            router.push('/dashboard/tickets');
        }
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) return alert('Preencha todos os campos!');
        
        setLoading(true);
        try {
            await createUser(newUser);
            alert(`Novo ${newUser.role.toUpperCase()} criado com sucesso!`);
            router.push('/dashboard/tickets');
        } catch (error) {
            alert('Erro ao criar usuário.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface p-8">
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-floating p-8">
                <button onClick={() => router.push('/dashboard/tickets')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-dark transition-colors">
                    <ArrowLeft size={18} /> Voltar
                </button>

                <h1 className="text-3xl font-bold text-dark mb-6 flex items-center gap-2"><UserPlus size={28}/> Criar Novo Usuário de Staff</h1>
                <p className='text-gray-500 mb-6'>Crie novos Agentes de Suporte ou outros Administradores do sistema (acesso master).</p>

                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Papel</label>
                        <select 
                            className="w-full border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand outline-none transition"
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value})}
                        >
                            <option value="agent">Agente de Suporte</option>
                            <option value="admin">Administrador Supremo</option>
                        </select>
                    </div>
                    <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition" 
                        placeholder="Nome Completo" onChange={e => setNewUser({...newUser, name: e.target.value})} required/>
                    <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition" 
                        placeholder="Email (Login)" type="email" onChange={e => setNewUser({...newUser, email: e.target.value})} required/>
                    <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition" 
                        type="password" placeholder="Senha Inicial" onChange={e => setNewUser({...newUser, password: e.target.value})} required/>
                    
                    <button disabled={loading} type="submit" className="w-full bg-red-600 text-white p-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50">
                        {loading ? 'Salvando...' : `CRIAR ${newUser.role.toUpperCase()}`}
                    </button>
                </form>
            </div>
        </div>
    );
}
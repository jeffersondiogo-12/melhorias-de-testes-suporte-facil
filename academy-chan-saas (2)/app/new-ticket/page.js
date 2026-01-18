'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { createTicket } from '@/lib/api'; 

export default function NewTicket() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ subject: '', description: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const u = JSON.parse(sessionStorage.getItem('user'));
        if (!u || u.role !== 'company_user' || u.permissions.MOD_TICKETS !== 'TOTAL') {
            alert('Acesso negado. Você não tem permissão para abrir novos chamados.');
            router.push('/client-dashboard');
        }
        setUser(u);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.description) return alert('Preencha o assunto e a descrição.');
        
        setLoading(true);
        try {
            await createTicket(user, formData.subject, formData.description); 
            
            alert(`Chamado "${formData.subject}" criado com sucesso! Será redirecionado para o dashboard.`);
            router.push('/client-dashboard');
        } catch (e) {
             alert('Erro ao criar o chamado: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null; // Não renderiza até carregar o usuário

    return (
        <div className="min-h-screen bg-surface p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-floating p-8">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-dark transition-colors">
                    <ArrowLeft size={18} /> Voltar para Dashboard
                </button>
                
                <h1 className="text-3xl font-bold text-dark mb-6 flex items-center gap-3">
                    <PlusCircle size={30} className='text-brand'/> Abrir Novo Chamado
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Assunto</label>
                        <input
                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition"
                            type="text"
                            placeholder="Ex: Problema de acesso, Boleto atrasado..."
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Descrição Detalhada</label>
                        <textarea
                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition h-40"
                            placeholder="Descreva o problema com o máximo de detalhes."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand text-white p-3.5 rounded-lg font-bold hover:bg-brand-dark transition disabled:opacity-50 shadow-md"
                    >
                        {loading ? 'Enviando...' : 'FINALIZAR ABERTURA DO CHAMADO'}
                    </button>
                </form>
            </div>
        </div>
    );
}
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { ShieldCheck, User, Lock } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', pass: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const { data } = await login(form.email, form.pass);
        sessionStorage.setItem('user', JSON.stringify(data));
        
        const routes = { 
            'admin': '/dashboard', // Redireciona para a nova página com resumo
            'agent': '/dashboard', // Redireciona para a nova página com resumo
            'company_user': '/client-dashboard' 
        };
        router.push(routes[data.role] || '/');
    } catch (err) {
        setError(err?.response?.data?.message || 'Credenciais inválidas.');
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Lado Esquerdo - Branding */}
      <div className="md:w-1/2 bg-dark flex flex-col justify-center items-center text-white p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-dark to-dark opacity-90"></div>
        <div className="relative z-10 text-center">
            <ShieldCheck size={80} className="mx-auto mb-6 text-brand" />
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Academy-chan <span className='text-brand'>Suporte</span></h1> 
            <p className="text-gray-300 text-lg max-w-sm mx-auto">Gestão Multi-Empresas e Atendimento PRO.</p>
        </div>
      </div>

      {/* Lado Direito - Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md animate-fade-in">
            <h2 className="text-3xl font-bold text-dark mb-2">Acesso Restrito</h2>
            <p className="text-gray-500 mb-8">Insira suas credenciais.</p>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-5">
                <div className="relative">
                    <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all bg-white" 
                        placeholder="E-mail ou Usuário"
                        onChange={e => setForm({...form, email: e.target.value})}
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all bg-white" 
                        type="password" placeholder="Senha"
                        onChange={e => setForm({...form, pass: e.target.value})}
                    />
                </div>
                
                <button disabled={loading} className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70">
                    {loading ? 'Autenticando...' : 'ACESSAR PAINEL'}
                </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="text-xs text-gray-400">
                <p className="mb-1">Admin: admin / 000 · Agente: agente / 123</p>
                <p className="mb-1">Cliente (Tech Solutions): joao@tech.com / 456</p>
              </div>
              <div>
                <button onClick={() => router.push('/client-login')} className="text-sm bg-transparent border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg">
                  Se for cliente, clique aqui
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
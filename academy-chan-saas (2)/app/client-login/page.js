"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

export default function ClientLoginPage(){
  const [form, setForm] = useState({ companyNumber: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await login(form);
      sessionStorage.setItem('user', JSON.stringify(data));
      router.push('/client-dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao tentar fazer login. Verifique seus dados.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-dark mb-2 text-center">Portal do Cliente</h2>
        <p className="text-gray-500 mb-6 text-center">Acesse com os dados da sua empresa.</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Nº da Empresa ou CNPJ</label>
            <input value={form.companyNumber} onChange={e => setForm({...form, companyNumber: e.target.value})} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Digite o número ou CNPJ" required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Usuário</label>
            <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Seu usuário ou e-mail" required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Senha</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Sua senha de acesso" required />
          </div>

          <div className="pt-2">
            <button disabled={loading} className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70">
              {loading ? 'Acessando...' : 'Entrar'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => router.push('/')} className="text-sm text-gray-500 hover:text-dark transition-colors">
            Acessar como Agente ou Admin
          </button>
        </div>
      </div>
    </div>
  );
}

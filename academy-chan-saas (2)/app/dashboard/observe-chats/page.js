'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCompanies, getCompanyChats } from '@/lib/api';

export default function ObserveChats(){
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [chats, setChats] = useState([]);
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem('user'));
    if (!u || !(['admin','agent','company_admin','company_manager'].includes(u.role))) return router.push('/');
    setUser(u);
    (async () => {
      const { data } = await getCompanies();
      setCompanies(data || []);
    })();
  }, []);

  const loadChats = async (company) => {
    setSelectedCompany(company);
    try {
      const { data } = await getCompanyChats(company.id, user);
      setChats(data || []);
    } catch (e) {
      setChats([]);
    }
  };

  const filtered = chats.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || (c.description || '').toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Observar Chats</h1>
          <div className="flex gap-2">
            <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-600">Voltar</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">Empresas</h3>
            <ul className="space-y-2 max-h-96 overflow-auto">
              {companies.map(c => (
                <li key={c.id} className={`p-2 rounded cursor-pointer hover:bg-gray-50 ${selectedCompany?.id === c.id ? 'bg-gray-100' : ''}`} onClick={() => loadChats(c)}>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">#{c.id} · {c.cnpj}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{selectedCompany ? `Chats — ${selectedCompany.name}` : 'Selecione uma empresa'}</h3>
                <p className="text-xs text-gray-500">Visualizador de conversas e metadados.</p>
              </div>
              <div className="flex items-center gap-2">
                <input placeholder="Buscar chats" value={query} onChange={e => setQuery(e.target.value)} className="border p-2 rounded" />
                {selectedCompany && <Link href={`/company/${selectedCompany.id}/chat`} className="bg-brand text-white px-3 py-2 rounded">Ir ao chat</Link>}
              </div>
            </div>

            <div className="space-y-3">
              {filtered.map(ch => (
                <div key={ch.id} className="p-3 border rounded flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: ch.color }} />
                      <div className="font-medium">{ch.name}</div>
                      {ch.pinned && <span className="ml-2 text-xxs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">PIN</span>}
                    </div>
                    <div className="text-xs text-gray-500">{ch.department} · {ch.members.length} membros</div>
                    {ch.description && <div className="text-xs text-gray-600 mt-1">{ch.description}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Última: {ch.messages?.length ? ch.messages[ch.messages.length-1].timestamp : '—'}</div>
                    {ch.messages?.length ? <div className="text-xs text-gray-600 mt-1 truncate max-w-xs">{ch.messages[ch.messages.length-1].content}</div> : null}
                    <div className="mt-2">
                      <Link href={`/company/${selectedCompany?.id}/chat`} className="text-sm text-brand">Abrir conversa</Link>
                    </div>
                  </div>
                </div>
              ))}
              {selectedCompany && filtered.length === 0 && <div className="text-center text-gray-400 p-6">Nenhum chat encontrado.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

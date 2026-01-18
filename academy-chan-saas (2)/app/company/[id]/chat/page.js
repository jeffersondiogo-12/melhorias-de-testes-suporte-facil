"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCompanyUsers, getCompanyChats, createChat, getChatMessages, sendChatMessage, updateChatMembers, getUserDetails, updateChat } from '@/lib/api';
import ClientSidebar from '../../../../components/ClientSidebar';
import { parseMentions, renderContentWithMentions } from '@/lib/chat-utils';

export default function CompanyChatPage(){
  const router = useRouter();
  const { id: companyId } = useParams();
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [mentionAlerts, setMentionAlerts] = useState({});
  const [seenMentionMessageIds, setSeenMentionMessageIds] = useState(new Set());
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [newChat, setNewChat] = useState({ name: '', department: 'Suporte', members: [] });
  const [editingChat, setEditingChat] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem('user'));
    if (!u || !['company_user', 'company_admin', 'company_manager'].includes(u.role)) return router.push('/');
    setUser({ ...u, avatar: u.avatar || `https://i.pravatar.cc/150?u=${u.id}` });
  }, []);

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const [{ data: u }, { data: c }] = await Promise.all([getCompanyUsers(companyId), getCompanyChats(companyId, JSON.parse(sessionStorage.getItem('user')))]);
        setUsers(u || []);
        setChats(c || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [companyId]);

  // Poll chats for mentions and update chat list every 5s
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      if (!companyId || !user) return;
      try {
        const { data: freshChats } = await getCompanyChats(companyId, user);
        if (!mounted) return;
        setChats(freshChats || []);

        // scan for mentions to current user
        const newSeen = new Set(seenMentionMessageIds);
        const alerts = { ...mentionAlerts };
        (freshChats || []).forEach(chat => {
          (chat.messages || []).forEach(m => {
            if (m.mentions && m.mentions.includes(user.id) && !newSeen.has(m.id)) {
              alerts[chat.id] = (alerts[chat.id] || 0) + 1;
              newSeen.add(m.id);
            }
          });
        });
        setSeenMentionMessageIds(newSeen);
        setMentionAlerts(alerts);
      } catch (e) {
        // ignore polling errors
      }
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => { mounted = false; clearInterval(iv); };
  }, [companyId, user]);

  const loadChatMessages = async (chat) => {
    try {
      const { data } = await getChatMessages(chat.id, JSON.parse(sessionStorage.getItem('user')));
      // ensure sender avatars are available
      const msgs = data || [];
      const enhanced = await ensureSenderAvatars(msgs);
      setSelectedChat(chat);
      setMessages(enhanced || []);
      // clear mention alerts for this chat (user is viewing it)
      setMentionAlerts(prev => { const copy = { ...prev }; delete copy[chat.id]; return copy; });
    } catch (e) {
      alert(e?.response?.data?.message || 'Não foi possível carregar mensagens');
    }
  };

  const ensureSenderAvatars = async (msgs) => {
    const map = {};
    // build from current company users
    users.forEach(u => { map[u.id] = u; });

    const results = [];
    for (const m of msgs) {
      if (!map[m.senderId]) {
        try {
          const { data } = await getUserDetails(m.senderId);
          map[m.senderId] = data;
        } catch (e) {
          // ignore
        }
      }
      results.push({ ...m, senderAvatar: map[m.senderId]?.avatar || null });
    }
    return results;
  };

  const handleCreate = async () => {
    if (!newChat.name) return alert('Digite um nome para o chat');
    try {
      const { data } = await createChat(companyId, newChat);
      setChats(prev => [...prev, data]);
      setNewChat({ name: '', department: 'Suporte', members: [] });
    } catch (e) {
      alert('Erro ao criar chat');
    }
  };

  const toggleMember = (userId) => {
    setNewChat(n => {
      const members = n.members.includes(userId) ? n.members.filter(id => id !== userId) : [...n.members, userId];
      return { ...n, members };
    });
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedChat || !user) return;
    try {
      // parse mentions from text
      const mentions = parseMentions(text, users);
      const { data } = await sendChatMessage(selectedChat.id, user.id, user.name, text.trim(), mentions.map(m => m.id));
      // attach avatar to message for UI
      const msgWithAvatar = { ...data, senderAvatar: users.find(u => u.id === data.senderId)?.avatar || user.avatar || null };
      setMessages(prev => [...prev, msgWithAvatar]);
      setText('');
    } catch (e) {
      alert('Erro ao enviar mensagem');
    }
  };

  const handleSendImage = async () => {
    if (!imageUrl.trim() || !selectedChat || !user) return;
    try {
      // send an image attachment message (content optional)
      const { data } = await sendChatMessage(selectedChat.id, user.id, user.name, '[imagem]', [], [{ type: 'image', url: imageUrl.trim() }]);
      const msgWithAvatar = { ...data, senderAvatar: users.find(u => u.id === data.senderId)?.avatar || user.avatar || null };
      setMessages(prev => [...prev, msgWithAvatar]);
      setImageUrl('');
    } catch (e) {
      alert('Erro ao enviar imagem');
    }
  };

  const handleUpdateChat = async () => {
    if (!editingChat) return;
    try {
      const { data } = await updateChat(editingChat.id, editingChat);
      setChats(prev => prev.map(c => c.id === data.id ? data : c));
      if (selectedChat?.id === data.id) setSelectedChat(data);
      setEditingChat(null);
    } catch (e) {
      alert('Erro ao atualizar chat');
    }
  };


  // parsing and rendering moved to `lib/chat-utils.js`

  const saveMembers = async (chatId, members) => {
    try {
      const { data } = await updateChatMembers(chatId, members);
      setChats(prev => prev.map(c => c.id === data.id ? data : c));
      if (selectedChat?.id === data.id) setSelectedChat(data);
    } catch (e) {
      alert('Erro ao atualizar membros');
    }
  };

  const canManageChat = (chat) => {
    // Global admin or company admin can manage chats
    return user?.role === 'admin' || (user?.role === 'company_admin' && user?.companyId == chat.companyId);
  }

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface flex">
      <ClientSidebar user={user} handleLogout={handleLogout} activePath="chats" />
      <main className="flex-1 ml-20 lg:ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-dark">Chats da Empresa</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-card h-full overflow-auto">
            <h2 className="font-semibold mb-3">Criar novo chat</h2>
                  <input className="w-full p-2 border rounded mb-2" placeholder="Nome do chat" value={newChat.name} onChange={e => setNewChat({...newChat, name: e.target.value})} />
                  <select className="w-full p-2 border rounded mb-2" value={newChat.department} onChange={e => setNewChat({...newChat, department: e.target.value})}>
                    <option>Suporte</option>
                    <option>Vendas</option>
                    <option>Financeiro</option>
                    <option>Geral</option>
                  </select>
                  <input className="w-full p-2 border rounded mb-2" placeholder="Descrição (opcional)" value={newChat.description || ''} onChange={e => setNewChat({...newChat, description: e.target.value})} />
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm">Cor</label>
                    <input type="color" value={newChat.color || '#5865F2'} onChange={e => setNewChat({...newChat, color: e.target.value})} className="w-12 h-8 p-0 border-0" />
                    <label className="ml-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={!!newChat.pinned} onChange={e => setNewChat({...newChat, pinned: e.target.checked})} /> Fixar chat</label>
                  </div>

            <div className="mb-2">
              <div className="text-sm text-gray-600 mb-2">Membros (marque usuários que participarão)</div>
              <div className="max-h-36 overflow-auto border p-2 rounded">
                {users.length === 0 && <div className="text-xs text-gray-400">Nenhum usuário encontrado</div>}
                {users.map(u => (
                  <label key={u.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={newChat.members.includes(u.id)} onChange={() => toggleMember(u.id)} />
                    <span>{u.name} ({u.email})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleCreate} className="bg-brand text-white px-3 py-2 rounded">Criar Chat</button>
            </div>

            <hr className="my-4" />
            <h3 className="font-semibold mb-2">Chats</h3>
            <ul className="space-y-2">
              {chats.map(c => (
                <li key={c.id} className={`p-3 rounded cursor-pointer ${selectedChat?.id === c.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`} onClick={() => loadChatMessages(c)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                        <div className="font-medium">{c.name}</div>
                        {c.pinned && <span className="ml-2 text-xxs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">PIN</span>}
                      </div>
                      <div className="text-xs text-gray-500">{c.department} · {c.members.length} membros</div>
                    {canManageChat(c) && (
                      <button onClick={(e) => { e.stopPropagation(); setEditingChat({...c}); }} className="text-xs text-blue-500 hover:underline mt-1">Editar</button>
                    )}
                      {c.description && <div className="text-xs text-gray-600 mt-1">{c.description}</div>}
                    </div>
                    <div className="ml-2 flex items-center gap-2">
                      {mentionAlerts[c.id] ? <div className="bg-red-500 text-white text-xxs px-2 py-0.5 rounded-full">{mentionAlerts[c.id]}</div> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 bg-white p-4 rounded-xl shadow-card h-full flex flex-col">
            {!selectedChat ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">Selecione um chat para abrir a conversa</div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b pb-3 mb-3">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedChat.name}</h2>
                    <div className="text-xs text-gray-500">Departamento: {selectedChat.department}</div>
                  </div>
                  <div className="text-xs text-gray-500">Membros: {selectedChat.members.length}</div>
                </div>

                <div className="flex-1 overflow-auto p-2 space-y-3 chat-bg" id="chatWindow">
                  {messages.map(m => {
                    const isMe = m.senderId === user?.id;
                    const avatar = m.senderAvatar || users.find(u => u.id === m.senderId)?.avatar;
                    const contentParts = renderContentWithMentions(m.content, m.mentions || [], users).map(part => {
                      if (typeof part === 'string') return part;
                      if (part && part.type === 'mention') return (<span key={part.id} className="text-blue-600 font-medium">{part.text}</span>);
                      return String(part);
                    });
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && <img src={avatar || '/images/default-avatar.svg'} alt="avatar" className="w-8 h-8 rounded-full mr-2" />}
                        <div className={`p-3 rounded max-w-[70%] ${isMe ? 'bg-brand text-white' : 'bg-gray-100 text-gray-800'}`}>
                          <div className="text-xs font-semibold">{m.senderName}</div>
                          <div className="mt-1">{contentParts}</div>
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {m.attachments.map((a, idx) => a.type === 'image' ? (
                                <img key={idx} src={a.url} alt={`attachment-${idx}`} className="max-w-full rounded" />
                              ) : null)}
                            </div>
                          )}
                          <div className="text-right text-xxs text-gray-400 mt-1">{m.timestamp}</div>
                        </div>
                        {isMe && <img src={avatar || '/images/default-avatar.svg'} alt="avatar" className="w-8 h-8 rounded-full ml-2" />}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 pt-3 border-t flex gap-2 flex-col sm:flex-row">
                  <div className="flex gap-2 w-full">
                    <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSend(); }} className="flex-1 border p-2 rounded" placeholder="Digite uma mensagem e pressione Enter" />
                    <button onClick={handleSend} className="bg-brand text-white px-4 py-2 rounded">Enviar</button>
                  </div>
                  <div className="flex gap-2 w-full mt-2 sm:mt-0">
                    <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="flex-1 border p-2 rounded" placeholder="Colar URL da imagem (https://...)" />
                    <button onClick={handleSendImage} className="bg-gray-800 text-white px-4 py-2 rounded">Enviar Imagem</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal Editar Chat */}
      {editingChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-dark">Editar Chat</h3>
            <input className="w-full border p-3 mb-3 rounded-lg" placeholder="Nome do chat" value={editingChat.name} onChange={e => setEditingChat({...editingChat, name: e.target.value})} />
            <select className="w-full p-3 border rounded mb-3" value={editingChat.department} onChange={e => setEditingChat({...editingChat, department: e.target.value})}>
              <option>Suporte</option>
              <option>Vendas</option>
              <option>Financeiro</option>
              <option>Geral</option>
            </select>
            <input className="w-full p-3 border rounded mb-3" placeholder="Descrição (opcional)" value={editingChat.description || ''} onChange={e => setEditingChat({...editingChat, description: e.target.value})} />
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm">Cor</label>
              <input type="color" value={editingChat.color || '#5865F2'} onChange={e => setEditingChat({...editingChat, color: e.target.value})} className="w-12 h-8 p-0 border-0 rounded" />
              <label className="ml-auto flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editingChat.pinned} onChange={e => setEditingChat({...editingChat, pinned: e.target.checked})} /> Fixar chat
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={handleUpdateChat} className="flex-1 bg-brand text-white p-3 rounded-lg font-bold hover:bg-brand-dark transition">Salvar Alterações</button>
              <button onClick={() => setEditingChat(null)} className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTicketDetails, sendMessage, resolveTicket } from '@/lib/api';
import { MessageSquare, Send, ArrowLeft, CheckCircle } from 'lucide-react';

const Message = ({ message, userRole }) => {
    const isAgent = message.type === 'agent' || message.type === 'system';
    const alignClass = isAgent ? 'justify-start' : 'justify-end';
    const bgClass = isAgent ? 'bg-gray-200 text-gray-800' : 'bg-brand text-white';
    const senderName = message.type === 'system' ? 'Sistema' : message.sender || (isAgent ? 'Agente' : 'Você');
    
    // Estilo especial para mensagens do sistema (Ex: Chamado resolvido)
    if (message.type === 'system') {
        return (
            <div className="text-center my-4">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                    {message.content}
                </span>
            </div>
        );
    }
    
    return (
        <div className={`flex ${alignClass} mb-4`}>
            <div className={`max-w-xs lg:max-w-md p-4 rounded-xl shadow-md ${bgClass} ${isAgent ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                <p className="font-bold text-xs mb-1 opacity-80">{senderName}</p>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 text-right opacity-70">{message.timestamp}</p>
            </div>
        </div>
    );
};

export default function TicketDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const isResolved = ticket?.status === 'Resolvido';
    const isAgent = user?.role === 'agent' || user?.role === 'admin';
    const canRespond = (isAgent || (user?.permissions?.MOD_TICKETS === 'TOTAL')) && !isResolved;
    const canResolve = isAgent && !isResolved;

    useEffect(() => {
        const u = JSON.parse(sessionStorage.getItem('user'));
        if (!u) return router.push('/');
        setUser(u);
        loadTicket();
    }, [id]);

    const loadTicket = async () => {
        try {
            const { data } = await getTicketDetails(id);
            setTicket(data);
        } catch (e) {
            alert('Chamado não encontrado.');
            // Redireciona de volta para o painel apropriado se falhar
            router.push(user.role === 'company_user' ? '/client-dashboard' : '/dashboard/tickets');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setLoading(true);
        try {
            const messageType = isAgent ? 'agent' : 'client';
            await sendMessage(id, messageType, newMessage, user.name);
            setNewMessage('');
            await loadTicket(); // Recarrega para ver a nova mensagem
        } catch (e) {
            alert('Erro ao enviar mensagem.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleResolve = async () => {
        if (!confirm('Tem certeza que deseja CONCLUIR e RESOLVER este chamado? Isso irá gerar um Resumo Automático para o Relatório.')) return;
        
        setLoading(true);
        try {
            await resolveTicket(id, user.name);
            await loadTicket();
            alert('Chamado resolvido com sucesso! O resumo foi gerado.');
        } catch (e) {
            alert('Erro ao resolver chamado: ' + e.message);
        } finally {
            setLoading(false);
        }
    }


    if (!ticket || !user) return <div className="p-10 text-center">Carregando detalhes do chamado...</div>;

    const statusClass = ticket.status === 'Resolvido' ? 'badge-resolvido' : 
                        ticket.status === 'Em andamento' ? 'badge-andamento' : 
                        'badge-pendente';

    return (
        <div className="min-h-screen bg-surface p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-floating overflow-hidden flex flex-col h-[90vh]">
                
                {/* Header do Chat */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-2 hover:text-dark transition-colors text-sm">
                            <ArrowLeft size={16} /> Voltar
                        </button>
                        <h1 className="text-xl font-bold text-dark flex items-center gap-2">
                            <MessageSquare size={24} className='text-brand'/> {ticket.number}: {ticket.subject}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Cliente: {ticket.clientName} | Status: <span className={statusClass}>{ticket.status}</span></p>
                    </div>
                    
                    {/* Botão de Conclusão */}
                    {canResolve && (
                        <button onClick={handleResolve} disabled={loading} className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-emerald-600 transition-colors shadow-md disabled:opacity-50">
                            <CheckCircle size={18} /> Concluir Chamado
                        </button>
                    )}
                </div>

                {/* Área de Mensagens */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    <p className="text-center text-sm text-gray-500 border-b pb-4">Iniciado em {ticket.description}.</p>
                    {ticket.messages.map(msg => (
                        <Message key={msg.id} message={msg} userRole={user.role} />
                    ))}
                    {isResolved && ticket.summary && (
                        <div className="text-center my-4 p-4 bg-brand-light border-l-4 border-brand rounded-lg text-sm font-medium text-brand-dark">
                            <p className='font-bold mb-1'>RESUMO FINAL (Para Relatório):</p>
                            <p className='italic'>{ticket.summary}</p>
                        </div>
                    )}
                </div>

                {/* Formulário de Resposta */}
                <form onSubmit={handleSend} className="p-4 border-t bg-white">
                    {isResolved ? (
                        <div className="text-center p-3 bg-red-50 border border-red-300 rounded-lg text-red-600 font-medium">
                            🚫 Este chamado foi RESOLVIDO. Não é possível enviar mais mensagens.
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <input 
                                className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-brand outline-none transition" 
                                placeholder="Digite sua mensagem..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                disabled={!canRespond || loading}
                            />
                            <button type="submit" disabled={!canRespond || loading || !newMessage.trim()} className="bg-brand text-white p-3 rounded-lg flex items-center gap-2 font-bold hover:bg-brand-dark transition disabled:bg-gray-400">
                                <Send size={20} /> Enviar
                            </button>
                        </div>
                    )}
                    
                </form>
            </div>
        </div>
    );
}
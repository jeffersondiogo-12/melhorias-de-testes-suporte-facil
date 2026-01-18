'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getReportData, getTickets } from '@/lib/api'; // Adicionado getTickets
import StaffSidebar from '@/components/StaffSidebar'; 
import { BarChart, MessageSquare, CheckCircle, Clock, XCircle, Building2 } from 'lucide-react';
import Link from 'next/link'; // Adicionado Link

export default function ReportsDashboard() {
    const [report, setReport] = useState(null);
    const [resolvedTicketsList, setResolvedTicketsList] = useState([]); // NOVO: Lista de tickets resolvidos
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => { 
        const u = JSON.parse(sessionStorage.getItem('user'));
        if (!u || !['agent', 'admin'].includes(u.role)) return router.push('/');
        setUser(u);
        loadReport(u); 
    }, []);

    const loadReport = async (u) => {
        try {
            // 1. Carregar dados das métricas
            const { data: reportData } = await getReportData();
            setReport(reportData);

            // 2. Carregar tickets para o detalhamento
            const { data: ticketsData } = await getTickets(u);
            const resolvedList = ticketsData.filter(t => t.status === 'Resolvido');
            setResolvedTicketsList(resolvedList);

        } catch (error) {
            console.error("Erro ao carregar relatórios:", error);
        }
    };
    
    const handleLogout = () => {sessionStorage.clear(); router.push('/')};
    
    if (!user) return null;

    // Cartão de métrica
    const MetricCard = ({ title, value, icon, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-card border-t-4" style={{ borderColor: color }}>
            <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold`} style={{ color: color }}>{value}</span>
                {icon}
            </div>
            <p className="text-sm text-gray-500 mt-2">{title}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-surface flex">
            {/* Sidebar */}
            <StaffSidebar user={user} handleLogout={handleLogout} activePath="reports" />
            
            {/* Conteúdo */}
            <main className="flex-1 ml-20 lg:ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-dark flex items-center gap-2">
                        <BarChart size={30} className='text-brand'/> Dashboard de Relatórios
                    </h2>
                </header>
                
                {report ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <MetricCard title="Total de Chamados" value={report.totalTickets} icon={<MessageSquare size={30} className='text-dark opacity-50'/>} color="#374151" />
                            <MetricCard title="Chamados Resolvidos" value={report.resolvedTickets} icon={<CheckCircle size={30} className='text-emerald-500'/>} color="#10B981" />
                            <MetricCard title="Em Andamento" value={report.inProgressTickets} icon={<Clock size={30} className='text-blue-500'/>} color="#3B82F6" />
                            <MetricCard title="Pendentes" value={report.pendingTickets} icon={<XCircle size={30} className='text-red-500'/>} color="#EF4444" />
                        </div>

                        {/* Quebra por Empresa (Seção Existente) */}
                        <div className="bg-white p-6 rounded-xl shadow-card mb-8">
                            <h3 className="text-xl font-bold text-dark mb-4 border-b pb-2 flex items-center gap-2">
                                <Building2 size={20} className='text-gray-500'/> Quebra por Empresa
                            </h3>
                            <table className="w-full text-left">
                                <thead className="text-gray-600 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="p-3">Empresa</th>
                                        <th className="p-3 text-center">Total de Tickets</th>
                                        <th className="p-3 text-center">Resolvidos</th>
                                        <th className="p-3 text-center">Taxa de Resolução</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.ticketsByCompany.map((comp, index) => (
                                        <tr key={index} className="border-t hover:bg-gray-50">
                                            <td className="p-3 font-medium text-dark">{comp.companyName}</td>
                                            <td className="p-3 text-center">{comp.total}</td>
                                            <td className="p-3 text-center text-emerald-600 font-bold">{comp.resolved}</td>
                                            <td className="p-3 text-center">
                                                {comp.total > 0 ? `${((comp.resolved / comp.total) * 100).toFixed(0)}%` : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* NOVO: Detalhamento de Chamados Resolvidos com Resumo (Atende ao seu pedido) */}
                        <div className="bg-white p-6 rounded-xl shadow-card">
                            <h3 className="text-xl font-bold text-dark mb-4 border-b pb-2 flex items-center gap-2">
                                <CheckCircle size={20} className='text-emerald-500'/> Detalhamento de Chamados Resolvidos (Resumo)
                            </h3>
                            {resolvedTicketsList.length > 0 ? (
                                <div className="space-y-4">
                                    {resolvedTicketsList.map(t => (
                                        <div key={t.id} className="border border-emerald-200 p-4 rounded-lg bg-emerald-50">
                                            <div className="flex justify-between items-center mb-1">
                                                <Link href={`/ticket/${t.id}`} className="font-bold text-dark hover:text-brand transition-colors">
                                                    {t.number}: {t.subject}
                                                </Link>
                                                <span className='text-xs text-gray-500'>Cliente: {t.clientName}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-2 border-t pt-2">
                                                <span className="font-semibold text-emerald-700">Resumo da Conclusão:</span> 
                                                <span className='italic ml-1'>{t.summary || 'N/A - O resumo será gerado automaticamente ao concluir o chamado.'}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Nenhum chamado resolvido para detalhamento. Conclua alguns chamados para popular esta seção.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center p-10 text-gray-500 bg-white rounded-xl shadow-card">Carregando dados de relatórios...</div>
                )}
            </main>
        </div>
    );
}
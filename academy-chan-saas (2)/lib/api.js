import axios from 'axios';

// --- DADOS INICIAIS ---
export const SYSTEM_MODULES = [
    { id: 'MOD_TICKETS', name: 'Gestão de Tickets', components: ['Abrir Chamado', 'Ver Histórico', 'Responder'] },
    { id: 'MOD_FINANCE', name: 'Financeiro', components: ['Ver Faturas', 'Baixar Boletos'] },
    { id: 'MOD_REPORTS', name: 'Relatórios', components: ['Exportar Dados', 'Ver Gráficos'] }
];

// 2. Empresas 
export let MOCK_COMPANIES = [ 
    { id: 10, name: 'Tech Solutions Ltda', cnpj: '12.345.678/0001-99', active: true },
    { id: 20, name: 'Logística Rápida SA', cnpj: '98.765.432/0001-11', active: true },
    { id: 30, name: 'Global Marketing Corp', cnpj: '00.111.222/0001-33', active: true }
];

// 3. Usuários
let MOCK_USERS = [
    { id: 1, name: 'Admin Supremo', email: 'admin', password: '000', role: 'admin', companyId: null, permissions: {}, avatar: 'https://i.pravatar.cc/150?u=admin' },
    { id: 2, name: 'Agente Silva', email: 'agente', password: '123', role: 'agent', companyId: null, permissions: {}, avatar: 'https://i.pravatar.cc/150?u=agente' },
    { 
        id: 3, name: 'João Tech (Cliente)', email: 'joao@tech.com', password: '456', role: 'company_user', companyId: 10,
        permissions: { 'MOD_TICKETS': 'TOTAL', 'MOD_FINANCE': 'LEITURA', 'MOD_REPORTS': 'NEGADO' }, avatar: 'https://i.pravatar.cc/150?u=joao'
    },
    { 
        id: 4, name: 'Maria Log (Cliente)', email: 'maria@log.com', password: '789', role: 'company_user', companyId: 20,
        permissions: { 'MOD_TICKETS': 'TOTAL', 'MOD_FINANCE': 'NEGADO', 'MOD_REPORTS': 'LEITURA' }, avatar: 'https://i.pravatar.cc/150?u=maria'
    }
    ,
    // Exemplos de usuários administrativos dentro da empresa (admin e gerente)
    {
        id: 5, name: 'Tech Solutions - Admin', email: 'admin@tech.com', password: 'admintech', role: 'company_admin', companyId: 10,
        permissions: { 'MOD_TICKETS': 'TOTAL', 'MOD_FINANCE': 'TOTAL', 'MOD_REPORTS': 'TOTAL' }, avatar: 'https://i.pravatar.cc/150?u=admin_tech'
    },
    {
        id: 6, name: 'Tech Solutions - Gerente', email: 'gerente@tech.com', password: 'gerente', role: 'company_manager', companyId: 10,
        permissions: { 'MOD_TICKETS': 'TOTAL', 'MOD_FINANCE': 'LEITURA', 'MOD_REPORTS': 'LEITURA' }, avatar: 'https://i.pravatar.cc/150?u=gerente_tech'
    }
];

// 4. Tickets (Adicionei mais tickets para o relatório ficar mais interessante)
export let MOCK_TICKETS = [ 
    { 
        id: 101, number: '#TK-101', subject: 'Erro Login', status: 'Em andamento', 
        clientId: 3, clientName: 'João Tech (Cliente)', companyId: 10, 
        description: 'Erro 500 no sistema',
        messages: [
            { id: 1, type: 'client', content: 'Não consigo acessar o sistema.', timestamp: '10:00' },
            { id: 2, type: 'agent', content: 'Verificamos sua conta, João. Tentou redefinir a senha?', timestamp: '10:15' }
        ]
    },
    { 
        id: 102, number: '#TK-102', subject: 'Boleto Vencido', status: 'Pendente', 
        clientId: 4, clientName: 'Maria Log (Cliente)', companyId: 20, 
        description: 'Preciso da 2a via do boleto',
        messages: [
            { id: 3, type: 'client', content: 'Podem enviar a 2ª via?', timestamp: '09:30' }
        ]
    },
    { 
        id: 103, number: '#TK-103', subject: 'Problema resolvido - Acesso', status: 'Resolvido', 
        clientId: 3, clientName: 'João Tech (Cliente)', companyId: 10, 
        description: 'Problema Antigo de acesso.',
        summary: 'Resumo Automático: O erro de acesso foi corrigido após a revalidação da credencial do cliente. Confirmação enviada.', // NOVO: Resumo
        messages: [
            { id: 4, type: 'client', content: 'Problema antigo.', timestamp: 'Ontem' },
            { id: 5, type: 'system', content: 'Chamado concluído pelo Agente Silva.', timestamp: 'Hoje' }
        ]
    },
    { 
        id: 104, number: '#TK-104', subject: 'Dúvida Contratual', status: 'Em andamento', 
        clientId: 3, clientName: 'João Tech (Cliente)', companyId: 10, 
        description: 'Pergunta sobre cláusula X.',
        messages: [
            { id: 6, type: 'client', content: 'Qual é o prazo de renovação?', timestamp: '14:00' }
        ]
    },
    { 
        id: 105, number: '#TK-105', subject: 'Outro resolvido - Boleto', status: 'Resolvido', 
        clientId: 4, clientName: 'Maria Log (Cliente)', companyId: 20, 
        description: 'Outro problema que foi resolvido.',
        summary: 'Resumo Automático: A segunda via do boleto foi enviada por e-mail, e o pagamento foi confirmado. Chamado encerrado.', // NOVO: Resumo
        messages: [
            { id: 7, type: 'client', content: 'Precisa de ajuda.', timestamp: '15:00' },
            { id: 8, type: 'system', content: 'Chamado concluído pelo Admin Supremo.', timestamp: 'Hoje' }
        ]
    }
];

// --- CHATS (por empresa) ---
export let MOCK_CHATS = [
    // Exemplo de chat pré-criado
    {
        id: 1001,
        companyId: 10,
        name: 'Suporte Geral',
        department: 'Suporte',
        members: [3,5,6], // ids de usuários
        messages: [
            { id: 1, senderId: 3, senderName: 'João Tech (Cliente)', content: 'Olá, alguém pode me ajudar?', mentions: [], timestamp: new Date().toLocaleTimeString('pt-BR') },
                    { id: 2, senderId: 5, senderName: 'Tech Solutions - Admin', content: 'Estamos verificando, João.', mentions: [3], timestamp: new Date().toLocaleTimeString('pt-BR'), attachments: [] }
        ]
    }
];

// --- AUDIT LOG ---
let MOCK_AUDIT_LOG = [
    { id: 1, timestamp: new Date(Date.now() - 3600000).toISOString(), userId: 1, userName: 'Admin Supremo', action: 'LOGIN', details: 'Login bem-sucedido.' },
    { id: 2, timestamp: new Date(Date.now() - 7200000).toISOString(), userId: 2, userName: 'Agente Silva', action: 'CREATE_COMPANY', details: 'Criou a empresa Tech Solutions Ltda (ID: 10).' },
];


// --- FUNÇÕES AUXILIARES ---
const delay = () => new Promise(r => setTimeout(r, 200));

// --- AUTENTICAÇÃO ---
export async function login(credentials, password) {
    await delay();

    let user;

    // Login de cliente: login({ companyNumber, username, password })
    if (typeof credentials === 'object' && credentials.companyNumber) {
        const { companyNumber, username, password: userPassword } = credentials;
        const company = MOCK_COMPANIES.find(c => c.id == companyNumber || c.cnpj === companyNumber);
        if (!company) throw { response: { data: { message: 'Empresa não encontrada.' } } };
        
        user = MOCK_USERS.find(u => u.companyId === company.id && (u.email === username || u.name === username) && u.password === userPassword);
    // Login de admin/agente: login(email, password)
    } else if (typeof credentials === 'string') {
        user = MOCK_USERS.find(u => u.email === credentials && u.password === password && !u.companyId);
    }

    if (!user) throw { response: { data: { message: 'Credenciais inválidas.' } } };

    const { password: _, ...userData } = user;
    if (user.companyId) userData.companyName = MOCK_COMPANIES.find(c => c.id === user.companyId)?.name;

    logAuditEvent(user.id, user.name, 'LOGIN', `Login bem-sucedido.`);
    return { data: userData };
}

// --- GESTÃO DE EMPRESAS (Agente/Admin) ---
export async function getCompanies() {
    await delay();
    return { data: MOCK_COMPANIES };
}

export async function createCompany(data) {
    await delay();
    // Permite que o admin defina um número/ID para a empresa ao criar.
    const newId = data.id || Date.now();
    // Verifica duplicidade simples
    if (MOCK_COMPANIES.find(c => c.id == newId || c.cnpj === data.cnpj)) {
        throw { response: { data: { message: 'Empresa com este número ou CNPJ já existe.' } } };
    }
    const company = { id: newId, ...data, active: true };
    MOCK_COMPANIES.push(company);
    // logAuditEvent(callingUserId, callingUserName, 'CREATE_COMPANY', `Criou a empresa ${company.name} (ID: ${company.id}).`);
    return { data: company };
}

// --- GESTÃO DE USUÁRIOS & PERMISSÕES ---
export async function getCompanyUsers(companyId) {
    await delay();
    // Retorna todos os usuários relacionados à empresa (clientes, admins e gerentes)
    const users = MOCK_USERS.filter(u => u.companyId == companyId);
    return { data: users };
}

// --- CHATS API ---
export async function getCompanyChats(companyId, user) {
    await delay();
    // Se for admin/agent global, retorna todos os chats da empresa
    if (user && ['admin','agent'].includes(user.role)) {
        return { data: MOCK_CHATS.filter(c => c.companyId == companyId) };
    }
    // Para company_admin/company_manager retorna todos também
    if (user && ['company_admin','company_manager'].includes(user.role) && user.companyId == companyId) {
        return { data: MOCK_CHATS.filter(c => c.companyId == companyId) };
    }
    // Para company_user retorna apenas chats que participa
    const chats = MOCK_CHATS.filter(c => c.companyId == companyId && c.members.includes(user?.id));
    return { data: chats };
}

export async function createChat(companyId, chatData) {
    await delay();
    const newChat = { 
        id: Date.now(), 
        companyId: companyId, 
        name: chatData.name, 
        department: chatData.department || 'Geral', 
        members: chatData.members || [], 
        description: chatData.description || '',
        color: chatData.color || '#5865F2',
        pinned: !!chatData.pinned,
        coverImage: chatData.coverImage || null,
        messages: [] 
    };
    MOCK_CHATS.push(newChat);
    return { data: newChat };
}

export async function updateChat(chatId, chatData) {
    await delay();
    const index = MOCK_CHATS.findIndex(c => c.id == chatId);
    if (index === -1) throw new Error('Chat não encontrado');
    
    MOCK_CHATS[index] = { ...MOCK_CHATS[index], ...chatData };
    return { data: MOCK_CHATS[index] };
}

export async function getChatMessages(chatId, user) {
    await delay();
    const chat = MOCK_CHATS.find(c => c.id == chatId);
    if (!chat) throw { response: { data: { message: 'Chat não encontrado' } } };
    // Permite acesso se usuário for membro, company_admin/manager of company, or global admin/agent
    if (user && (user.companyId == chat.companyId) && (['company_admin','company_manager','admin','agent'].includes(user.role) || chat.members.includes(user.id))) {
        return { data: chat.messages };
    }
    throw { response: { data: { message: 'Acesso negado ao chat' } } };
}

export async function sendChatMessage(chatId, senderId, senderName, content, mentions = [], attachments = []) {
    await delay();
    const chat = MOCK_CHATS.find(c => c.id == chatId);
    if (!chat) throw new Error('Chat não encontrado');
    const msg = { id: Date.now(), senderId, senderName, content, mentions: mentions || [], attachments: attachments || [], timestamp: new Date().toLocaleTimeString('pt-BR') };
    chat.messages.push(msg);
    return { data: msg };
}

export async function updateChatMembers(chatId, members) {
    await delay();
    const chat = MOCK_CHATS.find(c => c.id == chatId);
    if (!chat) throw new Error('Chat não encontrado');
    chat.members = members;
    return { data: chat };
}

export async function getUserDetails(userId) {
    await delay();
    const user = MOCK_USERS.find(u => u.id == userId);
    const { password: _, ...userData } = user;
    return { data: userData };
}

export async function createUser(userData) {
    await delay();
    const newUser = { 
        id: Date.now(), 
        ...userData, 
        permissions: userData.permissions || {}
    };
    // Mantém companyId se fornecido (permitir criação de company_admin/company_manager vinculados)
    if (!newUser.companyId) {
        newUser.companyId = null;
    }
    // ensure avatar
    if (!newUser.avatar) newUser.avatar = `https://i.pravatar.cc/150?u=user${newUser.id}`;
    MOCK_USERS.push(newUser);
    // logAuditEvent(callingUserId, callingUserName, 'CREATE_USER', `Criou o usuário ${newUser.name} (ID: ${newUser.id}).`);
    const { password: _, ...returned } = newUser;
    return { data: returned };
}

export async function updateUser(userId, data) {
    await delay();
    const index = MOCK_USERS.findIndex(u => u.id == userId);
    if (index === -1) throw new Error('User not found');
    
    MOCK_USERS[index] = { ...MOCK_USERS[index], ...data };
    // logAuditEvent(callingUserId, callingUserName, 'UPDATE_USER', `Atualizou o usuário ${MOCK_USERS[index].name} (ID: ${userId}).`);
    const { password: _, ...updatedData } = MOCK_USERS[index]; 
    return { data: updatedData };
}

// --- TICKETS ---
export async function getTickets(user) {
    await delay();
    if (user.role === 'company_user') {
        if (user.permissions['MOD_TICKETS'] === 'NEGADO') return { data: [] };
        return { data: MOCK_TICKETS.filter(t => t.companyId === user.companyId) };
    }
    return { data: MOCK_TICKETS }; 
}

export async function createTicket(user, subject, description) {
    await delay();
    const newTicket = {
        id: Date.now(), 
        number: `#TK-${Math.floor(Math.random() * 1000) + 200}`, 
        subject: subject,
        status: 'Pendente',
        clientId: user.id, 
        clientName: user.name, 
        companyId: user.companyId, 
        description: description,
        messages: [
            { id: 1, type: 'client', content: description, sender: user.name, timestamp: new Date().toLocaleTimeString('pt-BR') }
        ]
    };
    MOCK_TICKETS.push(newTicket);
    return { data: newTicket };
}


export async function getTicketDetails(ticketId) {
    await delay();
    const ticket = MOCK_TICKETS.find(t => t.id == ticketId);
    if (!ticket) throw new Error('Ticket not found');
    return { data: ticket };
}

export async function sendMessage(ticketId, type, content, senderName) {
    await delay();
    const ticket = MOCK_TICKETS.find(t => t.id == ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const newMessage = { 
        id: Date.now(), 
        type: type, 
        content: content, 
        sender: senderName,
        timestamp: new Date().toLocaleTimeString('pt-BR')
    };
    ticket.messages.push(newMessage);
    if (type === 'agent' && ticket.status !== 'Resolvido' && ticket.status !== 'Em andamento') {
        ticket.status = 'Em andamento';
    }

    return { data: newMessage };
}

export async function resolveTicket(ticketId, agentName) {
    await delay();
    const ticket = MOCK_TICKETS.find(t => t.id == ticketId);
    if (!ticket) throw new Error('Ticket not found');
    
    if (ticket.status === 'Resolvido') {
        throw new Error('O chamado já está resolvido.');
    }
    
    // Lista de Resumos Mockados
    const mockSummaries = [
        'Resumo Automático: O problema foi resolvido com um patch de correção no backend. Cliente notificado sobre a estabilidade.',
        'Resumo Automático: A solicitação de 2ª via do boleto foi concluída, e o documento foi reenviado ao cliente. Sem pendências.',
        'Resumo Automático: O erro de acesso foi corrigido após a revalidação da credencial do cliente. Confirmação enviada.',
        'Resumo Automático: A dúvida contratual foi esclarecida. O cliente está ciente do prazo de renovação.',
    ];

    ticket.status = 'Resolvido';
    // Gera um resumo aleatório ao resolver
    ticket.summary = mockSummaries[Math.floor(Math.random() * mockSummaries.length)]; 
    
    const systemMessage = {
        id: Date.now(),
        type: 'system',
        content: `Chamado concluído pelo Agente ${agentName}.`,
        timestamp: new Date().toLocaleTimeString('pt-BR')
    };
    ticket.messages.push(systemMessage);
    
    return { data: ticket };
}

// --- RELATÓRIOS ---
export async function getReportData() {
    await delay();

    const totalTickets = MOCK_TICKETS.length;
    const resolvedTickets = MOCK_TICKETS.filter(t => t.status === 'Resolvido').length;
    const pendingTickets = MOCK_TICKETS.filter(t => t.status === 'Pendente').length;
    const inProgressTickets = MOCK_TICKETS.filter(t => t.status === 'Em andamento').length;

    const ticketsByCompany = MOCK_TICKETS.reduce((acc, ticket) => {
        const company = MOCK_COMPANIES.find(c => c.id === ticket.companyId);
        const companyName = company ? company.name : 'Desconhecida';
        
        if (!acc[companyName]) {
            acc[companyName] = { total: 0, resolved: 0 };
        }
        
        acc[companyName].total++;
        if (ticket.status === 'Resolvido') {
            acc[companyName].resolved++;
        }
        
        return acc;
    }, {});

    return {
        data: {
            totalTickets,
            resolvedTickets,
            pendingTickets,
            inProgressTickets,
            ticketsByCompany: Object.keys(ticketsByCompany).map(name => ({
                companyName: name,
                ...ticketsByCompany[name]
            }))
        }
    };
}

// --- AUDIT LOG API ---
export async function logAuditEvent(userId, userName, action, details) {
    await delay();
    const logEntry = {
        id: MOCK_AUDIT_LOG.length + 1,
        timestamp: new Date().toISOString(),
        userId,
        userName,
        action,
        details,
    };
    MOCK_AUDIT_LOG.unshift(logEntry); // Adiciona no início para ordem decrescente
    return { data: logEntry };
}

export async function getAuditLog() {
    await delay();
    return { data: MOCK_AUDIT_LOG };
}
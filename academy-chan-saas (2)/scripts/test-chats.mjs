import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const api = await import('../lib/api.js');

const delay = (ms=200) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('Iniciando testes de chat...');

  // Use company 10 (existing in MOCK_COMPANIES)
  const companyId = 10;

  // Create two users under company 10
  const u1 = (await api.createUser({ name: 'Teste User A', email: `testa.${Date.now()}@example.com`, password: 'pwd', role: 'company_user', companyId, permissions: { 'MOD_TICKETS': 'TOTAL' }, avatar: 'https://i.pravatar.cc/150?u=testa' })).data;
  const u2 = (await api.createUser({ name: 'Teste User B', email: `testb.${Date.now()}@example.com`, password: 'pwd', role: 'company_user', companyId, permissions: { 'MOD_TICKETS': 'TOTAL' }, avatar: 'https://i.pravatar.cc/150?u=testb' })).data;

  console.log('Usuários criados:', u1.id, u2.id);

  // Create company admin user (already exists in MOCK_USERS id 5), but ensure we can create another admin
  const admin = (await api.createUser({ name: 'Admin Temp', email: `admtemp.${Date.now()}@example.com`, password: 'pwd', role: 'company_admin', companyId, permissions: {} , avatar: 'https://i.pravatar.cc/150?u=admtemp' })).data;
  console.log('Admin criado:', admin.id);

  // Create a chat with u1 and admin as members
  const chat = (await api.createChat(companyId, { name: 'Chat Teste', department: 'Suporte', members: [u1.id, admin.id], description: 'Chat criado por teste', color: '#ff0000', pinned: true })).data;
  console.log('Chat criado:', chat.id);

  // Send a message from u1 mentioning u2 (u2 is NOT a member) — allowed by sendChatMessage (server doesn't restrict sender membership)
  const msg1 = (await api.sendChatMessage(chat.id, u1.id, u1.name, `Olá @${u2.email.split('@')[0]}, você pode ver isso?`, [u2.id])).data;
  console.log('Mensagem enviada 1:', msg1.id, 'mentions:', msg1.mentions);

  // Verify message was stored with mentions
  const msgs = (await api.getChatMessages(chat.id, u1)).data;
  assert(msgs.some(m => m.id === msg1.id), 'Mensagem não encontrada no chat');
  assert(Array.isArray(msg1.mentions) && msg1.mentions.includes(u2.id), 'Menção não armazenada corretamente');

  // Admin should be able to list company chats
  const adminChats = (await api.getCompanyChats(companyId, admin)).data;
  assert(adminChats.some(c => c.id === chat.id), 'Admin não vê o chat criado');

  // u2 (non-member) should NOT be able to fetch messages (permission check)
  let forbidden = false;
  try {
    await api.getChatMessages(chat.id, u2);
  } catch (e) {
    forbidden = true;
  }
  assert(forbidden, 'Usuário não-membro conseguiu acessar mensagens (esperado: negar)');

  // Now add u2 to chat members and then u2 should read messages
  await api.updateChatMembers(chat.id, [u1.id, admin.id, u2.id]);
  const msgsAfter = (await api.getChatMessages(chat.id, u2)).data;
  assert(Array.isArray(msgsAfter), 'Após incluir membro, não retornou mensagens');

  // Send another message as admin that mentions u2 and u1
  const msg2 = (await api.sendChatMessage(chat.id, admin.id, admin.name, `@${u2.email.split('@')[0]} bem-vindo, e @${u1.email.split('@')[0]} obrigado!`, [u2.id, u1.id])).data;
  console.log('Mensagem enviada 2:', msg2.id, 'mentions:', msg2.mentions);

  // Verify admin can view messages as company_admin
  const adminMsgs = (await api.getChatMessages(chat.id, admin)).data;
  assert(adminMsgs.some(m => m.id === msg2.id), 'Admin não vê a mensagem enviada');

  console.log('Todos os testes passaram com sucesso.');
}

run().catch(err => {
  console.error('Teste falhou:', err);
  process.exit(1);
});

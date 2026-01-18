import assert from 'assert';
import { parseMentions, renderContentWithMentions } from '../lib/chat-utils.js';

function makeUser(id, name, email) {
  return { id, name, email };
}

async function run() {
  console.log('Executando testes unitários de chat-utils...');

  const users = [makeUser(1, 'João Silva', 'joao.silva'), makeUser(2, 'Maria Lopez', 'maria'), makeUser(3, 'Ana')];

  // parseMentions
  const m1 = parseMentions('@joao Olá', users);
  assert(Array.isArray(m1) && m1.length === 1 && m1[0].id === 1, 'parseMentions não detectou @joao');

  const m2 = parseMentions('Sem menção aqui', users);
  assert(Array.isArray(m2) && m2.length === 0, 'parseMentions encontrou menção onde não devia');

  const m3 = parseMentions('@maria e @ana bem vindas', users);
  assert(m3.length === 2 && m3.some(u => u.id === 2) && m3.some(u => u.id === 3), 'parseMentions falhou em múltiplas menções');

  // renderContentWithMentions
  const parts = renderContentWithMentions('Oi @joao, tudo bem?', [1], users);
  // parts returns array with strings and mention objects
  assert(Array.isArray(parts), 'renderContentWithMentions não retornou array');
  const hasMention = parts.some(p => typeof p === 'object' && p.type === 'mention' && p.user && p.user.id === 1);
  assert(hasMention, 'renderContentWithMentions não retornou objeto de menção esperado');

  console.log('Todos os testes unitários passaram.');
}

run().catch(err => { console.error('Teste unitário falhou:', err); process.exit(1); });

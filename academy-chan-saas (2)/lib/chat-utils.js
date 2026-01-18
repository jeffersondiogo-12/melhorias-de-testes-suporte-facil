// Utilitários de chat: parsing de menções e renderização de conteúdo com menções
// Fornece duas funções nomeadas: `parseMentions(text, usersList)` e `renderContentWithMentions(text, mentionIds, usersList)`

export function parseMentions(text = '', usersList = []) {
  if (!text) return [];
  const tokens = Array.from((text || '').matchAll(/@([\wÀ-ÿ\.\-]+)/g)).map(m => m[1]);
  const found = [];
  const normalize = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  tokens.forEach(t => {
    const token = t.toLowerCase();
    const tokenNorm = normalize(token).replace(/\./g, '');
    // try match by email localpart (startsWith)
    const byEmail = usersList.find(u => {
      const local = (u.email || '').split('@')[0] || '';
      return normalize(local).replace(/\./g, '').startsWith(tokenNorm);
    });
    if (byEmail) return found.push({ id: byEmail.id, name: byEmail.name });

    // try match by name (contains)
    const byName = usersList.find(u => {
      const nameNorm = normalize(u.name || '');
      return nameNorm.includes(tokenNorm);
    });
    if (byName) return found.push({ id: byName.id, name: byName.name });
  });
  // remove duplicates preserving order
  return Array.from(new Map(found.map(f => [f.id, f])).values());
}

export function renderContentWithMentions(text = '', mentionIds = [], usersList = []) {
  if (!text) return text;
  const nodes = [];
  let lastIndex = 0;
  const re = /@([\wÀ-ÿ\.\-]+)/g;
  let m;
  const normalize = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  while ((m = re.exec(text)) !== null) {
    const idx = m.index;
    const token = m[1];
    if (idx > lastIndex) nodes.push(text.substring(lastIndex, idx));
    // resolve user by mentionIds first, then by heuristic
    let userObj = null;
    const tokenNorm = normalize(token).replace(/\./g, '');
    if (mentionIds && mentionIds.length > 0) {
      for (const id of mentionIds) {
        const u = usersList.find(us => us.id === id);
        if (!u) continue;
        const local = (u.email || '').split('@')[0] || '';
        const localNorm = normalize(local).replace(/\./g, '');
        const nameNorm = normalize(u.name || '').replace(/\s+/g, '').replace(/[^\w]/g, '');
        if (localNorm === tokenNorm || nameNorm === tokenNorm || nameNorm.includes(tokenNorm) || normalize(u.name || '').includes(tokenNorm)) {
          userObj = u; break;
        }
      }
    }
    if (!userObj) {
      userObj = usersList.find(u => {
        const local = (u.email||'').split('@')[0] || '';
        const localNorm = normalize(local).replace(/\./g, '');
        const nameNorm = normalize(u.name || '').replace(/\s+/g, '').replace(/[^\w]/g, '');
        return localNorm === tokenNorm || nameNorm.includes(tokenNorm) || normalize(u.name || '').includes(tokenNorm);
      });
    }
    if (userObj) {
      nodes.push({ type: 'mention', id: userObj.id, text: `@${userObj.name.split(' ')[0]}` });
    } else {
      nodes.push(m[0]);
    }
    lastIndex = idx + m[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.substring(lastIndex));
  return nodes;
}

export default { parseMentions, renderContentWithMentions };

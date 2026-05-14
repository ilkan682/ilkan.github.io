// ─── MENU ───────────────────────────────────────────
function toggleMenu() {
  document.getElementById('nav').classList.toggle('open');
}
document.addEventListener('click', (e) => {
  const nav = document.getElementById('nav');
  const btn = document.querySelector('.menu-toggle');
  if (!nav || !btn) return;
  if (!nav.contains(e.target) && !btn.contains(e.target)) nav.classList.remove('open');
});

// ─── ANIMATE BARS ───────────────────────────────────
function animateBars() {
  document.querySelectorAll('.bar > span[data-w]').forEach(el => {
    setTimeout(() => { el.style.width = el.dataset.w; }, 200);
  });
}

// ─── PROJECTS FROM JSON ─────────────────────────────
async function loadProjects() {
  const holder = document.getElementById('projects');
  if (!holder) return;
  try {
    const res = await fetch('data.json');
    const data = await res.json();
    holder.innerHTML = data.projects.map(p => `
      <article class="item">
        <div class="meta">${p.year} • ${p.type}</div>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </article>
    `).join('');
  } catch {
    holder.innerHTML = `<div class="item"><p>Impossible de charger les projets.</p></div>`;
  }
}

// ─── MESSAGERIE ──────────────────────────────────────
const STORAGE_KEY = 'ig_messages_v2';

function getConvs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultConvs(); }
  catch { return defaultConvs(); }
}
function saveConvs(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function defaultConvs() {
  return [
    {
      id: 'recruiter',
      name: 'Recruteur / RH',
      avatar: 'RH',
      messages: [
        { from: 'them', text: 'Bonjour Ilkan, votre profil nous intéresse !', time: '10:00' },
        { from: 'me', text: 'Bonjour, merci beaucoup ! Je suis disponible pour un entretien.', time: '10:05' }
      ]
    },
    {
      id: 'prof',
      name: 'Enseignant IUT',
      avatar: 'IUT',
      messages: [
        { from: 'them', text: 'Excellent travail sur la SAE 1.03 !', time: '14:30' }
      ]
    }
  ];
}

let activeConvId = null;
let convData = [];

function renderSidebar() {
  const list = document.getElementById('conv-list');
  if (!list) return;
  list.innerHTML = convData.map(c => {
    const last = c.messages[c.messages.length - 1];
    return `<div class="conv-item${c.id === activeConvId ? ' active' : ''}" onclick="openConv('${c.id}')">
      <div class="conv-avatar">${c.avatar}</div>
      <div class="conv-meta">
        <div class="conv-name">${c.name}</div>
        <div class="conv-preview">${last ? last.text : ''}</div>
      </div>
      <div class="conv-time">${last ? last.time : ''}</div>
    </div>`;
  }).join('');
}

function openConv(id) {
  activeConvId = id;
  renderSidebar();
  renderMessages();
  const head = document.getElementById('chat-head-name');
  const conv = convData.find(c => c.id === id);
  if (head && conv) head.textContent = conv.name;
}

function renderMessages() {
  const box = document.getElementById('chat-messages');
  if (!box) return;
  const conv = convData.find(c => c.id === activeConvId);
  if (!conv) { box.innerHTML = '<p style="color:var(--muted);text-align:center;margin-top:40px;">Sélectionnez une conversation</p>'; return; }
  box.innerHTML = conv.messages.map(m => `
    <div class="msg ${m.from}">
      <div class="msg-bubble">${m.text}</div>
      <div class="msg-time">${m.time}</div>
    </div>
  `).join('');
  box.scrollTop = box.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  if (!input || !activeConvId) return;
  const text = input.value.trim();
  if (!text) return;
  const conv = convData.find(c => c.id === activeConvId);
  if (!conv) return;
  const now = new Date();
  conv.messages.push({ from: 'me', text, time: `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}` });
  input.value = '';
  saveConvs(convData);
  renderSidebar();
  renderMessages();
}

function openNewConvModal() {
  document.getElementById('new-conv-modal').classList.add('open');
}
function closeNewConvModal() {
  document.getElementById('new-conv-modal').classList.remove('open');
}
function createConv() {
  const name = document.getElementById('new-name').value.trim();
  const msg = document.getElementById('new-msg').value.trim();
  if (!name) return;
  const id = 'conv_' + Date.now();
  convData.push({
    id, name,
    avatar: name.slice(0,2).toUpperCase(),
    messages: msg ? [{ from: 'me', text: msg, time: new Date().toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) }] : []
  });
  saveConvs(convData);
  closeNewConvModal();
  openConv(id);
  document.getElementById('new-name').value = '';
  document.getElementById('new-msg').value = '';
}

function initChat() {
  convData = getConvs();
  if (!document.getElementById('conv-list')) return;
  renderSidebar();
  if (convData.length) openConv(convData[0].id);
  const input = document.getElementById('chat-input');
  if (input) {
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
  }
}

// ─── INIT ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  animateBars();
  initChat();
});

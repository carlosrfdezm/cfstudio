const supabase = supabase.createClient(
  'https://tu-proyecto.supabase.co',
  'tu-clave-publica'
);

const bubble = document.getElementById('chat-bubble');
const windowChat = document.getElementById('chat-window');
const messagesDiv = document.getElementById('chat-messages');
const input = document.getElementById('chat-input');
const adminArea = document.getElementById('admin-chat-area');

const sessions = {};
let visitorIP = null;

// Detectar modo admin por URL
const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

if (isAdmin) {
  bubble.classList.add('hidden');
  windowChat.classList.add('hidden');
  adminArea.classList.remove('hidden');
  loadAdminView();
} else {
  bubble.classList.remove('hidden');
  fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
      visitorIP = data.ip;
      subscribeToMessages(visitorIP);
      fetchMessages(visitorIP);
    });
}

// Modo visitante
bubble.addEventListener('click', () => {
  windowChat.classList.toggle('hidden');
});

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const content = input.value.trim();
    if (!content) return;
    supabase.from('messages').insert([{ ip: visitorIP, sender: 'visitor', content }]);
    input.value = '';
  }
});

function renderMessage(msg, container) {
  const div = document.createElement('div');
  div.className = msg.sender === 'admin' ? 'admin-msg' : 'visitor-msg';
  div.textContent = msg.content;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function fetchMessages(ip) {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('ip', ip)
    .order('created_at', { ascending: true });

  data.forEach(msg => renderMessage(msg, messagesDiv));
}

function subscribeToMessages(ip) {
  supabase
    .channel('chat')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    }, payload => {
      const msg = payload.new;
      if (msg.ip === ip) renderMessage(msg, messagesDiv);
    })
    .subscribe();
}

// Modo administrador
async function loadAdminView() {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  adminArea.innerHTML = '';
  data.forEach(msg => {
    if (!sessions[msg.ip]) {
      sessions[msg.ip] = [];
      createAdminWindow(msg.ip);
    }
    sessions[msg.ip].push(msg);
    renderMessage(msg, document.getElementById(`admin-msgs-${msg.ip}`));
  });

  supabase
    .channel('admin-chat')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    }, payload => {
      const msg = payload.new;
      if (!sessions[msg.ip]) {
        sessions[msg.ip] = [];
        createAdminWindow(msg.ip);
      }
      sessions[msg.ip].push(msg);
      renderMessage(msg, document.getElementById(`admin-msgs-${msg.ip}`));
    })
    .subscribe();
}

function createAdminWindow(ip) {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-window';
  wrapper.innerHTML = `
    <div class="chat-header">IP: ${ip}</div>
    <div class="messages" id="admin-msgs-${ip}"></div>
    <input type="text" placeholder="Responder..." id="admin-input-${ip}" />
  `;
  adminArea.appendChild(wrapper);

  const input = wrapper.querySelector(`#admin-input-${ip}`);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const content = e.target.value.trim();
      if (!content) return;
      supabase.from('messages').insert([{ ip, sender: 'admin', content }]);
      e.target.value = '';
    }
  });
}

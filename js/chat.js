console.log('Supabase:', supabase);
console.log('Tiene createClient:', typeof supabase.createClient); // debe mostrar "function"

// ✅ No destructures: usa directamente supabase.createClient
const client = supabase.createClient(
  'https://zrrxvuviwywvjkautkrp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpycnh2dXZpd3l3dmprYXV0a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzMwMTYsImV4cCI6MjA2OTY0OTAxNn0.KlUARhP3edPcBGHTpoexxGXh5neO9zzCvi7Dk0J6X_E'
);

console.log('Cliente Supabase creado:', client);


const bubble = document.getElementById('chat-bubble');
const windowChat = document.getElementById('chat-window');
const messagesDiv = document.getElementById('chat-messages');
const input = document.getElementById('chat-input');
const adminArea = document.getElementById('admin-chat-area');

const sessions = {};
let visitorIP = null;

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

bubble.addEventListener('click', () => {
  windowChat.classList.toggle('hidden');
});

input.addEventListener('keydown', async e => {
  if (e.key === 'Enter') {
    const content = input.value.trim();
    if (!content) return;
    await client.from('messages').insert([{ ip: visitorIP, sender: 'visitor', content }]);
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
  const { data, error } = await client
    .from('messages')
    .select('*')
    .eq('ip', ip)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al obtener mensajes:', error);
    return;
  }

  data.forEach(msg => renderMessage(msg, messagesDiv));
}

function subscribeToMessages(ip) {
  client
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

async function loadAdminView() {
  const { data, error } = await client
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error en vista admin:', error);
    return;
  }

  adminArea.innerHTML = '';
  data.forEach(msg => {
    if (!sessions[msg.ip]) {
      sessions[msg.ip] = [];
      createAdminWindow(msg.ip);
    }
    sessions[msg.ip].push(msg);
    renderMessage(msg, document.getElementById(`admin-msgs-${msg.ip}`));
  });

  client
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
  input.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      const content = e.target.value.trim();
      if (!content) return;
      await client.from('messages').insert([{ ip, sender: 'admin', content }]);
      e.target.value = '';
    }
  });
}

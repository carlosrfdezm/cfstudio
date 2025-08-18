console.log('Supabase global:', window.supabase);
console.log('typeof createClient:', typeof window.supabase.createClient);
function sanitizeIP(ip) {
  return ip.replaceAll('.', '-'); // Ej: "152.207.224.105" → "152-207-224-105"
}

const adminArea = document.getElementById('admin-area');


    const client = window.supabase.createClient(
      'https://zrrxvuviwywvjkautkrp.supabase.co',
       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpycnh2dXZpd3l3dmprYXV0a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzMwMTYsImV4cCI6MjA2OTY0OTAxNn0.KlUARhP3edPcBGHTpoexxGXh5neO9zzCvi7Dk0J6X_E'
      
    );

    console.log('Cliente creado:', client);


const bubble = document.getElementById('chat-bubble');
const windowChat = document.getElementById('chat-window');
const messagesDiv = document.getElementById('chat-messages');
const input = document.getElementById('chat-text');
const sendBtn = document.getElementById('chat-send');

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
    setTimeout(() => input.focus(), 300);

  const isVisible = windowChat.style.display === 'flex';
  windowChat.style.display = isVisible ? 'none' : 'flex';
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
    .from('messages')
    .on('INSERT', payload => {
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
    renderMessage(msg, document.getElementById(`admin-msgs-${sanitizeIP(msg.ip)}`));

  });

  client
  .from('messages')
  .on('INSERT', payload => {
    const msg = payload.new;
    if (!sessions[msg.ip]) {
      sessions[msg.ip] = [];
      createAdminWindow(msg.ip);
    }
    sessions[msg.ip].push(msg);
    renderMessage(msg, document.getElementById(`admin-msgs-${sanitizeIP(msg.ip)}`));

  })
  .subscribe();
}

function createAdminWindow(ip) {
  const safeIP = sanitizeIP(ip);

  const wrapper = document.createElement('div');
  wrapper.className = 'chat-window';
  wrapper.innerHTML = `
  <div class="chat-header">IP: ${ip}</div>
  <div class="messages" id="admin-msgs-${safeIP}"></div>
  <div class="admin-input-wrapper">
    <input type="text" placeholder="Responder..." id="admin-input-${safeIP}" />
    <button id="admin-send-${safeIP}">Enviar</button>
  </div>
`;

const sendBtn = wrapper.querySelector(`#admin-send-${safeIP}`);
sendBtn.addEventListener('click', async () => {
  const input = wrapper.querySelector(`#admin-input-${safeIP}`);
  const content = input.value.trim();
  if (!content) return;

  const { data, error } = await client.from('messages').insert([{ ip, sender: 'admin', content }]);
  if (!error && data && data[0]) {
    renderMessage(data[0], document.getElementById(`admin-msgs-${safeIP}`));
  }

  input.value = '';
});


  adminArea.appendChild(wrapper);

  const input = wrapper.querySelector(`#admin-input-${safeIP}`);
  input.addEventListener('keydown', async e => {
  if (e.key === 'Enter') {
    const content = e.target.value.trim();
    if (!content) return;

    const { data, error } = await client.from('messages').insert([{ ip, sender: 'admin', content }]);
    if (!error && data && data[0]) {
      renderMessage(data[0], document.getElementById(`admin-msgs-${safeIP}`));
    }

    e.target.value = '';
  }
});
}


sendBtn.addEventListener('click', async () => {
  const content = input.value.trim();
  if (!content) return;
  const { data, error } = await client.from('messages').insert([{ ip: visitorIP, sender: 'visitor', content }]);
  if (!error && data) renderMessage(data[0], messagesDiv);
  input.value = '';
});

document.getElementById('clear-chat').addEventListener('click', async () => {
  if (!visitorIP) return;
  const { error } = await client
    .from('messages')
    .delete()
    .eq('ip', visitorIP);

  if (!error) {
    messagesDiv.innerHTML = '';
  }
});





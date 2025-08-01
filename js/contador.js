const SUPABASE_URL = 'https://zrrxvuviwywvjkautkrp.supabase.co'; // ✅ URL corregida
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpycnh2dXZpd3l3dmprYXV0a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzMwMTYsImV4cCI6MjA2OTY0OTAxNn0.KlUARhP3edPcBGHTpoexxGXh5neO9zzCvi7Dk0J6X_E';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE = 'visitas';

async function registrarVisita() {
  await supabase.from(TABLE).insert([{ fecha: new Date().toISOString() }]);
}

async function mostrarContador() {
  const { count, error } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true });

  const el = document.getElementById('counter');
  if (error) {
    console.error('Error al contar visitas:', error);
    el.textContent = '—';
  } else {
    el.textContent = count;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await registrarVisita();
  await mostrarContador();
});

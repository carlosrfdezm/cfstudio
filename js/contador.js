const SUPABASE_URL = 'https://zrrxvuviwywvjkautkrp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpycnh2dXZpd3l3dmprYXV0a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzMwMTYsImV4cCI6MjA2OTY0OTAxNn0.KlUARhP3edPcBGHTpoexxGXh5neO9zzCvi7Dk0J6X_E';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE = 'visitas';

async function obtenerIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const { ip } = await res.json();
    return ip;
  } catch (err) {
    console.error("No se pudo obtener la IP:", err.message);
    return null;
  }
}

async function registrarVisita() {
  const ip = await obtenerIP();
  if (!ip) return;

  // Verificar si ya existe
  const { data, error } = await supabase
    .from(TABLE)
    .select("ip")
    .eq("ip", ip);

  if (error) {
    console.error("Error al consultar IP:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    // Insertar nueva visita
    const { error: insertError } = await supabase
      .from(TABLE)
      .insert([{ ip, fecha: new Date().toISOString() }]);

    if (insertError) {
      console.error("Error al registrar visita:", insertError.message);
    } else {
      console.log("✅ Visita registrada");
    }
  } else {
    console.log("⏸️ IP ya registrada, no se cuenta de nuevo");
  }
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

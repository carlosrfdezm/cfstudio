// visitas.js

const SUPABASE_URL = 'https://zrrxvuviwywvjkautkrp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpycnh2dXZpd3l3dmprYXV0a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzMwMTYsImV4cCI6MjA2OTY0OTAxNn0.KlUARhP3edPcBGHTpoexxGXh5neO9zzCvi7Dk0J6X_E';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE = 'visitas';

export async function obtenerIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const { ip } = await res.json();
    return ip;
  } catch (err) {
    console.warn("No se pudo obtener la IP, se registrará como NULL");
    return null;
  }
}

export async function obtenerPais(ip) {
  if (!ip) return null;
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return data.country_name || null;
  } catch (err) {
    console.warn("No se pudo obtener el país:", err.message);
    return null;
  }
}

export async function registrarVisita() {
  const ip = await obtenerIP();
  const pais = await obtenerPais(ip);

  const { error } = await supabase
    .from(TABLE)
    .insert([{ ip, pais, fecha: new Date().toISOString() }]);

  if (error) {
    console.error("Error al registrar visita:", error.message);
  } else {
    console.log("✅ Visita registrada:", { ip, pais });
  }
}

export async function mostrarContador() {
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

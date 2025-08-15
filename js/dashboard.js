document.addEventListener("DOMContentLoaded", () => {
  const supabaseUrl = 'https://zrrxvuviwywvjkautkrp.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpycnh2dXZpd3l3dmprYXV0a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzMwMTYsImV4cCI6MjA2OTY0OTAxNn0.KlUARhP3edPcBGHTpoexxGXh5neO9zzCvi7Dk0J6X_E';

  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  async function cargarDatos() {
    const { data, error } = await supabase
      .from("visitas")
      .select("pais");

    if (error) {
      console.error("Error al cargar datos:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.warn("No hay datos de visitas para mostrar.");
      return;
    }

    const visitasPorPais = {};
    data.forEach(v => {
      const pais = v.pais || "Desconocido";
      visitasPorPais[pais] = (visitasPorPais[pais] || 0) + 1;
    });

    const visitas = Object.entries(visitasPorPais)
      .map(([pais, cantidad]) => ({ pais, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    renderizarGrafico(visitas);
  }

  function renderizarGrafico(visitas) {
    const labels = visitas.map(v => v.pais);
    const data = visitas.map(v => v.cantidad);
    const backgroundColors = visitas.map((_, i) =>
      `hsl(${(i * 40) % 360}, 70%, 60%)`
    );

    const ctx = document.getElementById("visitasChart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{
          label: "Visitas",
          data,
          backgroundColor: backgroundColors,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  cargarDatos();
});

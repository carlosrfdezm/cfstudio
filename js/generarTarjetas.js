document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("tarjetas-servicios");

  servicios.forEach(servicio => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "card-container fade-in";
    tarjeta.innerHTML = `
      <div class="card">
        <div class="card-front">
          <i class="${servicio.icono}" style="font-size: 2rem; margin-bottom: 10px;"></i>
          <h3>${servicio.titulo}</h3>
          <p>${servicio.subtitulo}</p>
        </div>
        <div class="card-back">
          <p>${servicio.detalle}</p>
        </div>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });

  // Activar animación de entrada
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
});


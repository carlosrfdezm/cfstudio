document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("tarjetas-servicios");

  servicios.forEach(servicio => {
    const col = document.createElement("div");
    col.className = "col-md-6 mb-4 d-flex justify-content-center";

    col.innerHTML = `
      <div class="card-container fade-in">
        <div class="card">
          <div class="card-face card-front">
            <i class="${servicio.icono}" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <h3>${servicio.titulo}</h3>
            <p>${servicio.subtitulo}</p>
          </div>
          <div class="card-face card-back">
            <p>${servicio.detalle}</p>
          </div>
        </div>
      </div>
    `;

    contenedor.appendChild(col);
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

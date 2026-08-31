// js/portafolios.js
document.addEventListener('DOMContentLoaded', async () => {
  const SUPABASE_URL = 'https://zrrxvuviwywvjkautkrp.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpycnh2dXZpd3l3dmprYXV0a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzMwMTYsImV4cCI6MjA2OTY0OTAxNn0.KlUARhP3edPcBGHTpoexxGXh5neO9zzCvi7Dk0J6X_E';
  
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  
  async function cargarPortafolios() {
    const { data, error } = await supabase
      .from('portafolios')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error al cargar portafolios:', error);
      return;
    }
    
    const carouselInner = document.getElementById('carousel-contenido');
    
    if (!carouselInner) {
      console.error('No se encontró el elemento #carousel-contenido');
      return;
    }
    
    carouselInner.innerHTML = '';
    
    if (data.length === 0) {
      carouselInner.innerHTML = '<div class="text-center py-5"><p>No hay portafolios disponibles.</p></div>';
      return;
    }
    
    data.forEach((portafolio, index) => {
      const item = document.createElement('div');
      item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
      
      item.innerHTML = `
        <a href="${portafolio.url || '#'}" target="_blank" rel="noopener">
          <img src="${portafolio.imagen || 'images/placeholder.jpg'}" class="d-block w-100" alt="${portafolio.titulo}">
        </a>
        <div class="carousel-caption d-none d-md-block">
          <h5>${portafolio.titulo}</h5>
          <p>${portafolio.descripcion || ''}</p>
          <a class="btn btn-sm btn-light" href="${portafolio.url || '#'}" target="_blank" rel="noopener">Ver sitio</a>
        </div>
      `;
      
      carouselInner.appendChild(item);
    });
    
    // Reiniciar carousel
    const carousel = document.getElementById('carouselPortafolios');
    if (carousel) {
      new bootstrap.Carousel(carousel);
    }
  }
  
  cargarPortafolios();
});
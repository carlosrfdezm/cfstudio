document.addEventListener('DOMContentLoaded', () => {
  const namespace = 'cfstudio';
  const key = 'pagina-principal';
  const counterElement = document.getElementById('visits-counter');

  async function getAndIncrementCounter() {
    try {
      const response = await fetch(`https://countapi.dev/hit/${namespace}/${key}`);
      const data = await response.json();

      if (data?.value !== undefined) {
        counterElement.textContent = data.value;
      } else {
        counterElement.textContent = 'Error al cargar';
        console.error('CountAPI no devolvió un valor válido:', data);
      }
    } catch (error) {
      counterElement.textContent = 'Error de red';
      console.error('Error al conectar con CountAPI:', error);
    }
  }

  getAndIncrementCounter();
});

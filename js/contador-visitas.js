document.addEventListener('DOMContentLoaded', (event) => {
    const namespace = 'cfstudiio'; // Asegúrate de que este sea el mismo que usaste antes
    const key = 'pagina-principal'; // Asegúrate de que este sea el mismo que usaste antes
    const counterElement = document.getElementById('visits-counter');

    function getAndIncrementCounter() {
        fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.value !== undefined) {
                    counterElement.textContent = data.value;
                } else {
                    counterElement.textContent = 'Error al cargar';
                    console.error('CountAPI no devolvió un valor válido:', data);
                }
            })
            .catch(error => {
                counterElement.textContent = 'Error de red';
                console.error('Error al conectar con CountAPI:', error);
            });
    }

    getAndIncrementCounter();
});
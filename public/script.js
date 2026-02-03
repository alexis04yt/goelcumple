document.addEventListener('DOMContentLoaded', () => {


    // Logic for index.html (form submission)
    const attendanceForm = document.getElementById('attendanceForm');
    const messageElement = document.getElementById('message');

    if (attendanceForm) {
        attendanceForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const nombreFamilia = document.getElementById('nombreFamilia').value;
            const confirmacionAsistencia = document.querySelector('input[name="confirmacionAsistencia"]:checked');

            if (!nombreFamilia || !confirmacionAsistencia) {
                messageElement.textContent = 'Por favor, complete todos los campos.';
                messageElement.style.color = 'red';
                return;
            }

            const formData = {
                nombreFamilia: nombreFamilia,
                confirmacionAsistencia: confirmacionAsistencia.value
            };

            try {
                const response = await fetch(`/submit-data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    messageElement.textContent = result.message;
                    messageElement.style.color = 'green';
                    attendanceForm.reset(); // Clear the form
                } else {
                    messageElement.textContent = `Error: ${result.message}`;
                    messageElement.style.color = 'red';
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                messageElement.textContent = 'Error de conexión con el servidor.';
                messageElement.style.color = 'red';
            }
        });
    }

    // Logic for ver_datos.html (data display and auto-update)
    const dataTableBody = document.querySelector('#dataTable tbody');

    async function fetchAndRenderData() {
        if (!dataTableBody) return; // Only run if on ver_datos.html

        try {
            const response = await fetch(`/get-data`);
            const data = await response.json();

            dataTableBody.innerHTML = ''; // Clear existing rows

            if (data.length === 0) {
                const row = dataTableBody.insertRow();
                const cell = row.insertCell(0);
                cell.colSpan = 4;
                cell.textContent = 'No hay datos registrados aún.';
                cell.style.textAlign = 'center';
                return;
            }

            data.forEach(item => {
                const row = dataTableBody.insertRow();
                row.insertCell(0).textContent = item.id;
                row.insertCell(1).textContent = item.nombreFamilia;
                row.insertCell(2).textContent = item.confirmacionAsistencia;
                row.insertCell(3).textContent = new Date(item.timestamp).toLocaleString();
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            if (dataTableBody) {
                dataTableBody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Error al cargar los datos. Asegúrate de que el servidor esté funcionando.</td></tr>`;
            }
        }
    }

    // Initial fetch and render for ver_datos.html
    if (dataTableBody) {
        fetchAndRenderData();
        // Auto-update every 5 seconds
        setInterval(fetchAndRenderData, 5000);
    }
});

async function preguntar() {
    const campoPregunta = document.getElementById("pregunta");
    const respuesta = document.getElementById("respuesta");
    const boton = document.getElementById("btnPreguntar");

    const pregunta = campoPregunta.value.trim();

    if (!pregunta) {
        respuesta.innerText = "Debe ingresar una pregunta.";
        return;
    }

    respuesta.innerHTML = '<span class="cargando">Consultando documentos...</span>';
    boton.disabled = true;

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ pregunta: pregunta })
        });

        if (!response.ok) {
            throw new Error("Error HTTP: " + response.status);
        }

        const data = await response.json();
        respuesta.innerText = data.respuesta;
        cargarHistorial();
    } catch (error) {
        console.error(error);
        respuesta.innerText = "No fue posible obtener una respuesta.";
    } finally {
        boton.disabled = false;
    }
}

function usarPregunta(texto) {
    document.getElementById("pregunta").value = texto;
}

async function cargarHistorial() {
    const contenedor = document.getElementById("historial");

    try {
        const response = await fetch("/api/consultas");
        if (!response.ok) {
            throw new Error("Error HTTP: " + response.status);
        }

        const consultas = await response.json();
        contenedor.innerHTML = "";

        if (consultas.length === 0) {
            contenedor.innerText = "Aún no hay consultas.";
            return;
        }

        // Más recientes primero
        consultas.slice().reverse().forEach(function (c) {
            const item = document.createElement("div");
            item.className = "consulta";

            const fecha = document.createElement("div");
            fecha.className = "fecha";
            fecha.textContent = c.fecha ? new Date(c.fecha).toLocaleString("es-CO") : "";

            const pregunta = document.createElement("div");
            pregunta.className = "pregunta";
            pregunta.textContent = c.pregunta;

            const texto = document.createElement("div");
            texto.className = "texto-respuesta";
            texto.textContent = c.respuesta;

            item.appendChild(fecha);
            item.appendChild(pregunta);
            item.appendChild(texto);
            contenedor.appendChild(item);
        });
    } catch (error) {
        console.error(error);
        contenedor.innerText = "No fue posible cargar el historial.";
    }
}

cargarHistorial();

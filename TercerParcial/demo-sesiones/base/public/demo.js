// La página solo hace fetch a la API. El navegador manda la cookie solo (misma página, mismo servidor).
const $ = (id) => document.getElementById(id);
async function llamar(metodo, url, datos = null) {
    const opciones = {
        method: metodo,
        headers: {}
    };

    // Si hay datos que enviar, agregamos el encabezado de JSON y serializamos el cuerpo
    if (datos !== null) {
        opciones.headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(datos);
    }

    try {
        const respuesta = await fetch(url, opciones);
        const status = respuesta.status;
        
        let datosRespuesta = null;
        const contentType = respuesta.headers.get('content-type');
        
        // Verificamos si la respuesta es JSON para evitar errores si regresa otra cosa
        if (contentType && contentType.includes('application/json')) {
            datosRespuesta = await respuesta.json();
        } else {
            datosRespuesta = await respuesta.text();
        }

        return {
            status: status,
            datos: datosRespuesta
        };
    } catch (error) {
        // En caso de un error de red o fallo general, regresamos status de error y datos null
        console.error("Error en la petición fetch:", error);
        return {
            status: 500,
            datos: null
        };
    }
}

function agregarABitacora(metodo, url, status, datos) {
    const listaBitacora = document.getElementById('bitacora');
    if (!listaBitacora) return;

    const li = document.createElement('li');
    
    // Determinar la clase CSS según el código de estado
    let claseCodigo = 'codigo error';
    if (status >= 200 && status < 300) {
        claseCodigo = 'codigo ok';
    } else if (status === 401) {
        claseCodigo = 'codigo e401';
    } else if (status === 403) {
        claseCodigo = 'codigo e403';
    }

    // Usamos textContent de forma segura para evitar ataques XSS
    const spanCodigo = document.createElement('span');
    spanCodigo.className = claseCodigo;
    spanCodigo.textContent = status;

    const spanDetalles = document.createElement('span');
    spanDetalles.textContent = ` ${metodo} ${url} - `;

    const preDatos = document.createElement('pre');
    preDatos.textContent = JSON.stringify(datos, null, 2);

    li.appendChild(spanCodigo);
    li.appendChild(spanDetalles);
    li.appendChild(preDatos);

    // Insertar arriba para que lo más nuevo aparezca primero
    listaBitacora.prepend(li);
}

async function actualizarEstado() {
    const divEstado = document.getElementById('estado');
    const spanCookie = document.getElementById('cookie-js');

    // Hacemos la petición GET para consultar la sesión actual
    const resultado = await llamar('GET', '/api/sesion');

    if (divEstado) {
        if (resultado.status === 200) {
            // Si hay sesión activa (200), mostramos los datos y clase verde
            const { usuario, sesion, expiraEnSegundos } = resultado.datos;
            divEstado.className = 'estado con-sesion';
            divEstado.textContent = `Hola, ${usuario.nombre} (${usuario.rol}) — Sesión: ${sesion} — Vence en ${expiraEnSegundos} s`;
        } else {
            // Si no hay sesión (ej. 401), mostramos aviso y clase roja
            divEstado.className = 'estado sin-sesion';
            divEstado.textContent = `Sin sesión (el servidor responde ${resultado.status})`;
        }
    }

    // Mostramos las cookies accesibles por JavaScript
    if (spanCookie) {
        spanCookie.textContent = document.cookie || '(vacío)';
    }
}

async function actualizarTablaSesiones() {
    const divDonde = document.getElementById('donde');
    const tbodyTabla = document.getElementById('tabla-sesiones');

    const resultado = await llamar('GET', '/api/diagnostico/sesiones');

    if (resultado.status === 200) {
        const { almacen, sesiones } = resultado.datos;

        // Mostrar dónde se guardan las sesiones
        if (divDonde) {
            divDonde.textContent = `Se guardan en: ${almacen}`;
        }

        // Vaciar la tabla antes de volver a llenarla para evitar duplicados
        if (tbodyTabla) {
            tbodyTabla.innerHTML = '';

            if (sesiones.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 4;
                td.textContent = '(sin sesiones)';
                tr.appendChild(td);
                tbodyTabla.appendChild(tr);
            } else {
                sesiones.forEach(s => {
                    const tr = document.createElement('tr');
                    
                    // Si es nuestra sesión, le agregamos la clase 'tuya'
                    if (s.esLaTuya) {
                        tr.className = 'tuya';
                    }

                    const tdSesion = document.createElement('td');
                    tdSesion.textContent = s.sesion + (s.esLaTuya ? ' (la tuya)' : '');

                    const tdUsuario = document.createElement('td');
                    tdUsuario.textContent = s.usuario;

                    const tdVisitas = document.createElement('td');
                    tdVisitas.textContent = s.visitas;

                    const tdVence = document.createElement('td');
                    // Convertimos la fecha ISO a hora local legible
                    tdVence.textContent = new Date(s.expira).toLocaleTimeString();

                    tr.appendChild(tdSesion);
                    tr.appendChild(tdUsuario);
                    tr.appendChild(tdVisitas);
                    tr.appendChild(tdVence);

                    tbodyTabla.appendChild(tr);
                });
            }
        }
    }
}

// Función para refrescar tanto el estado como la tabla de sesiones
async function refrescarTodo() {
    await actualizarEstado();
    await actualizarTablaSesiones();
}

// Configuración de todos los eventos de la página
function inicializarEventos() {
    // 1. Cambio automático de contraseña al cambiar de usuario en el select
    const selectUsuario = document.getElementById('usuario');
    const inputContrasena = document.getElementById('contrasena');
    
    if (selectUsuario && inputContrasena) {
        selectUsuario.addEventListener('change', () => {
            const usuarioVal = selectUsuario.value;
            inputContrasena.value = usuarioVal + '12345';
        });
        // Inicializar el valor con el usuario seleccionado por defecto
        selectUsuario.dispatchEvent(new Event('change'));
    }

    // 2. Envío del formulario de login (#form-login) sin recargar la página
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita la recarga completa
            const usuario = selectUsuario.value;
            const contrasena = inputContrasena.value;

            const resultado = await llamar('POST', '/api/login', { usuario, contrasena });
            agregarABitacora('POST', '/api/login', resultado.status, resultado.datos);
            await refrescarTodo();
        });
    }

    // 3. Botones con data-metodo y data-url (se recorren todos automáticamente)
    const botonesAccion = document.querySelectorAll('[data-url]');
    botonesAccion.forEach(boton => {
        boton.addEventListener('click', async () => {
            const metodo = boton.dataset.metodo || 'GET';
            const url = boton.dataset.url;

            const resultado = await llamar(metodo, url);
            agregarABitacora(metodo, url, resultado.status, resultado.datos);
            await refrescarTodo();
        });
    });

    // 4. Botón de refrescar general (#btn-refrescar)
    const btnRefrescar = document.getElementById('btn-refrescar');
    if (btnRefrescar) {
        btnRefrescar.addEventListener('click', async () => {
            await refrescarTodo();
        });
    }

    // 5. Botón específico para actualizar solo la tabla (#btn-sesiones)
    const btnSesiones = document.getElementById('btn-sesiones');
    if (btnSesiones) {
        btnSesiones.addEventListener('click', async () => {
            await actualizarTablaSesiones();
        });
    }
}

// Ejecutamos la inicialización de eventos y cargamos el estado inicial
document.addEventListener('DOMContentLoaded', async () => {
    // Etapa 6: Cargar la configuración inicial GET /api/config
    const resConfig = await llamar('GET', '/api/config');
    const divConfig = document.getElementById('config');
    if (divConfig && resConfig.status === 200) {
        divConfig.textContent = JSON.stringify(resConfig.datos, null, 2);
    }

    // Inicializar eventos y refrescar estado/tabla al cargar
    inicializarEventos();
    await refrescarTodo();
});


// La página web hace peticiones fetch a la API. El navegador se encarga de mandar la cookie solo 
// porque estamos en la misma página y el mismo servidor, así que no necesitamos configurar credentials extra.
const $ = (id) => document.getElementById(id);

/**
 * Función central para hacer peticiones fetch sin repetir código en cada botón.
 * Uso try/catch por si el servidor contesta algo que no sea JSON (para que la app no truene).
 */
async function llamar(metodo, url, datos = null) {
    const opciones = {
        method: metodo,
        headers: {}
    };

    // Si mandamos un cuerpo (como en el login), avisamos que es JSON y serializamos los datos
    if (datos !== null) {
        opciones.headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(datos);
    }

    try {
        const respuesta = await fetch(url, opciones);
        const status = respuesta.status;
        
        let datosRespuesta = null;
        const contentType = respuesta.headers.get('content-type');
        
        // Verificamos si la respuesta es JSON para leerla bien, si no, la tomamos como texto plano
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
        // Si hay un fallo de red o el servidor está apagado, atrapamos el error aquí y regresamos 500
        console.error("Error en la petición fetch:", error);
        return {
            status: 500,
            datos: null
        };
    }
}

/**
 * Añade los resultados de cada petición a la bitácora visual de la página.
 * Uso textContent para prevenir ataques XSS (por si alguien intenta inyectar script malicioso).
 */
function agregarABitacora(metodo, url, status, datos) {
    const listaBitacora = document.getElementById('bitacora');
    if (!listaBitacora) return;

    const li = document.createElement('li');
    
    // Le asignamos un color diferente al código dependiendo de si fue éxito (2xx) o error (401, 403, etc.)
    let claseCodigo = 'codigo error';
    if (status >= 200 && status < 300) {
        claseCodigo = 'codigo ok';
    } else if (status === 401) {
        claseCodigo = 'codigo e401';
    } else if (status === 403) {
        claseCodigo = 'codigo e403';
    }

    const spanCodigo = document.createElement('span');
    spanCodigo.className = claseCodigo;
    spanCodigo.textContent = status;

    const spanDetalles = document.createElement('span');
    spanDetalles.textContent = ` ${metodo} ${url}`;

    const preDatos = document.createElement('pre');
    preDatos.textContent = JSON.stringify(datos, null, 2);

    li.appendChild(spanCodigo);
    li.appendChild(spanDetalles);
    li.appendChild(preDatos);

    // Usamos prepend para que lo más nuevo siempre quede hasta arriba de la bitácora
    listaBitacora.prepend(li);
}

/**
 * Consulta la ruta GET /api/sesion para ver si tenemos una sesión activa.
 * Actualiza la tarjeta de estado a verde o rojo, y muestra document.cookie (que saldrá vacío por el httpOnly).
 */
async function actualizarEstado() {
    const divEstado = document.getElementById('estado');
    const spanCookie = document.getElementById('cookie-js');

    const resultado = await llamar('GET', '/api/sesion');

    if (divEstado) {
        if (resultado.status === 200) {
            // Si hay sesión (200), ponemos la tarjeta en verde con los datos del usuario
            const { usuario, sesion, expiraEnSegundos } = resultado.datos;
            divEstado.className = 'estado con-sesion';
            divEstado.textContent = `Hola, ${usuario.nombre} (${usuario.rol}) — Sesión: ${sesion} — Vence en ${expiraEnSegundos} s`;
        } else {
            // Si no hay sesión (ej. 401), ponemos la tarjeta en rojo avisando el código
            divEstado.className = 'estado sin-sesion';
            divEstado.textContent = `Sin sesión (el servidor responde ${resultado.status})`;
        }
    }

    // Como la cookie tiene httpOnly, document.cookie no puede leerla y aparecerá vacía
    if (spanCookie) {
        spanCookie.textContent = document.cookie || '(vacío)';
    }
}

/**
 * Consulta el diagnóstico del servidor (MySQL) para ver dónde se guardan las sesiones 
 * y reconstruye la tabla de sesiones activas.
 */
async function actualizarTablaSesiones() {
    const divDonde = document.getElementById('donde');
    const tbodyTabla = document.getElementById('tabla-sesiones');

    const resultado = await llamar('GET', '/api/diagnostico/sesiones');

    if (resultado.status === 200) {
        const { almacen, sesiones } = resultado.datos;

        // Mostramos si se guardan en mysql o memoria
        if (divDonde) {
            divDonde.textContent = `Se guardan en: ${almacen}`;
        }

        // Vaciamos el tbody antes de llenarlo para evitar que se repitan las filas duplicadas
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
                    
                    // Si la sesión es nuestra, le ponemos una clase especial para resaltarla
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
                    // Convertimos la fecha ISO que manda el servidor a la hora local legible de la compu
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

// Función auxiliar para refrescar la tarjeta de estado y la tabla del servidor al mismo tiempo
async function refrescarTodo() {
    await actualizarEstado();
    await actualizarTablaSesiones();
}

/**
 * Conecta todos los eventos de la página (el select de usuarios, el formulario de login, 
 * los botones automáticos con data-url y los botones de refrescar).
 */
function inicializarEventos() {
    // 1. Cambia la contraseña automáticamente al cambiar de usuario en el menú desplegable
    const selectUsuario = document.getElementById('usuario');
    const inputContrasena = document.getElementById('contrasena');
    
    if (selectUsuario && inputContrasena) {
        selectUsuario.addEventListener('change', () => {
            const usuarioVal = selectUsuario.value;
            inputContrasena.value = usuarioVal + '12345';
        });
        selectUsuario.dispatchEvent(new Event('change'));
    }

    // 2. Envía el formulario de login con fetch y evitamos que recargue la página usando preventDefault
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const usuario = selectUsuario.value;
            const contrasena = inputContrasena.value;

            const resultado = await llamar('POST', '/api/login', { usuario, contrasena });
            agregarABitacora('POST', '/api/login', resultado.status, resultado.datos);
            await refrescarTodo();
        });
    }

    // 3. Recorremos con querySelectorAll todos los botones de acción que tengan data-url para no repetir código
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

    // 4. Botón general para refrescar la información
    const btnRefrescar = document.getElementById('btn-refrescar');
    if (btnRefrescar) {
        btnRefrescar.addEventListener('click', async () => {
            await refrescarTodo();
        });
    }

    // 5. Botón específico para actualizar solo la tabla de sesiones
    const btnSesiones = document.getElementById('btn-sesiones');
    if (btnSesiones) {
        btnSesiones.addEventListener('click', async () => {
            await actualizarTablaSesiones();
        });
    }
}

// Al cargar el DOM completamente, cargamos la configuración inicial y disparamos los eventos
document.addEventListener('DOMContentLoaded', async () => {
    // Etapa 6: Consultamos la ruta GET /api/config para pintar la tarjeta de configuración
    const resConfig = await llamar('GET', '/api/config');
    const divConfig = document.getElementById('config');
    if (divConfig && resConfig.status === 200) {
        divConfig.textContent = JSON.stringify(resConfig.datos, null, 2);
    }

    // Inicializamos los eventos de los botones y actualizamos estado y tabla por primera vez
    inicializarEventos();
    await refrescarTodo();
});


const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
const TEXTO_TALLER = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,:&+#()\-]*$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function limpiar(texto) {
    return String(texto ?? '').trim().replace(/\s+/g, ' ');
}

function errorNombre(nombre, campo = 'El nombre') {
    const n = limpiar(nombre);
    if (!n) return `${campo} es obligatorio`;
    if (n.length < 3) return `${campo} debe tener al menos 3 caracteres`;
    if (n.length > 100) return `${campo} no puede tener más de 100 caracteres`;
    if (!SOLO_LETRAS.test(n)) {
        return `${campo} solo puede contener letras y espacios (sin números ni símbolos como @, -, _ o .)`;
    }
    return null;
}

function errorBoleta(boleta) {
    const b = String(boleta ?? '').trim();
    if (!b) return 'La boleta es obligatoria';
    if (!/^\d+$/.test(b)) return 'La boleta solo puede contener números';
    if (b.length !== 10) return 'La boleta debe tener exactamente 10 dígitos';
    return null;
}

function errorCorreo(correo) {
    const c = String(correo ?? '').trim();
    if (!c) return 'El correo es obligatorio';
    if (c.length > 150) return 'El correo no puede tener más de 150 caracteres';
    if (!CORREO.test(c)) return 'El correo no tiene un formato válido (ejemplo: nombre@correo.com)';
    return null;
}

function errorContrasena(contrasena) {
    const c = String(contrasena ?? '');
    if (!c) return 'La contraseña es obligatoria';
    if (c.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (c.length > 50) return 'La contraseña no puede tener más de 50 caracteres';
    return null;
}

function errorNombreTaller(nombre) {
    const n = limpiar(nombre);
    if (!n) return 'El nombre del taller es obligatorio';
    if (n.length < 3) return 'El nombre del taller debe tener al menos 3 caracteres';
    if (n.length > 150) return 'El nombre del taller no puede tener más de 150 caracteres';
    if (!TEXTO_TALLER.test(n)) return 'El nombre del taller solo puede contener letras, números y signos básicos (. , : & + # ( ) -)';
    return null;
}

const validarNombre = (nombre) => errorNombre(nombre) === null;
const validarBoleta = (boleta) => errorBoleta(boleta) === null;
const validarCorreo = (correo) => errorCorreo(correo) === null;
const validarContrasena = (contrasena) => errorContrasena(contrasena) === null;

function validarInscripcion(nombre, boleta) {
    return errorNombre(nombre) || errorBoleta(boleta);
}

module.exports = {
    limpiar,
    errorNombre, errorBoleta, errorCorreo, errorContrasena, errorNombreTaller,
    validarNombre, validarBoleta, validarCorreo, validarContrasena,
    validarInscripcion,
};
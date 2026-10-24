function validarCorreo(correo) {
    if (typeof correo !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}
 
function validarBoleta(boleta) {
    if (typeof boleta !== 'string' && typeof boleta !== 'number') return false;
    return /^\d{10}$/.test(String(boleta));
}
 
function validarContrasena(contrasena) {
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}
 
function validarNombre(nombre) {
    if (typeof nombre !== 'string') return false;
    return nombre.trim().length >= 2;
}
 
module.exports = { validarBoleta, validarContrasena, validarCorreo, validarNombre };
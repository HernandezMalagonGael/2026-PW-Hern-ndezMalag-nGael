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
 
function validarInscripcion(nombre, boleta) {
  if (!nombre || nombre.trim().length === 0) return "El nombre es obligatorio";
  if (nombre.trim().length > 100) return "El nombre no puede tener más de 100 caracteres";
  if (!/^\d{10}$/.test(boleta)) return "La boleta debe tener exactamente 10 dígitos";
  return null;
}

module.exports = { validarBoleta, validarContrasena, validarCorreo, validarNombre, validarInscripcion };
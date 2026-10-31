const bcrypt = require('bcryptjs');
const usuariosModel = require('./Modelo/usuarios_modelo');

async function verificarCredenciales(credenciales) {
    const correo = String((credenciales && credenciales.correo) || '').trim().toLowerCase();
    const contrasena = String((credenciales && credenciales.contrasena) || '');

    if (!correo || !contrasena) {
        return { status: 401, error: 'Escribe tu correo y contraseña para realizar esta acción' };
    }

    const usuario = await usuariosModel.buscarPorCorreoConHash(correo);
    const correcta = usuario && (await bcrypt.compare(contrasena, usuario.contrasena_hash));
    if (!correcta) return { status: 401, error: 'Correo o contraseña incorrectos' };

    return { usuario };
}

module.exports = { verificarCredenciales };
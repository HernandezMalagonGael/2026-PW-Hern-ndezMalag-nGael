// Consultas a la tabla usuarios. Siempre con ? (consulta parametrizada), nunca pegando texto en el SQL.
const bcrypt = require('bcryptjs');

function crearModeloUsuarios(pool) {
  // Regresa el usuario (sin el hash) si la contraseña es correcta, o null si no.
  async function verificar(usuario, contrasena) {
    // Consultamos al usuario en la base de datos usando consultas parametrizadas (?)
    const [filas] = await pool.query(
      'SELECT id, usuario, nombre, rol, contrasena_hash FROM usuarios WHERE usuario = ?',
      [usuario]
    );

    // Si no existe el usuario, regresamos null
    if (filas.length === 0) {
      return null;
    }

    const user = filas[0];

    // Comparamos la contraseña ingresada con el hash guardado usando bcrypt
    const passwordValida = await bcrypt.compare(contrasena, user.contrasena_hash);

    if (passwordValida) {
      // Regresamos el objeto de usuario SIN incluir el contrasena_hash por seguridad
      return {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        rol: user.rol
      };
    }

    // Si la contraseña no coincide, regresamos null
    return null;
  }

  return { verificar };
}

module.exports = { crearModeloUsuarios };
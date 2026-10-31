const pool = require('../bd-local');

const COLUMNAS_PUBLICAS = 'id, correo, nombre, boleta, rol';

async function listar() {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios ORDER BY id`);
    return filas;
}

async function obtenerPorId(id) {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`, [id]);
    return filas[0];
}

async function buscarPorBoleta(boleta) {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE boleta = ?`, [boleta]);
    return filas[0];
}

async function crear({ nombre, correo, contrasenaHash, boleta, rol }) {
    const [info] = await pool.query(
        `INSERT INTO usuarios (nombre, correo, contrasena_hash, boleta, rol) VALUES (?, ?, ?, ?, ?)`,
        [nombre, correo, contrasenaHash, boleta, rol || 'alumno']
    );
    return obtenerPorId(info.insertId);
}

async function actualizar(id, { nombre, correo, rol }) {
    const cambios = Object.entries({ nombre, correo, rol }).filter(([, valor]) => valor !== undefined);
    if (cambios.length === 0) return obtenerPorId(id);

    const columnas = cambios.map(([columna]) => `${columna} = ?`).join(', ');
    const valores = cambios.map(([, valor]) => valor);

    const [info] = await pool.query(`UPDATE usuarios SET ${columnas} WHERE id = ?`, [...valores, id]);
    if (info.affectedRows === 0) return undefined;
    return obtenerPorId(id);
}


async function eliminar(id) {
    const [info] = await pool.query(`DELETE FROM usuarios WHERE id = ?`, [id]);
    return info.affectedRows > 0;
}

async function buscarPorCorreoConHash(correo) {
    const [filas] = await pool.query(`SELECT * FROM usuarios WHERE correo = ?`, [correo]);
    return filas[0];
}

async function listarPorRol(rol) {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE rol = ? ORDER BY nombre`, [rol]);
    return filas;
}

module.exports = {listar,obtenerPorId,buscarPorBoleta,crear,actualizar,eliminar,buscarPorCorreoConHash, listarPorRol};
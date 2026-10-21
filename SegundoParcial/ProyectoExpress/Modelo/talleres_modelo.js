const pool = require('../bd-local');
 
async function listar() {
    const [filas] = await pool.query(`SELECT * FROM talleres ORDER BY id`);
    return filas;
}
 
async function obtenerPorId(id) {
    const [filas] = await pool.query(`SELECT * FROM talleres WHERE id = ?`, [id]);
    return filas[0];
}
 
async function registrarAlumno(tallerId, usuarioId) {
    const [info] = await pool.query(
        `INSERT INTO inscripciones (taller_id, usuario_id) VALUES (?, ?)`,
        [tallerId, usuarioId]
    );
    return { id: info.insertId, taller_id: Number(tallerId), usuario_id: Number(usuarioId) };
}
 
module.exports = { listar, obtenerPorId, registrarAlumno };
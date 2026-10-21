const pool = require('../bd-local');
 
async function registrarAsistencia({ tallerId, usuarioId, fecha, presente }) {
    const [info] = await pool.query(
        `INSERT INTO asistencias (taller_id, usuario_id, fecha, presente) VALUES (?, ?, ?, ?)`,
        [tallerId, usuarioId, fecha || new Date().toISOString().slice(0, 10), presente === undefined ? true : presente]
    );
    const [filas] = await pool.query(`SELECT * FROM asistencias WHERE id = ?`, [info.insertId]);
    return filas[0];
}
 
async function consultarPorTaller(tallerId) {
    const [filas] = await pool.query(
        `SELECT a.id, a.fecha, a.presente, u.id AS usuario_id, u.nombre, u.boleta
         FROM asistencias a
         JOIN usuarios u ON u.id = a.usuario_id
         WHERE a.taller_id = ?
         ORDER BY a.fecha, u.nombre`,
        [tallerId]
    );
    return filas;
}
 
module.exports = { registrarAsistencia, consultarPorTaller };
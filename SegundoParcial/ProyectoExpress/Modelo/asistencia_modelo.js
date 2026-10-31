const crypto = require('crypto');
const pool = require('../bd-local');

async function inscribir({ tallerId, nombreAlumno, boleta }) {
    const id = crypto.randomUUID();
    await pool.query(
        `INSERT INTO asistencias (id, taller_id, nombre_alumno, boleta) VALUES (?, ?, ?, ?)`,
        [id, tallerId, nombreAlumno, boleta]
    );
    return obtenerPorId(id);
}

async function obtenerPorId(id) {
    const [filas] = await pool.query(`SELECT * FROM asistencias WHERE id = ?`, [id]);
    return filas[0];
}

async function buscar(tallerId, boleta) {
    const [filas] = await pool.query(
        `SELECT * FROM asistencias WHERE taller_id = ? AND boleta = ?`,
        [tallerId, boleta]
    );
    return filas[0];
}

async function buscarPorBoleta(boleta) {
    const [filas] = await pool.query(`SELECT * FROM asistencias WHERE boleta = ? LIMIT 1`, [boleta]);
    return filas[0];
}

async function consultarPorTaller(tallerId) {
    const [filas] = await pool.query(
        `SELECT * FROM asistencias WHERE taller_id = ? ORDER BY nombre_alumno`,
        [tallerId]
    );
    return filas;
}
async function marcarAsistencia(id, asistio) {
    await pool.query(`UPDATE asistencias SET asistio = ? WHERE id = ?`, [asistio ? 1 : 0, id]);
    return obtenerPorId(id);
}

module.exports = { inscribir, obtenerPorId, buscar, buscarPorBoleta, consultarPorTaller, marcarAsistencia };
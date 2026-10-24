const crypto = require('crypto');
const pool = require('../bd-local');
 
async function registrarAsistencia({ tallerId, nombreAlumno, boleta }) {
    // En la tabla asistencias el id es un UUID (CHAR(36)), asi que lo generamos aqui
    const id = crypto.randomUUID();
    await pool.query(
        `INSERT INTO asistencias (id, taller_id, nombre_alumno, boleta) VALUES (?, ?, ?, ?)`,
        [id, tallerId, nombreAlumno, boleta]
    );
    const [filas] = await pool.query(`SELECT * FROM asistencias WHERE id = ?`, [id]);
    return filas[0];
}
 
async function consultarPorTaller(tallerId) {
    const [filas] = await pool.query(
        `SELECT * FROM asistencias WHERE taller_id = ? ORDER BY fecha_registro, nombre_alumno`,
        [tallerId]
    );
    return filas;
}
 
module.exports = { registrarAsistencia, consultarPorTaller };
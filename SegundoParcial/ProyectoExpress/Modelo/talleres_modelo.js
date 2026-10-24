const crypto = require('crypto');
const pool = require('../bd-local');

async function listar() {
    const [filas] = await pool.query(`SELECT * FROM talleres ORDER BY fecha, nombre`);
    return filas;
}

// Regresa el taller con el campo "asistentes" (cuantos alumnos tiene registrados)
async function obtenerPorId(id) {
    const [filas] = await pool.query(
        `SELECT t.*,
                (SELECT COUNT(*) FROM asistencias a WHERE a.taller_id = t.id) AS asistentes
         FROM talleres t
         WHERE t.id = ?`,
        [id]
    );
    return filas[0];
}

async function crear({ nombre, instructor, fecha, cupo }) {
    const id = crypto.randomUUID();
    await pool.query(
        `INSERT INTO talleres (id, nombre, instructor, fecha, cupo) VALUES (?, ?, ?, ?, ?)`,
        [id, nombre, instructor ?? null, fecha, cupo ?? 30]
    );
    return obtenerPorId(id);
}

async function registrarAlumno(tallerId, usuarioId) {
    const [info] = await pool.query(
        `INSERT INTO inscripciones (taller_id, usuario_id) VALUES (?, ?)`,
        [tallerId, usuarioId]
    );
    return { id: info.insertId, taller_id: tallerId, usuario_id: Number(usuarioId) };
}

module.exports = { listar, obtenerPorId, crear, registrarAlumno };
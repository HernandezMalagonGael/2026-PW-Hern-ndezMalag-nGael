const crypto = require('crypto');
const pool = require('../bd-local');

async function listar() {
    const [filas] = await pool.query(
        `SELECT id, nombre, instructor, fecha, cupo, created_at FROM talleres ORDER BY fecha, nombre`
    );
    return filas;
}

async function obtenerPorId(id) {
    const [filas] = await pool.query(
        `SELECT t.id, t.nombre, t.instructor, t.fecha, t.cupo, t.created_at,
                (SELECT COUNT(*) FROM asistencias a WHERE a.taller_id = t.id) AS asistentes
         FROM talleres t
         WHERE t.id = ?`,
        [id]
    );
    return filas[0];
}

async function obtenerClaveHash(id) {
    const [filas] = await pool.query(`SELECT clave_hash FROM talleres WHERE id = ?`, [id]);
    return filas[0] ? filas[0].clave_hash : null;
}

async function buscarPorNombreYFecha(nombre, fecha) {
    const [filas] = await pool.query(
        `SELECT id FROM talleres WHERE LOWER(nombre) = LOWER(?) AND fecha = ?`,
        [nombre, fecha]
    );
    return filas[0];
}

async function crear({ nombre, instructor, fecha, cupo, claveHash }) {
    const id = crypto.randomUUID();
    await pool.query(
        `INSERT INTO talleres (id, nombre, instructor, fecha, cupo, clave_hash) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, nombre, instructor, fecha, cupo ?? 30, claveHash]
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

module.exports = { listar, obtenerPorId, obtenerClaveHash, buscarPorNombreYFecha, crear, registrarAlumno };
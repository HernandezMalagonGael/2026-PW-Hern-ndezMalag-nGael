const pool = require('../bd-local');

const COLUMNAS_PUBLICAS = 'id, correo, nombre, boleta, rol';

///consultar a todos
async function listar() {
    const [filas] = await pool.query(`SELECT $(COLUMNAS_PUBLICAS) FROM usuarios ORDER BY id`);
    return filas;
}

//obtener por id
async function obtenerPorId() {
    const [filas] = await pool.query(`SELECT $(COLUMNAS_PUBLICAS) FROM usuarios WHERE id = ?`);
    return filas[0];
}

//REGISTRAR 
async function crear({nombre, correo, usuario, contrasenaHash, boleta, rol}){
    const [info] = await pool.query(`INSERT INTO usuarios (nombre, correo, contrasena_hash, boleta, rol) VALUES (?, ?, ?, ?, ?)`, [nombre, correo, contrasenaHash, boleta, rol || 'alumno']);
    return obtenerPorId(info.insertId);
}

async function actualizar(id, {nombre, correo, rol}){
    const cambios = Object.entries({nombre, correo, rol}).filter(([, valor]) => valor !== undefined);
    if (cambios.length === 0 ) return obtenerPorId(id);

    const columnas = cambios.map(([columna]) => `${columna} = ?`).join(',');

    const [info] = await pool.query(`UPDATE usuarios SET ${columnas} WHERE id = ?`, [...cambios.map(([ , valor]) => valor), id]);
    if(info.affectedRows === 0) return undefined;
    return obtenerPorId(id);
    
}

//Eliminar
async function eliminar(id) {
    const [filas] = await pool.query(`DELETE FROM usuarios WHERE id = ?`, [id]);
    return info.affectedRows > 0;
}

//buscar por correo hasheado
async function buscarPorCorreoConHash(correo) {
    const [filas] = await pool.query(`SELECT * FROM usuarios WHERE correo = ?`, [correo]);
    return filas[0];
}

module.exports= {listar, obtenerPorId, crear, actualizar, eliminar, buscarPorCorreoConHash}

//TAREA 1 crear los modeos de las tabls talleres y asistencia 
//taller tiene registrarAlumno al taller, consultar todos los talleres
//Asistencuas tiene registrarasistencia consultar asistencia de taller
//dos archuivos uno llaMADO talleres_modelo.js y asistencia_modelo,js 
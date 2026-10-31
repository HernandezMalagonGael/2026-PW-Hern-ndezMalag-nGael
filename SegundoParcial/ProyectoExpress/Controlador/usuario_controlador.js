const bcrypt = require('bcryptjs');
const usuariosModel = require('../Modelo/usuarios_modelo');
const asistenciaModel = require('../Modelo/asistencia_modelo');
const { errorNombre, errorBoleta, errorCorreo, errorContrasena } = require('../validaciones');

const ROLES_VALIDOS = ['alumno', 'profesor', 'admin'];

function esDuplicado(error) {
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}

function limpiarTexto(texto) {
    return String(texto).trim().replace(/\s+/g, ' ');
}

function normalizar(texto) {
    return String(texto).trim().replace(/\s+/g, ' ').toLowerCase();
}

async function listarUsuarios(req, res) {
    try {
        const usuarios = await usuariosModel.listar();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function listarProfesores(req, res) {
    try {
        const profesores = await usuariosModel.listarPorRol('profesor');
        res.json(profesores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function obtenerUsuario(req, res) {
    try {
        const usuario = await usuariosModel.obtenerPorId(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function registrar(req, res, rol) {
    const { contrasena } = req.body || {};

    if (!req.body || !req.body.nombre || !req.body.correo || !contrasena || !req.body.boleta) {
        return res.status(400).json({ error: 'nombre, correo, contrasena y boleta son obligatorios' });
    }

    const nombre = limpiarTexto(req.body.nombre);
    const correo = String(req.body.correo).trim().toLowerCase();
    const boleta = String(req.body.boleta).trim();

    const errorValidacion =
        errorNombre(nombre) || errorCorreo(correo) || errorBoleta(boleta) || errorContrasena(contrasena);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    try {
        if (await usuariosModel.buscarPorBoleta(boleta)) {
            return res.status(409).json({ error: 'Esa boleta ya está registrada' });
        }
        if (await usuariosModel.buscarPorCorreoConHash(correo)) {
            return res.status(409).json({ error: 'Ese correo ya está registrado' });
        }

        const contrasenaHash = await bcrypt.hash(contrasena, 10);
        const usuario = await usuariosModel.crear({ nombre, correo, contrasenaHash, boleta, rol });
        res.status(201).json(usuario);
    } catch (error) {
        if (esDuplicado(error)) return res.status(409).json({ error: 'Ya existe un usuario con ese correo o boleta' });
        res.status(500).json({ error: error.message });
    }
}

async function crearUsuario(req, res) {
    const { nombre, correo, contrasena, boleta, rol } = req.body || {};

    if (!nombre || !correo || !contrasena || !boleta) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const boletaLimpia = String(boleta).trim();
    const nombreLimpio = limpiarTexto(nombre);

    try {
        const usuarioExistente = await usuariosModel.buscarPorBoleta(boletaLimpia);
        if (usuarioExistente) {
            return res.status(400).json({ error: 'Esta boleta ya cuenta con un usuario registrado en el sistema' });
        }
        const asistenciaPrevia = await asistenciaModel.buscarPorBoleta(boletaLimpia);
        if (asistenciaPrevia) {
            if (normalizar(asistenciaPrevia.nombre_alumno) !== normalizar(nombreLimpio)) {
                return res.status(400).json({ error: 'Esta boleta ya está asociada a otro nombre en las inscripciones de talleres' });
            }
        }

        const contrasenaHash = await bcrypt.hash(contrasena, 10);
        const nuevoUsuario = await usuariosModel.crear({
            nombre: nombreLimpio,
            correo,
            contrasenaHash,
            boleta: boletaLimpia,
            rol: rol || 'alumno'
        });

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
            return res.status(400).json({ error: 'Esta boleta ya está registrada' });
        }
        res.status(500).json({ error: error.message });
    }
}

function crearUsuarioStaff(req, res) {
    const rol = req.body && req.body.rol;
    if (!['profesor', 'admin'].includes(rol)) {
        return res.status(400).json({ error: 'El rol debe ser profesor o admin' });
    }
    return registrar(req, res, rol);
}

async function actualizarUsuario(req, res) {
    const { rol } = req.body || {};
    let { nombre, correo } = req.body || {};

    if (nombre === undefined && correo === undefined && rol === undefined) {
        return res.status(400).json({ error: 'Envía al menos uno de: nombre, correo, rol' });
    }

    if (nombre !== undefined) nombre = limpiarTexto(nombre);
    if (correo !== undefined) correo = String(correo).trim().toLowerCase();

    const errorValidacion =
        (nombre !== undefined && errorNombre(nombre)) ||
        (correo !== undefined && errorCorreo(correo)) ||
        (rol !== undefined && !ROLES_VALIDOS.includes(rol) && 'El rol debe ser alumno, profesor o admin');
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    try {
        if (correo !== undefined) {
            const existente = await usuariosModel.buscarPorCorreoConHash(correo);
            if (existente && String(existente.id) !== String(req.params.id)) {
                return res.status(409).json({ error: 'Ese correo ya está registrado' });
            }
        }

        const usuario = await usuariosModel.actualizar(req.params.id, { nombre, correo, rol });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (error) {
        if (esDuplicado(error)) return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
        res.status(500).json({ error: error.message });
    }
}

async function eliminarUsuario(req, res) {
    try {
        const eliminado = await usuariosModel.eliminar(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    listarUsuarios,
    listarProfesores,
    obtenerUsuario,
    crearUsuario,
    crearUsuarioStaff,
    actualizarUsuario,
    eliminarUsuario,
};
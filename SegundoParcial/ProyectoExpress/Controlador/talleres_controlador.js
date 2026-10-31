const talleresModel = require('../Modelo/talleres_modelo');
const { verificarCredenciales } = require('../credenciales');
const { errorNombre, errorNombreTaller } = require('../validaciones');

function esDuplicado(error) {
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}

function esLlaveInvalida(error) {
    return error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === '23503';
}

function limpiarTexto(texto) {
    return String(texto).trim().replace(/\s+/g, ' ');
}

function esFechaValida(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const d = new Date(`${fecha}T00:00:00Z`);
    if (isNaN(d) || d.toISOString().slice(0, 10) !== fecha) return false;

    const hoy = new Date().toISOString().slice(0, 10);
    if (fecha < hoy) return false; 

    return true;
}

async function listarTalleres(req, res) {
    try {
        const talleres = await talleresModel.listar();
        res.json(talleres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function obtenerTaller(req, res) {
    try {
        const taller = await talleresModel.obtenerPorId(req.params.id);
        if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });
        res.json(taller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function crearTaller(req, res) {
    const body = req.body || {};

    try {
        if (body.boleta !== '0000000000') {
            return res.status(403).json({ error: 'Solo el administrador (boleta 0000000000) puede crear talleres' });
        }

        if (!body.nombre || !String(body.nombre).trim() || !body.fecha || !body.instructor) {
            return res.status(400).json({ error: 'nombre, fecha e instructor son obligatorios' });
        }

        const nombre = limpiarTexto(body.nombre);
        const instructor = limpiarTexto(body.instructor);
        const fecha = String(body.fecha).trim();
        const cupo = body.cupo === undefined || body.cupo === null || body.cupo === '' ? 30 : Number(body.cupo);

        const errorValidacion = errorNombreTaller(nombre) || errorNombre(instructor, 'El nombre del instructor');
        if (errorValidacion) return res.status(400).json({ error: errorValidacion });

        if (!esFechaValida(fecha)) {
            return res.status(400).json({ error: 'La fecha debe tener el formato AAAA-MM-DD y ser una fecha válida' });
        }
        if (!Number.isInteger(cupo) || cupo < 1 || cupo > 500) {
            return res.status(400).json({ error: 'El cupo debe ser un número entero entre 1 y 500' });
        }

        if (await talleresModel.buscarPorNombreYFecha(nombre, fecha)) {
            return res.status(409).json({ error: 'Ya existe un taller con ese nombre en esa fecha' });
        }

        const taller = await talleresModel.crear({ nombre, instructor, fecha, cupo });
        res.status(201).json(taller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function registrarAlumno(req, res) {
    const { usuarioId } = req.body || {};

    if (!usuarioId) {
        return res.status(400).json({ error: 'El campo usuarioId es obligatorio' });
    }

    try {
        const taller = await talleresModel.obtenerPorId(req.params.id);
        if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });

        const inscripcion = await talleresModel.registrarAlumno(req.params.id, usuarioId);
        res.status(201).json(inscripcion);
    } catch (error) {
        if (esDuplicado(error)) return res.status(409).json({ error: 'El alumno ya está registrado en ese taller' });
        if (esLlaveInvalida(error)) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(500).json({ error: error.message });
    }
}

module.exports = { listarTalleres, obtenerTaller, crearTaller, registrarAlumno };
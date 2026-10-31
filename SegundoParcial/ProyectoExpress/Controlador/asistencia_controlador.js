const bcrypt = require('bcryptjs');
const asistenciaModel = require('../Modelo/asistencia_modelo');
const talleresModel = require('../Modelo/talleres_modelo');
const usuariosModel = require('../Modelo/usuarios_modelo');
const { validarInscripcion } = require('../validaciones');

function esDuplicado(error) {
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}

function esLlaveInvalida(error) {
    return error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === '23503';
}

function normalizar(texto) {
    return String(texto).trim().replace(/\s+/g, ' ').toLowerCase();
}

async function inscribir(req, res) {
    const { taller_id, nombre_alumno, boleta } = req.body || {};

    if (!taller_id || !nombre_alumno || !boleta) {
        return res.status(400).json({ error: 'taller_id, nombre_alumno y boleta son obligatorios' });
    }

    const nombre = String(nombre_alumno).trim().replace(/\s+/g, ' ');
    const boletaLimpia = String(boleta).trim();

    const errorValidacion = validarInscripcion(nombre, boletaLimpia);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    try {
        const taller = await talleresModel.obtenerPorId(taller_id);
        if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });

        const hoy = new Date().toISOString().slice(0, 10);
        const fechaTaller = String(taller.fecha).slice(0, 10);
        if (fechaTaller < hoy) {
            return res.status(400).json({ error: 'No te puedes inscribir a un taller que ya pasó' });
        }

        const usuario = await usuariosModel.buscarPorBoleta(boletaLimpia);
        let nombreFinal = nombre;

        if (usuario) {
            nombreFinal = usuario.nombre;
        } else {
            const previa = await asistenciaModel.buscarPorBoleta(boletaLimpia);
            if (previa && normalizar(previa.nombre_alumno) !== normalizar(nombre)) {
                return res.status(400).json({ error: 'Esa boleta ya está registrada con otro nombre en el sistema' });
            }
        }

        if (await asistenciaModel.buscar(taller_id, boletaLimpia)) {
            return res.status(409).json({ error: 'Esa boleta ya está inscrita en este taller' });
        }
        if (Number(taller.asistentes) >= Number(taller.cupo)) {
            return res.status(409).json({ error: 'El taller ya no tiene cupo' });
        }

        const inscripcion = await asistenciaModel.inscribir({
            tallerId: taller_id,
            nombreAlumno: nombreFinal,
            boleta: boletaLimpia,
        });
        res.status(201).json(inscripcion);
    } catch (error) {
        if (esDuplicado(error)) return res.status(409).json({ error: 'Esa boleta ya está inscrita en este taller' });
        if (esLlaveInvalida(error)) return res.status(404).json({ error: 'Taller no encontrado' });
        res.status(500).json({ error: error.message });
    }
}

async function marcarAsistencia(req, res) {
    const { asistio } = req.body || {};

    if (typeof asistio !== 'boolean') {
        return res.status(400).json({ error: 'asistio debe ser true o false' });
    }

    try {
        const registro = await asistenciaModel.obtenerPorId(req.params.id);
        if (!registro) return res.status(404).json({ error: 'Inscripción no encontrada' });

        const actualizado = await asistenciaModel.marcarAsistencia(req.params.id, asistio);
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function consultarAsistenciaTaller(req, res) {
    try {
        const taller = await talleresModel.obtenerPorId(req.params.id);
        if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });

        const asistencias = await asistenciaModel.consultarPorTaller(req.params.id);
        res.json(asistencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { inscribir, marcarAsistencia, consultarAsistenciaTaller };
const asistenciaModel = require('../Modelo/asistencia_modelo');
const talleresModel = require('../Modelo/talleres_modelo');
const { validarInscripcion } = require('../validaciones');

async function registrarAsistencia(req, res) {
    const { taller_id, nombre_alumno, boleta } = req.body || {};

    if (!taller_id || !nombre_alumno || !boleta) {
        return res.status(400).json({ error: 'taller_id, nombre_alumno y boleta son obligatorios' });
    }

    const errorValidacion = validarInscripcion(String(nombre_alumno), String(boleta));
    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    try {
        const asistencia = await asistenciaModel.registrarAsistencia({
            tallerId: taller_id,
            nombreAlumno: nombre_alumno,
            boleta: String(boleta),
        });
        res.status(201).json(asistencia);
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

module.exports = { registrarAsistencia, consultarAsistenciaTaller };
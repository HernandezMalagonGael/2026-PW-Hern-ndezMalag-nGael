const talleresModel = require('../Modelo/talleres_modelo');
 
function esDuplicado(error) {
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}
 
function esLlaveInvalida(error) {
    return error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === '23503';
}
 
async function listarTalleres(req, res) {
    try {
        const talleres = await talleresModel.listar();
        res.json(talleres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
 
async function registrarAlumno(req, res) {
    const { usuarioId } = req.body;
 
    if (!usuarioId) {
        return res.status(400).json({ error: 'El campo usuarioId es obligatorio' });
    }
 
    try {
        const taller = await talleresModel.obtenerPorId(req.params.id);
        if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });
 
        const inscripcion = await talleresModel.registrarAlumno(req.params.id, usuarioId);
        res.status(201).json(inscripcion);
    } catch (error) {
        if (esDuplicado(error)) return res.status(409).json({ error: 'El alumno ya esta registrado en ese taller' });
        if (esLlaveInvalida(error)) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(500).json({ error: error.message });
    }
}
 
module.exports = { listarTalleres, registrarAlumno };
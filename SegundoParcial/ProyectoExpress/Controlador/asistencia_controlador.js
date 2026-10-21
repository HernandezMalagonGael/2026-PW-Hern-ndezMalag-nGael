const asistenciaModel = require('../Modelo/asistencia_modelo');
const talleresModel = require('../Modelo/talleres_modelo');
 
function esDuplicado(error) {
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}
 
function esLlaveInvalida(error) {
    return error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === '23503';
}
 
async function registrarAsistencia(req, res) {
    const { tallerId, usuarioId, fecha, presente } = req.body;
 
    if (!tallerId || !usuarioId) {
        return res.status(400).json({ error: 'Los campos tallerId y usuarioId son obligatorios' });
    }
    if (fecha !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({ error: 'La fecha debe tener el formato AAAA-MM-DD' });
    }
 
    try {
        const taller = await talleresModel.obtenerPorId(tallerId);
        if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });
 
        const asistencia = await asistenciaModel.registrarAsistencia({ tallerId, usuarioId, fecha, presente });
        res.status(201).json(asistencia);
    } catch (error) {
        if (esDuplicado(error)) return res.status(409).json({ error: 'La asistencia de ese alumno ya fue registrada en esa fecha' });
        if (esLlaveInvalida(error)) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(500).json({ error: error.message });
    }
}
 
async function consultarAsistenciaTaller(req, res) {
    try {
        const taller = await talleresModel.obtenerPorId(req.params.tallerId);
        if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });
 
        const asistencias = await asistenciaModel.consultarPorTaller(req.params.tallerId);
        res.json(asistencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
 
module.exports = { registrarAsistencia, consultarAsistenciaTaller };
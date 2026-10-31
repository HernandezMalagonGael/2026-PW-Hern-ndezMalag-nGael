const express = require('express');
const asistenciaControlador = require('../Controlador/asistencia_controlador');

const router = express.Router();

router.post('/', asistenciaControlador.inscribir);
router.put('/:id', asistenciaControlador.marcarAsistencia);

module.exports = router;
const express = require('express');
const asistenciaControlador = require('../Controlador/asistencia_controlador');

const router = express.Router();

router.post('/', asistenciaControlador.registrarAsistencia);

module.exports = router;
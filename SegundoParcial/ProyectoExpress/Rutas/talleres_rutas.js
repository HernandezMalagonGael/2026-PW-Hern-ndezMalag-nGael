const express = require('express');
const talleresControlador = require('../Controlador/talleres_controlador');
const asistenciaControlador = require('../Controlador/asistencia_controlador');

const router = express.Router();

router.get('/', talleresControlador.listarTalleres);
router.post('/', talleresControlador.crearTaller);
router.get('/:id', talleresControlador.obtenerTaller);
router.get('/:id/asistencias', asistenciaControlador.consultarAsistenciaTaller);
router.post('/:id/alumnos', talleresControlador.registrarAlumno);

module.exports = router;
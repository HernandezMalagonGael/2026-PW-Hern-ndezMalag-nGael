const express = require('express');
const usuarioControlador = require('../Controlador/usuario_controlador');

const router = express.Router();

router.get('/', usuarioControlador.listarUsuarios);
router.post('/', usuarioControlador.crearUsuario);
router.get('/:id', usuarioControlador.obtenerUsuario);
router.put('/:id', usuarioControlador.actualizarUsuario);
router.delete('/:id', usuarioControlador.eliminarUsuario);

module.exports = router;
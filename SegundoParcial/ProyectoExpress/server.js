const express = require('express');

const talleresRutas = require('./Rutas/talleres_rutas');
const asistenciaRutas = require('./Rutas/asistencia_rutas');
const usuarioRutas = require('./Rutas/usuario_rutas');

const app = express();

app.use(express.json());

const PORT = 4000;

// Prueba de vida
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Registro de Asistencia - CECyT 9 funcionando correctamente' });
});

// Ejemplos de la clase
app.get('/saludo', (req, res) => {
    res.json({ mensaje: 'Hola esto es una prueba en GET' });
});

app.post('/eco', (req, res) => {
    const { texto } = req.body || {};
    if (!texto) {
        return res.status(400).json({ error: 'El texto es obligatorio' });
    }
    res.status(201).json({ eco: texto });
});

// Rutas de la API
app.use('/api/talleres', talleresRutas);
app.use('/api/asistencias', asistenciaRutas);
app.use('/api/usuarios', usuarioRutas);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto: ${PORT}`);
});
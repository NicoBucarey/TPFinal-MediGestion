const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const TeleconsultaController = require('../controllers/teleconsultaController');

// Crear nueva teleconsulta (secretarios y pacientes)
router.post('/', checkRole(['secretario', 'paciente']), TeleconsultaController.crearTeleconsulta);

// Obtener teleconsultas (profesionales y pacientes pueden ver las suyas)
router.get('/', checkRole(['secretario', 'profesional', 'paciente']), TeleconsultaController.obtenerTeleconsultas);

module.exports = router;
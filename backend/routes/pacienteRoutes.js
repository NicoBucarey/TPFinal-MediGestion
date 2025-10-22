const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/pacienteController');
const { checkRole } = require('../middleware/auth');

// Ruta para buscar pacientes (solo accesible para secretarios y profesionales)
router.get('/buscar', checkRole(['secretario', 'profesional']), PacienteController.buscarPacientes);

module.exports = router;
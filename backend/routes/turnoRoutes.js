const express = require('express');
const router = express.Router();
const TurnoController = require('../controllers/turnoController');
const { checkRole } = require('../middleware/auth');

// Obtener horarios disponibles de un profesional
router.get('/profesionales/:id/horarios', checkRole(['secretario', 'paciente']), TurnoController.obtenerHorariosProfesional);

// Obtener turnos de un profesional
router.get('/profesional/:id', checkRole(['secretario', 'profesional']), TurnoController.obtenerTurnosProfesional);

// Crear un nuevo turno
router.post('/', checkRole(['Secretario', 'Paciente']), TurnoController.crearTurno);

module.exports = router;
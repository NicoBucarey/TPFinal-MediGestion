const express = require('express');
const router = express.Router();
const TurnoController = require('../controllers/turnoController');
const { checkRole } = require('../middleware/auth');

// Obtener horarios disponibles de un profesional
router.get('/profesionales/:id/horarios', checkRole(['secretario', 'paciente']), TurnoController.obtenerHorariosProfesional);

// Obtener turnos de un profesional (necesario para ver turnos ocupados)
router.get('/profesional/:id', checkRole(['secretario', 'profesional', 'paciente']), TurnoController.obtenerTurnosProfesional);

// Obtener turnos de un paciente
router.get('/paciente/:id', checkRole(['paciente', 'secretario']), TurnoController.obtenerTurnosPaciente);

// Crear un nuevo turno
router.post('/', checkRole(['secretario', 'paciente']), TurnoController.crearTurno);

// Cancelar turno
router.patch('/:id/cancelar', checkRole(['secretario', 'paciente', 'profesional']), TurnoController.cancelarTurno);

module.exports = router;
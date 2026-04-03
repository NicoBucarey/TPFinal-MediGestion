const express = require('express');
const router = express.Router();
const TurnoPeriodicoController = require('../controllers/turnoPeriodicoController');
const { checkRole } = require('../middleware/auth');

// Rutas para turnos periódicos
// Todas las rutas usan authMiddleware para asegurar la autenticación

// Crear un nuevo turno periódico
router.post('/', checkRole(['secretario', 'paciente']), TurnoPeriodicoController.crearTurnoPeriodico);

// Obtener turnos periódicos de un profesional
router.get('/profesional/:id', checkRole(['secretario', 'profesional']), TurnoPeriodicoController.obtenerTurnosPeriodicosProfesional);

// Obtener turnos periódicos de un paciente
router.get('/paciente/:id', checkRole(['secretario', 'profesional', 'paciente']), TurnoPeriodicoController.obtenerTurnosPeriodicosPaciente);

// Cancelar un turno periódico (con opción de cancelar solo futuros mediante query param ?cancelarSoloFuturos=true)
router.delete('/:id', checkRole(['secretario', 'paciente']), TurnoPeriodicoController.cancelarTurnoPeriodico);

module.exports = router;
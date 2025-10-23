const express = require('express');
const router = express.Router();
const TurnoPeriodicoController = require('../controllers/turnoPeriodicoController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Rutas para turnos periódicos
// Todas las rutas usan authMiddleware para asegurar la autenticación

// Crear un nuevo turno periódico
router.post('/', authMiddleware, checkRole(['secretario']), TurnoPeriodicoController.crearTurnoPeriodico);

// Obtener turnos periódicos de un profesional
router.get('/profesional/:id', authMiddleware, checkRole(['secretario', 'profesional']), TurnoPeriodicoController.obtenerTurnosPeriodicosProfesional);

// Obtener turnos periódicos de un paciente
router.get('/paciente/:id', authMiddleware, checkRole(['secretario', 'profesional', 'paciente']), TurnoPeriodicoController.obtenerTurnosPeriodicosPaciente);

// Cancelar un turno periódico (con opción de cancelar solo futuros mediante query param ?cancelarSoloFuturos=true)
router.put('/cancelar/:id', authMiddleware, checkRole(['secretario']), TurnoPeriodicoController.cancelarTurnoPeriodico);

module.exports = router;
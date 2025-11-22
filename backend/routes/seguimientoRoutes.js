const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const SeguimientoController = require('../controllers/seguimientoController');

// Crear seguimiento (profesional)
router.post('/', checkRole(['profesional']), SeguimientoController.crearSeguimiento);

// Listar seguimientos del profesional
router.get('/profesional/:id', checkRole(['profesional']), SeguimientoController.obtenerSeguimientosProfesional);
// Estadísticas del profesional
router.get('/profesional/:id/estadisticas', checkRole(['profesional']), SeguimientoController.obtenerEstadisticasProfesional);

// Listar seguimientos del paciente
router.get('/paciente/:id', checkRole(['paciente']), SeguimientoController.obtenerSeguimientosPaciente);

// Detalle de seguimiento
router.get('/:id', checkRole(['profesional', 'paciente']), SeguimientoController.obtenerSeguimientoDetalle);

// Obtener preguntas personalizadas de un seguimiento
router.get('/:id/preguntas', checkRole(['profesional', 'paciente']), SeguimientoController.obtenerPreguntasSeguimiento);

// Actualizar estado del seguimiento
router.patch('/:id/estado', checkRole(['profesional', 'paciente']), SeguimientoController.actualizarEstado);

// Ver seguimientos de un turno
router.get('/turno/:turnoId', checkRole(['profesional']), SeguimientoController.obtenerSeguimientosTurno);

module.exports = router;

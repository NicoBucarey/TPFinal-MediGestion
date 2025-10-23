const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const DisponibilidadController = require('../controllers/disponibilidadController');

// Obtener horarios del profesional (accesible para secretarios y pacientes)
router.get('/horarios/:id', checkRole(['secretario', 'profesional', 'paciente']), DisponibilidadController.obtenerHorariosProfesional);

// Obtener configuración de disponibilidad
router.get('/:id_profesional', checkRole(['profesional']), DisponibilidadController.obtenerConfiguracion);

// Guardar configuración de disponibilidad
router.post('/:id_profesional', checkRole(['profesional']), DisponibilidadController.guardarConfiguracion);

// Obtener excepciones de disponibilidad
router.get('/:id_profesional/excepciones', checkRole(['profesional']), DisponibilidadController.obtenerExcepciones);

// Agregar excepción de disponibilidad
router.post('/:id_profesional/excepciones', checkRole(['profesional']), DisponibilidadController.agregarExcepcion);

// Eliminar excepción de disponibilidad
router.delete('/:id_profesional/excepciones/:id_excepcion', checkRole(['profesional']), DisponibilidadController.eliminarExcepcion);

module.exports = router;
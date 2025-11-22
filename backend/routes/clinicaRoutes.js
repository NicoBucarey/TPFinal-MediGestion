const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const ClinicaController = require('../controllers/clinicaController');

// Crear nota clínica (profesional)
router.post('/nota', checkRole(['profesional']), upload.array('archivos'), ClinicaController.crearNotaClinica);

// Detalle de turno (profesional y paciente involucrados)
router.get('/turno/:id', checkRole(['profesional', 'paciente', 'secretario', 'admin']), ClinicaController.obtenerTurnoDetalle);

// Información del paciente (profesional)
router.get('/pacientes/:id', checkRole(['profesional']), ClinicaController.obtenerPacienteInfo);

// Historial clínico del paciente
router.get('/paciente/:id/historial', checkRole(['profesional', 'paciente']), ClinicaController.obtenerHistorialPaciente);

// Listado de documentos (profesional)
router.get('/documentos', checkRole(['profesional']), ClinicaController.listarDocumentos);

// Obtener documentos compartidos (paciente)
router.get('/documentos/compartidos', checkRole(['paciente']), ClinicaController.obtenerDocumentosCompartidos);

// Compartir/privatizar documento (profesional)
router.patch('/documentos/:id/compartir', checkRole(['profesional']), ClinicaController.toggleCompartirDocumento);

// Obtener pacientes de un profesional
router.get('/profesional/:id/pacientes', checkRole(['profesional']), ClinicaController.obtenerPacientesProfesional);

module.exports = router;

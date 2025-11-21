const express = require('express');
const cors = require('cors');
const authController = require('./controllers/authController');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const pacienteRoutes = require('./routes/pacienteRoutes');
const turnoRoutes = require('./routes/turnoRoutes');
const turnoPeriodicoRoutes = require('./routes/turnoPeriodicoRoutes');
const teleconsultaRoutes = require('./routes/teleconsultaRoutes');
const secretarioRoutes = require('./routes/secretarioRoutes');
const profesionalRoutes = require('./routes/profesionalRoutes');
const disponibilidadRoutes = require('./routes/disponibilidadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sucursalRoutes = require('./routes/sucursalRoutes');
const sucursalController = require('./controllers/sucursalController');
const clinicaRoutes = require('./routes/clinicaRoutes');
const seguimientoRoutes = require('./routes/seguimientoRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const respuestaSeguimientoRoutes = require('./routes/respuestaSeguimientoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const path = require('path');
const { inicializarCronJobs } = require('./jobs/cronJobs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Servir archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas públicas
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.registerPatient);

// Ruta de verificación de token
app.get('/api/auth/verify', authMiddleware, authController.verify);

// Rutas protegidas
app.post('/api/users/staff', [authMiddleware, adminMiddleware], authController.createStaffUser);
app.use('/api/pacientes', authMiddleware, pacienteRoutes);
app.use('/api/turnos', authMiddleware, turnoRoutes);
app.use('/api/turnos-periodicos', authMiddleware, turnoPeriodicoRoutes);
app.use('/api/teleconsultas', authMiddleware, teleconsultaRoutes);
app.use('/api/secretario', authMiddleware, secretarioRoutes);
app.use('/api/profesionales', authMiddleware, profesionalRoutes);
app.use('/api/disponibilidad', authMiddleware, disponibilidadRoutes);
// Ruta pública para obtener sucursales activas (registro de pacientes)
app.get('/api/sucursales/activas', sucursalController.listarSucursalesActivas);

app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/sucursales', authMiddleware, adminMiddleware, sucursalRoutes);
app.use('/api/clinica', authMiddleware, clinicaRoutes);
app.use('/api/seguimiento', authMiddleware, seguimientoRoutes);
app.use('/api/notificaciones', authMiddleware, notificacionRoutes);
app.use('/api', authMiddleware, respuestaSeguimientoRoutes);
app.use('/api/perfil', authMiddleware, perfilRoutes);

// Crear usuario administrador inicial
authController.createInitialAdmin();

// Inicializar cron jobs para recordatorios
inicializarCronJobs();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

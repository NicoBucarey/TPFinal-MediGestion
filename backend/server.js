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
const fs = require('fs');
const { inicializarCronJobs } = require('./jobs/cronJobs');
const WhatsAppService = require('./services/whatsappService');
const STARTED_AT = new Date().toISOString();
const LOCK_FILE = path.join(__dirname, '.backend.lock.json');

const isProcessRunning = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const cleanupLockFile = () => {
  try {
    if (!fs.existsSync(LOCK_FILE)) return;
    const raw = fs.readFileSync(LOCK_FILE, 'utf8');
    const lock = JSON.parse(raw);
    if (lock.pid === process.pid) {
      fs.rmSync(LOCK_FILE, { force: true });
    }
  } catch {
    // noop
  }
};

const ensureSingleInstance = (port) => {
  try {
    if (!fs.existsSync(LOCK_FILE)) return true;
    const raw = fs.readFileSync(LOCK_FILE, 'utf8');
    const lock = JSON.parse(raw);

    if (lock.pid && isProcessRunning(lock.pid)) {
      console.error(`❌ Backend ya está ejecutándose (PID ${lock.pid}) en puerto ${lock.port || port}`);
      console.error('ℹ️ Usá la instancia ya activa en lugar de abrir otra terminal con npm run dev.');
      return false;
    }

    fs.rmSync(LOCK_FILE, { force: true });
    return true;
  } catch {
    return true;
  }
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Servir archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas públicas
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.registerPatient);

// Rutas públicas para seguimientos (sin autenticación)
const SeguimientoController = require('./controllers/seguimientoController');
app.get('/api/seguimiento/publico/:id', SeguimientoController.obtenerSeguimientoPublico);
app.post('/api/seguimiento/:id/respuesta', SeguimientoController.guardarRespuestaPublica);

// Ruta de verificación de token
app.get('/api/auth/verify', authMiddleware, authController.verify);

// Health check público para diagnóstico operativo
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    pid: process.pid,
    port: Number(process.env.PORT || 3000),
    startedAt: STARTED_AT,
    uptimeSec: Math.floor(process.uptime()),
    whatsapp: WhatsAppService.obtenerDiagnostico()
  });
});

// Endpoint de mantenimiento para resetear sesión WhatsApp en entorno local/dev.
app.post('/api/health/whatsapp/reset', async (req, res) => {
  const result = await WhatsAppService.resetearSesion();
  if (!result.success) {
    return res.status(500).json(result);
  }
  return res.status(200).json({ success: true, message: 'Sesión WhatsApp reiniciada. Escaneá nuevo QR.' });
});

// Endpoint de prueba: POST /api/health/whatsapp/test { to: "5492994573646", texto: "opcional" }
app.post('/api/health/whatsapp/test', async (req, res) => {
  const to = req.body?.to || '5492994573646';
  const texto = req.body?.texto || '✅ Mensaje de prueba desde MediGestión — si lo recibís, WhatsApp está funcionando correctamente.';
  const result = await WhatsAppService.enviarMensaje(to, texto);
  return res.status(result.success ? 200 : 500).json(result);
});

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
if (!ensureSingleInstance(PORT)) {
  process.exit(0);
}

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);

  try {
    fs.writeFileSync(LOCK_FILE, JSON.stringify({
      pid: process.pid,
      port: Number(PORT),
      startedAt: STARTED_AT
    }));
  } catch (error) {
    console.warn('⚠️ No se pudo escribir lock de backend:', error.message);
  }

  WhatsAppService.iniciar();

  if (WhatsAppService.estaConectado()) {
    console.log('✅ WhatsApp ya está conectado al iniciar el backend');
  } else {
    console.log('📱 WhatsApp inicializándose... esperá QR/conexión en esta terminal');
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} en uso: ya hay otra instancia del backend ejecutándose.`);
    console.error('ℹ️ Cerrá la instancia anterior o usá otro puerto (PORT=3002) para esta terminal.');
    process.exit(0);
  }

  console.error('❌ Error al iniciar el servidor:', error.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  cleanupLockFile();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanupLockFile();
  process.exit(0);
});

process.on('exit', cleanupLockFile);

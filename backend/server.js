const express = require('express');
const cors = require('cors');
const authController = require('./controllers/authController');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const pacienteRoutes = require('./routes/pacienteRoutes');
const turnoRoutes = require('./routes/turnoRoutes');
const turnoPeriodicoRoutes = require('./routes/turnoPeriodicoRoutes');
const profesionalRoutes = require('./routes/profesionalRoutes');
const disponibilidadRoutes = require('./routes/disponibilidadRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
app.use('/api/profesionales', authMiddleware, profesionalRoutes);
app.use('/api/disponibilidad', authMiddleware, disponibilidadRoutes);

// Crear usuario administrador inicial
authController.createInitialAdmin();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
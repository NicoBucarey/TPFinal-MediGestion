import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'sonner';

// Layouts y utilidades: siempre presentes, no se lazyifican
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingPage from './components/LoadingPage';
import ErrorBoundary from './components/ErrorBoundary';
import useAuth from './hooks/useAuth';

// ---------------------------------------------------------------------------
// Páginas cargadas de forma lazy: cada una se descarga solo cuando se visita
// ---------------------------------------------------------------------------

// Públicas
const Home                         = lazy(() => import('./pages/Home'));
const Ubicaciones                  = lazy(() => import('./pages/Ubicaciones'));
const Login                        = lazy(() => import('./pages/auth/Login'));
const Register                     = lazy(() => import('./pages/auth/Register'));
const SeguimientoPublico           = lazy(() => import('./features/seguimientos/pages/SeguimientoPublicoPage'));

// Compartidas
const Dashboard                    = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const Perfil                       = lazy(() => import('./features/perfil/pages/PerfilPage'));

// Admin
const Reportes                     = lazy(() => import('./features/admin/pages/ReportesPage'));
const GestionSucursales            = lazy(() => import('./features/admin/pages/GestionSucursalesPage'));
const GestionUsuarios              = lazy(() => import('./features/usuarios/pages/GestionUsuariosPage'));

// Secretario
const RecepcionPage                = lazy(() => import('./features/recepcion/pages/RecepcionPage'));
const NuevoTurno                   = lazy(() => import('./features/turnos/pages/NuevoTurnoPage'));
const NuevoTurnoPeriodico          = lazy(() => import('./features/turnos/pages/NuevoTurnoPeriodicoPage'));
const NuevaTeleconsulta            = lazy(() => import('./features/teleconsultas/pages/NuevaTeleconsultaPage'));

// Profesional
const GestionDisponibilidad        = lazy(() => import('./features/disponibilidad/pages/GestionDisponibilidadPage'));
const MisTurnos                    = lazy(() => import('./features/clinica/pages/MisTurnosProfesionalPage'));
const NotaClinica                  = lazy(() => import('./features/clinica/pages/NotaClinicaPage'));
const HistorialPaciente            = lazy(() => import('./features/clinica/pages/HistorialPacientePage'));
const DocumentosCompartidos        = lazy(() => import('./features/documentos/pages/DocumentosCompartidosPage'));
const HistoriasClinicas            = lazy(() => import('./features/clinica/pages/HistoriasClinicasPage'));
const Seguimientos                 = lazy(() => import('./features/seguimientos/pages/SeguimientosProfesionalPage'));
const ProgramarSeguimiento         = lazy(() => import('./features/seguimientos/pages/ProgramarSeguimientoPage'));
const SeleccionarPacienteSeguimiento = lazy(() => import('./features/seguimientos/pages/SeleccionarPacienteSeguimientoPage'));

// Paciente
const BuscarProfesional            = lazy(() => import('./features/turnos/pages/BuscarProfesionalPage'));
const AgendaProfesional            = lazy(() => import('./features/turnos/pages/AgendaProfesionalPage'));
const SolicitarTurnoPeriodico      = lazy(() => import('./features/turnos/pages/SolicitarTurnoPeriodicoPage'));
const MisTurnosPaciente            = lazy(() => import('./features/turnos/pages/MisTurnosPacientePage'));
const MisSeguimientos              = lazy(() => import('./features/seguimientos/pages/MisSeguimientosPage'));

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);
  
  // Títulos por ruta
  const TitleManager = () => {
    const location = useLocation();
    useEffect(() => {
      const path = location.pathname;
      const map = [
        // Públicas
        { re: /^\/$/, title: 'Inicio' },
        { re: /^\/ubicaciones$/, title: 'Ubicaciones' },
        { re: /^\/terminos-privacidad$/, title: 'Términos y Privacidad' },
        { re: /^\/login$/, title: 'Iniciar sesión' },
        { re: /^\/register$/, title: 'Crear cuenta' },
        { re: /^\/dashboard\/?$/, title: 'Dashboard' },

        // Admin
        { re: /^\/dashboard\/admin$/, title: 'Dashboard' },
        { re: /^\/dashboard\/admin\/users$/, title: 'Usuarios' },
        { re: /^\/dashboard\/admin\/reports$/, title: 'Reportes' },
        { re: /^\/dashboard\/admin\/sucursales$/, title: 'Sucursales' },

        // Secretaría / Turnos
        { re: /^\/dashboard\/secretario$/, title: 'Dashboard' },
        { re: /^\/dashboard\/turnos\/nuevo$/, title: 'Turno simple' },
        { re: /^\/dashboard\/turnos\/periodico\/nuevo$/, title: 'Turno periódico' },

        // Profesional
        { re: /^\/dashboard\/profesional$/, title: 'Dashboard' },
        { re: /^\/dashboard\/disponibilidad$/, title: 'Disponibilidad' },
        { re: /^\/dashboard\/profesional\/turnos$/, title: 'Mis turnos' },
        { re: /^\/dashboard\/profesional\/nota\/.+$/, title: 'Nota clínica' },
        { re: /^\/dashboard\/profesional\/paciente\/.+\/historial$/, title: 'Historial del paciente' },
        { re: /^\/dashboard\/profesional\/documentos$/, title: 'Documentos' },
        { re: /^\/dashboard\/profesional\/historias$/, title: 'Historias clínicas' },
        { re: /^\/dashboard\/profesional\/seguimientos$/, title: 'Seguimientos' },
        { re: /^\/dashboard\/profesional\/seguimiento\/.+$/, title: 'Seguimiento' },
        { re: /^\/dashboard\/profesional\/turno\/.+\/seguimiento$/, title: 'Programar seguimiento' },

        // Paciente
        { re: /^\/dashboard\/paciente$/, title: 'Dashboard' },
        { re: /^\/dashboard\/paciente\/turnos$/, title: 'Mis turnos' },
        { re: /^\/dashboard\/paciente\/buscar-profesional$/, title: 'Buscar profesional' },
        { re: /^\/dashboard\/paciente\/agenda\/.+$/, title: 'Agenda' },
        { re: /^\/dashboard\/paciente\/turno-periodico\/.+$/, title: 'Turno periódico' },
        { re: /^\/dashboard\/paciente\/seguimientos$/, title: 'Mis seguimientos' },

        // Perfil
        { re: /^\/dashboard\/perfil$/, title: 'Mi perfil' },
      ];

      const match = map.find(m => m.re.test(path));
      document.title = match ? match.title : 'MediGestión';
    }, [location.pathname]);
    return null;
  };
  return (
    <BrowserRouter>
      <TitleManager />
      <Toaster richColors closeButton position="top-right" />
      <ErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/ubicaciones" element={<Ubicaciones />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Ruta pública para seguimientos (sin autenticación) */}
        <Route path="/seguimiento/:id" element={<SeguimientoPublico />} />

        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard principal */}
          <Route index element={<Dashboard />} />

          {/* Redirecciones de dashboards antiguos por rol */}
          <Route path="admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="profesional" element={<Navigate to="/dashboard" replace />} />
          <Route path="secretario" element={<Navigate to="/dashboard" replace />} />
          <Route path="paciente" element={<Navigate to="/dashboard" replace />} />

          {/* Rutas de Admin */}
          <Route path="admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GestionUsuarios />
            </ProtectedRoute>
          } />

          <Route path="admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reportes />
            </ProtectedRoute>
          } />
          <Route path="admin/sucursales" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GestionSucursales />
            </ProtectedRoute>
          } />

          {/* Rutas de Secretario */}
          <Route path="recepcion" element={
            <ProtectedRoute allowedRoles={['secretario']}>
              <RecepcionPage />
            </ProtectedRoute>
          } />

          {/* Ruta de Perfil */}
          <Route path="perfil" element={
            <ProtectedRoute allowedRoles={['profesional', 'secretario', 'paciente']}>
              <Perfil />
            </ProtectedRoute>
          } />

          {/* Rutas por funcionalidad */}
          <Route path="usuarios/gestion" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GestionUsuarios />
            </ProtectedRoute>
          } />

          {/* Rutas de turnos */}
          <Route path="turnos/nuevo" element={
            <ProtectedRoute allowedRoles={['secretario', 'paciente']}>
              <NuevoTurno />
            </ProtectedRoute>
          } />
          
          <Route path="turnos/periodico/nuevo" element={
            <ProtectedRoute allowedRoles={['secretario', 'paciente']}>
              <NuevoTurnoPeriodico />
            </ProtectedRoute>
          } />

          <Route path="teleconsultas/nueva" element={
            <ProtectedRoute allowedRoles={['secretario', 'paciente']}>
              <NuevaTeleconsulta />
            </ProtectedRoute>
          } />

          <Route path="paciente/nuevo-turno-periodico" element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <NuevoTurnoPeriodico />
            </ProtectedRoute>
          } />

          {/* Rutas de disponibilidad */}
          <Route path="disponibilidad" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <GestionDisponibilidad />
            </ProtectedRoute>
          } />

          {/* Rutas clínica profesional */}
          <Route path="profesional/turnos" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <MisTurnos />
            </ProtectedRoute>
          } />
          <Route path="profesional/nota/:turnoId" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <NotaClinica />
            </ProtectedRoute>
          } />
          <Route path="profesional/paciente/:pacienteId/historial" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <HistorialPaciente />
            </ProtectedRoute>
          } />
          <Route path="profesional/documentos" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <DocumentosCompartidos />
            </ProtectedRoute>
          } />
          <Route path="profesional/historias" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <HistoriasClinicas />
            </ProtectedRoute>
          } />
          <Route path="profesional/seguimientos" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <Seguimientos />
            </ProtectedRoute>
          } />
          <Route path="profesional/seguimiento/:id" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <HistorialPaciente />
            </ProtectedRoute>
          } />
          <Route path="profesional/turno/:turnoId/seguimiento" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <ProgramarSeguimiento />
            </ProtectedRoute>
          } />
          <Route path="profesional/seguimiento/seleccionar-paciente" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <SeleccionarPacienteSeguimiento />
            </ProtectedRoute>
          } />
          <Route path="profesional/seguimiento/nuevo" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <ProgramarSeguimiento />
            </ProtectedRoute>
          } />

          {/* Rutas de paciente */}
          <Route path="paciente/turnos" element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <MisTurnosPaciente />
            </ProtectedRoute>
          } />
          <Route path="paciente/buscar-profesional" element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <BuscarProfesional />
            </ProtectedRoute>
          } />
          <Route path="paciente/agenda/:profesionalId" element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <AgendaProfesional />
            </ProtectedRoute>
          } />
          <Route path="paciente/turno-periodico/:profesionalId" element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <SolicitarTurnoPeriodico />
            </ProtectedRoute>
          } />
          <Route path="paciente/seguimientos" element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <MisSeguimientos />
            </ProtectedRoute>
          } />
        </Route>

        {/* Ruta para manejar URLs no existentes */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
      
  
}

export default App

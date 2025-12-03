import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Ubicaciones from './pages/Ubicaciones';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import DashboardProfesional from './pages/profesional/DashboardProfesional';
import DashboardSecretario from './pages/secretario/DashboardSecretario';
import RecepcionPage from './pages/recepcion/RecepcionPage';
import DashboardPaciente from './pages/paciente/DashboardPaciente';
import Reportes from './pages/admin/Reportes';
import GestionSucursales from './pages/admin/GestionSucursales';
import GestionUsuarios from './pages/usuarios/GestionUsuarios';
import NuevoTurno from './pages/turnos/NuevoTurno';
import NuevoTurnoPeriodico from './pages/turnos/NuevoTurnoPeriodico';
import NuevaTeleconsulta from './pages/teleconsultas/NuevaTeleconsulta';
import GestionDisponibilidad from './pages/disponibilidad/GestionDisponibilidad';
import NotaClinica from './pages/profesional/NotaClinica';
import HistorialPaciente from './pages/profesional/HistorialPaciente';
import DocumentosCompartidos from './pages/profesional/DocumentosCompartidos';
import HistoriasClinicas from './pages/profesional/HistoriasClinicas';
import MisTurnos from './pages/profesional/MisTurnos';
import ProgramarSeguimiento from './pages/profesional/ProgramarSeguimiento';
import SeleccionarPacienteSeguimiento from './pages/profesional/SeleccionarPacienteSeguimiento';
import Seguimientos from './pages/profesional/Seguimientos';
import BuscarProfesional from './pages/paciente/BuscarProfesional';
import AgendaProfesional from './pages/paciente/AgendaProfesional';
import SolicitarTurnoPeriodico from './pages/paciente/SolicitarTurnoPeriodico';
import SolicitarTeleconsulta from './pages/paciente/SolicitarTeleconsulta';
import MisTurnosPaciente from './pages/paciente/MisTurnosPaciente';
import MisDocumentos from './pages/paciente/MisDocumentos';
import MisSeguimientos from './pages/paciente/MisSeguimientos';
import Perfil from './pages/Perfil';
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';

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
        { re: /^\/dashboard\/turnos\/nuevo$/, title: 'Nuevo turno' },
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
        { re: /^\/dashboard\/paciente\/documentos$/, title: 'Documentos' },
        { re: /^\/dashboard\/paciente\/seguimientos$/, title: 'Mis seguimientos' },
        { re: /^\/dashboard\/paciente\/historia$/, title: 'Mi historia clínica' },

        // Perfil
        { re: /^\/dashboard\/perfil$/, title: 'Mi perfil' },
      ];

      const match = map.find(m => m.re.test(path));
      document.title = match ? match.title : 'MediGestión';
    }, [location.pathname]);
    return null;
  };
//me podrias explicar la logica de este codigo? 
  // Este código es un componente principal de una aplicación React que utiliza React Router para la gestión de rutas.
  // La función checkAuth se llama en un efecto secundario (useEffect) cuando el componente se monta, lo que sugiere que está verificando el estado de autenticación del usuario. Luego, el componente devuelve una estructura de rutas que define las diferentes páginas y componentes que se renderizan según la URL actual. 
  return (
    <BrowserRouter>
      <TitleManager />
      <Toaster richColors closeButton position="top-right" />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/ubicaciones" element={<Ubicaciones />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard principal */}
          <Route index element={<Dashboard />} />

          {/* Rutas de Admin */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardAdmin />
            </ProtectedRoute>
          } />

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
          <Route path="secretario" element={
            <ProtectedRoute allowedRoles={['secretario']}>
              <DashboardSecretario />
            </ProtectedRoute>
          } />

          <Route path="recepcion" element={
            <ProtectedRoute allowedRoles={['secretario']}>
              <RecepcionPage />
            </ProtectedRoute>
          } />

          {/* Rutas de Profesional */}
          <Route path="profesional" element={
            <ProtectedRoute allowedRoles={['profesional']}>
              <DashboardProfesional />
            </ProtectedRoute>
          } />

          {/* Rutas de Paciente */}
          <Route path="paciente" element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <DashboardPaciente />
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
            <ProtectedRoute allowedRoles={['secretario']}>
              <NuevoTurno />
            </ProtectedRoute>
          } />
          
          <Route path="turnos/periodico/nuevo" element={
            <ProtectedRoute allowedRoles={['secretario']}>
              <NuevoTurnoPeriodico />
            </ProtectedRoute>
          } />

          <Route path="teleconsultas/nueva" element={
            <ProtectedRoute allowedRoles={['secretario']}>
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
          <Route path="paciente/teleconsulta" element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <SolicitarTeleconsulta />
            </ProtectedRoute>
          } />
          <Route path="paciente/documentos" element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <MisDocumentos />
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
    </BrowserRouter>
  );
      
  
}

export default App

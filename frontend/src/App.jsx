import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import Reportes from './pages/admin/Reportes';
import GestionUsuarios from './pages/usuarios/GestionUsuarios';
import NuevoTurno from './pages/turnos/NuevoTurno';
import NuevoTurnoPeriodico from './pages/turnos/NuevoTurnoPeriodico';
import GestionDisponibilidad from './pages/disponibilidad/GestionDisponibilidad';
import NotaClinica from './pages/profesional/NotaClinica';
import HistorialPaciente from './pages/profesional/HistorialPaciente';
import DocumentosCompartidos from './pages/profesional/DocumentosCompartidos';
import HistoriasClinicas from './pages/profesional/HistoriasClinicas';
import MisTurnos from './pages/profesional/MisTurnos';
import ProgramarSeguimiento from './pages/profesional/ProgramarSeguimiento';
import Seguimientos from './pages/profesional/Seguimientos';
import BuscarProfesional from './pages/paciente/BuscarProfesional';
import AgendaProfesional from './pages/paciente/AgendaProfesional';
import SolicitarTurnoPeriodico from './pages/paciente/SolicitarTurnoPeriodico';
import MisTurnosPaciente from './pages/paciente/MisTurnosPaciente';
import MisDocumentos from './pages/paciente/MisDocumentos';
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);
//me podrias explicar la logica de este codigo? 
  // Este código es un componente principal de una aplicación React que utiliza React Router para la gestión de rutas.
  // La función checkAuth se llama en un efecto secundario (useEffect) cuando el componente se monta, lo que sugiere que está verificando el estado de autenticación del usuario. Luego, el componente devuelve una estructura de rutas que define las diferentes páginas y componentes que se renderizan según la URL actual. 
  return (
    <BrowserRouter>
      <Toaster richColors closeButton position="top-right" />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
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
          <Route path="paciente/documentos" element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <MisDocumentos />
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

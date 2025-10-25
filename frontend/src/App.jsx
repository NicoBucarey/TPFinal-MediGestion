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
        </Route>

        {/* Ruta para manejar URLs no existentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
      
  
}

export default App

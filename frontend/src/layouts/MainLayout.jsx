import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuthStore } from '../stores/authStore';

const MainLayout = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  // Determinar si estamos en una ruta del dashboard
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  
  // Determinar si estamos en rutas de autenticación
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  // Determinar la clase de rol para estilos específicos
  const getRoleClass = () => {
    if (!user) return '';
    switch(user.role) {
      case 'admin': return 'role-admin';
      case 'profesional': return 'role-professional';
      case 'paciente': return 'role-patient';
      case 'secretario': return 'role-secretary';
      default: return '';
    }
  };

  // Si es una ruta de autenticación, no mostrar Header ni Footer
  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-secondary-light ${getRoleClass()}`}>
      {/* Header fixed */}
      <Header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-header" />

      {/* Main layout: leave space for header using pt-header so content doesn't hide under it */}
      <div className="flex flex-1 pt-header">
        {isAuthenticated && isDashboardRoute && (
          <Sidebar className="w-sidebar bg-white shadow-md z-40 overflow-y-auto" />
        )}

        <main className={`flex-1 overflow-y-auto ${
          isAuthenticated && isDashboardRoute ? 'w-[calc(100%-16rem)]' : 'w-full'
        }`}>
          <div className="min-h-[calc(100vh-4rem)]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer in normal flow (not fixed) */}
      <Footer className="bg-primary text-white w-full" />
    </div>
  );
};

export default MainLayout;
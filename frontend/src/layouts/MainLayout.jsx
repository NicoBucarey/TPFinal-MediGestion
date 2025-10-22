import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuthStore } from '../stores/authStore';

const MainLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  // Determinar si estamos en una ruta del dashboard
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-64px)]">
        {isAuthenticated && isDashboardRoute && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente al dashboard específico del rol
    if (user?.rol) {
      switch (user.rol) {
        case 'admin':
          navigate('/dashboard/admin', { replace: true });
          break;
        case 'profesional':
          navigate('/dashboard/profesional', { replace: true });
          break;
        case 'secretario':
          navigate('/dashboard/secretario', { replace: true });
          break;
        case 'paciente':
          navigate('/dashboard/paciente', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);

  // Mostrar un loader mientras redirige
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
};

export default Dashboard;
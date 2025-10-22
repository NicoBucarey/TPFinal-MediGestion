import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  console.log('ProtectedRoute:', {
    isAuthenticated,
    userRole: user?.rol,
    allowedRoles,
    currentPath: location.pathname
  });

  if (!isAuthenticated) {
    console.log('No autenticado, redirigiendo a login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    console.log('Rol no permitido, redirigiendo a home');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
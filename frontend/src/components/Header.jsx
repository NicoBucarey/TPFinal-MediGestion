import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import useAuth from '../hooks/useAuth';
import { useState, useEffect } from 'react';

const Header = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // Función para obtener la ruta del dashboard según el rol
  const getDashboardRoute = () => {
    if (!isAuthenticated || !user?.rol) {
      return '/';
    }
    
    switch (user.rol.toLowerCase()) {
      case 'admin':
        return '/dashboard/admin';
      case 'profesional':
        return '/dashboard/profesional';
      case 'secretario':
        return '/dashboard/secretario';
      case 'paciente':
        return '/dashboard/paciente';
      default:
        return '/';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar header solo cuando estamos en el tope de la página
      setIsVisible(window.scrollY === 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${className} transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <nav className="h-full px-4">
        <div className="flex items-center justify-between h-full">
          <Link to={getDashboardRoute()} className="flex items-center" aria-label="Ir al dashboard">
          {/* mobile: medium, md+: 8x size (~448px) */}
          <img src="/images/logotipo.png" alt="MiConsultorio" className="w-20 h-20 md:w-[180px] md:h-[180px] object-contain" />
          </Link>
          
          <div className="flex items-center space-x-6">
            {!isAuthenticated && (
              <Link
                to="/ubicaciones"
                className="text-secondary-dark hover:text-primary transition-colors duration-200 text-sm font-medium"
              >
                Ubicaciones
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard/perfil"
                  className="text-secondary-dark hover:text-primary transition-colors duration-200 text-sm font-medium"
                >
                  {user?.nombre} {user?.apellido}
                </Link>
                <div className="h-4 w-px bg-secondary"></div>
                <button
                  onClick={() => {
                    handleLogout();
                    navigate('/login');
                  }}
                  className="btn-secondary text-sm"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
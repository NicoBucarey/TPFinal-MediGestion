import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import useAuth from '../hooks/useAuth';

const Header = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className={`${className}`}>
      <nav className="h-full px-4">
        <div className="flex items-center justify-between h-full">
          <Link to="/" className="flex items-center" aria-label="Ir al inicio">
          {/* mobile: medium, md+: 8x size (~448px) */}
          <img src="/images/logotipo.png" alt="MiConsultorio" className="w-20 h-20 md:w-[180px] md:h-[180px] object-contain" />
          </Link>
          
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/perfil"
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
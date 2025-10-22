import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import useAuth from '../hooks/useAuth';

const Header = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600">
            MediGestion
          </Link>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/perfil"
                  className="text-gray-600 hover:text-blue-600"
                >
                  {user?.nombre} {user?.apellido}
                </Link>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => {
                    handleLogout();
                    navigate('/login');
                  }}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
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
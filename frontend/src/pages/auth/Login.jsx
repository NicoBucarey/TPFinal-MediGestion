import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await handleLogin(email, password);
    if (result.success) {
      const user = result.user;
      // Redirigir al dashboard principal
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00796B] rounded-2xl shadow-lg mb-4">
            <LockClosedIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Bienvenido de vuelta
          </h2>
          <p className="mt-2 text-gray-600">
            Ingresa a tu cuenta para continuar
          </p>
        </div>
        
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <form className="space-y-6" onSubmit={onSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-[#00796B] hover:bg-[#00695c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00796B] transition-all"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">¿Aún no tienes cuenta?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link 
                to="/register" 
                className="text-[#00796B] hover:text-[#00695c] font-semibold transition-colors"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>

        {/* Link para volver al home */}
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
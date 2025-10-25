import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlusIcon, EnvelopeIcon, LockClosedIcon, PhoneIcon, IdentificationIcon, CalendarIcon } from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    dni: '',
    fecha_nac: ''
  });
  const [error, setError] = useState('');
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Preparar datos para el registro
    const userData = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      email: formData.email,
      password: formData.password,
      dni: formData.dni,
      fechaNacimiento: formData.fecha_nac // El backend espera fechaNacimiento
    };

    const result = await handleRegister(userData);
    if (result.success) {
      navigate('/login', { 
        state: { message: 'Registro exitoso. Por favor, inicia sesión.' }
      });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00796B] rounded-2xl shadow-lg mb-4">
            <UserPlusIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Crear cuenta nueva
          </h2>
          <p className="mt-2 text-gray-600">
            Completa tus datos para registrarte como paciente
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  id="apellido"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="Pérez"
                  value={formData.apellido}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* DNI y Fecha de Nacimiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dni" className="block text-sm font-semibold text-gray-700 mb-2">
                  DNI
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdentificationIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="dni"
                    id="dni"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                    placeholder="12345678"
                    value={formData.dni}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fecha_nac" className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="fecha_nac"
                    id="fecha_nac"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                    value={formData.fecha_nac}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="telefono"
                  id="telefono"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="+54 9 11 1234-5678"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Botón de registro */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-[#00796B] hover:bg-[#00695c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00796B] transition-all"
              >
                Crear cuenta
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="text-[#00796B] hover:text-[#00695c] font-semibold transition-colors"
              >
                Inicia sesión aquí
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

export default Register;
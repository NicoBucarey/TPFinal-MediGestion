import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { 
  UserPlusIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  PhoneIcon, 
  UserCircleIcon,
  BriefcaseIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline';

const GestionUsuarios = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'profesional',
    profesion: '',
    especialidad: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Solo permitir acceso a administradores
  if (user?.rol !== 'admin') {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/staff`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Usuario creado exitosamente');
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
        rol: 'profesional',
        profesion: '',
        especialidad: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear el usuario');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00796B] rounded-2xl shadow-lg mb-4">
            <UserPlusIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-gray-600">
            Crear nuevos usuarios del sistema (profesionales y secretarios)
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
              <p className="font-medium">¡Éxito!</p>
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircleIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                >
                  <option value="profesional">Profesional</option>
                  <option value="secretario">Secretario</option>
                </select>
              </div>
            </div>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="Juan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
            </div>

            {/* Campos específicos para profesionales */}
            {formData.rol === 'profesional' && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-[#00796B]">
                  <BriefcaseIcon className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Información Profesional</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profesión
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="profesion"
                      value={formData.profesion}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                      placeholder="Médico, Psicólogo, etc."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Especialidad
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="especialidad"
                      value={formData.especialidad}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all"
                      placeholder="Cardiología, Pediatría, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-[#00796B] hover:bg-[#00695c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00796B] transition-all"
              >
                Crear Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;

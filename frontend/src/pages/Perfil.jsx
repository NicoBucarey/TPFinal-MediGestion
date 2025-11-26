import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  IdentificationIcon,
  LockClosedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Perfil = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [datosPersonales, setDatosPersonales] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    // profesional
    profesion: '',
    especialidad: '',
    // paciente
    dni: '',
    fecha_nacimiento: ''
  });
  const [cambiarPassword, setCambiarPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirm: ''
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await axios.get(`${API_URL}/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDatosPersonales(prev => ({
        ...prev,
        nombre: response.data.nombre || '',
        apellido: response.data.apellido || '',
        email: response.data.email || '',
        telefono: response.data.telefono || '',
        profesion: response.data.profesion || '',
        especialidad: response.data.especialidad || '',
        dni: response.data.dni || '',
        fecha_nacimiento: response.data.fecha_nacimiento ? 
          String(response.data.fecha_nacimiento).split('T')[0] : ''
      }));
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar el perfil');
    }
  };

  const handleSubmitDatos = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      // Construir payload según rol
      const payload = {
        nombre: datosPersonales.nombre,
        apellido: datosPersonales.apellido,
        email: datosPersonales.email,
        telefono: datosPersonales.telefono,
      };
      if (user?.rol === 'profesional') {
        payload.profesion = datosPersonales.profesion || null;
        payload.especialidad = datosPersonales.especialidad || null;
      } else if (user?.rol === 'paciente') {
        payload.dni = datosPersonales.dni || null;
        payload.fecha_nacimiento = datosPersonales.fecha_nacimiento || null;
      }

      const response = await axios.put(`${API_URL}/perfil`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar el usuario en el store
      updateUser({ nombre: datosPersonales.nombre, apellido: datosPersonales.apellido, telefono: datosPersonales.telefono, mail: datosPersonales.email });
      
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error(error.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    
    if (passwords.passwordNueva !== passwords.passwordConfirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwords.passwordNueva.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      await axios.put(`${API_URL}/perfil/password`, {
        passwordActual: passwords.passwordActual,
        passwordNueva: passwords.passwordNueva
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Contraseña actualizada correctamente');
      setPasswords({
        passwordActual: '',
        passwordNueva: '',
        passwordConfirm: ''
      });
      setCambiarPassword(false);
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      toast.error(error.response?.data?.error || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="mt-2 text-gray-600">Gestiona tu información personal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mb-4">
                <UserCircleIcon className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.nombre} {user?.apellido}
              </h2>
              <p className="text-gray-600 capitalize">{user?.rol}</p>
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <span className="break-all">{datosPersonales.email}</span>
                </div>
                {datosPersonales.telefono && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span>{datosPersonales.telefono}</span>
                  </div>
                )}
                {datosPersonales.dni && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <IdentificationIcon className="w-5 h-5 text-gray-400" />
                    <span>DNI: {datosPersonales.dni}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formularios */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Personales */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-6">
              <UserCircleIcon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">Datos Personales</h2>
            </div>

            <form onSubmit={handleSubmitDatos}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={datosPersonales.nombre}
                    onChange={(e) => setDatosPersonales({...datosPersonales, nombre: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={datosPersonales.apellido}
                    onChange={(e) => setDatosPersonales({...datosPersonales, apellido: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={datosPersonales.email}
                    onChange={(e) => setDatosPersonales({...datosPersonales, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={datosPersonales.telefono}
                    onChange={(e) => setDatosPersonales({...datosPersonales, telefono: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {user?.rol === 'profesional' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profesión</label>
                      <input
                        type="text"
                        value={datosPersonales.profesion}
                        onChange={(e) => setDatosPersonales({...datosPersonales, profesion: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                      <input
                        type="text"
                        value={datosPersonales.especialidad}
                        onChange={(e) => setDatosPersonales({...datosPersonales, especialidad: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {user?.rol === 'paciente' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">DNI</label>
                      <input
                        type="text"
                        value={datosPersonales.dni}
                        onChange={(e) => setDatosPersonales({...datosPersonales, dni: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        value={datosPersonales.fecha_nacimiento}
                        onChange={(e) => setDatosPersonales({...datosPersonales, fecha_nacimiento: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Cambiar Contraseña */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <LockClosedIcon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">Seguridad</h2>
              </div>
              {!cambiarPassword && (
                <button
                  onClick={() => setCambiarPassword(true)}
                  className="text-primary hover:text-primary-dark font-medium text-sm"
                >
                  Cambiar contraseña
                </button>
              )}
            </div>

            {cambiarPassword ? (
              <form onSubmit={handleSubmitPassword}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={passwords.passwordActual}
                      onChange={(e) => setPasswords({...passwords, passwordActual: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwords.passwordNueva}
                      onChange={(e) => setPasswords({...passwords, passwordNueva: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwords.passwordConfirm}
                      onChange={(e) => setPasswords({...passwords, passwordConfirm: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCambiarPassword(false);
                      setPasswords({ passwordActual: '', passwordNueva: '', passwordConfirm: '' });
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <LockClosedIcon className="w-5 h-5" />
                    <span>{loading ? 'Guardando...' : 'Actualizar Contraseña'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-gray-600 text-sm">
                Tu contraseña está protegida. Haz clic en "Cambiar contraseña" para actualizarla.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;

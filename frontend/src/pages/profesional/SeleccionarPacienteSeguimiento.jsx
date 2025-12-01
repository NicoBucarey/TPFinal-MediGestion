import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MagnifyingGlassIcon, UserIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API_URL;

const SeleccionarPacienteSeguimiento = () => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const user = useAuthStore((s) => s.user);

  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);

  useEffect(() => {
    fetchPacientes();
  }, []);

  useEffect(() => {
    if (busqueda.trim() === '') {
      setPacientesFiltrados(pacientes);
    } else {
      const filtrados = pacientes.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.email.toLowerCase().includes(busqueda.toLowerCase())
      );
      setPacientesFiltrados(filtrados);
    }
  }, [busqueda, pacientes]);

  const fetchPacientes = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Buscar pacientes que han tenido turnos con este profesional
      const res = await axios.get(`${API}/clinica/profesional/${user.id}/pacientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPacientes(res.data || []);
    } catch (e) {
      console.error('Error al cargar pacientes:', e);
      setPacientes([]);
      toast.error('Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarPaciente = (paciente) => {
    // Redirigir a programar seguimiento con el paciente seleccionado
    navigate('/dashboard/profesional/seguimiento/nuevo', { 
      state: { 
        paciente: {
          id: paciente.id_usuario,
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          email: paciente.email
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-2xl shadow-lg mb-4">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear Seguimiento</h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">Selecciona un paciente para configurar su seguimiento post-consulta</p>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#00796B] to-[#004D40] p-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </div>
              Buscar Paciente
            </h3>
          </div>
          <div className="p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Lista de pacientes */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Tus Pacientes</h3>
            <p className="text-xs text-gray-600 mt-1">Pacientes con turnos previos</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00796B]"></div>
                  <span className="text-gray-500 font-medium text-sm">Cargando pacientes...</span>
                </div>
              </div>
            ) : pacientesFiltrados.length === 0 ? (
              <div className="p-8 text-center">
                <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">
                  {busqueda ? 'No se encontraron pacientes' : 'No hay pacientes disponibles'}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {busqueda ? 'Intenta con otros términos de búsqueda' : 'Los pacientes aparecerán aquí después de tener turnos contigo'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pacientesFiltrados.map((paciente) => (
                  <div
                    key={paciente.id_usuario}
                    onClick={() => seleccionarPaciente(paciente)}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {paciente.nombre ? `${paciente.nombre.charAt(0)}${paciente.apellido?.charAt(0) || ''}` : 'P'}
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">
                            {paciente.nombre} {paciente.apellido}
                          </h4>
                          <p className="text-xs text-gray-600">{paciente.email}</p>
                          {paciente.telefono && (
                            <p className="text-xs text-gray-500">{paciente.telefono}</p>
                          )}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <div className="bg-[#00796B] text-white px-3 py-1.5 rounded-lg font-medium text-sm">
                          Seleccionar
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botón volver */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard/profesional/seguimientos')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 text-sm"
          >
            ← Volver a Seguimientos
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeleccionarPacienteSeguimiento;
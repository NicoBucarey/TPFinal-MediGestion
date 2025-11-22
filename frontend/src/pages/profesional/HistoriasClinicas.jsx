import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  IdentificationIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API_URL;

const HistoriasClinicas = () => {
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const navigate = useNavigate();
  const [termino, setTermino] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const buscar = async (e) => {
    e?.preventDefault();
    if (!termino.trim()) return;
    
    setLoading(true);
    setBusquedaRealizada(true);
    
    try {
      const res = await axios.get(`${API}/pacientes/buscar`, {
        params: { termino },
        headers: { Authorization: `Bearer ${token}` }
      });
      setResultados(res.data || []);
    } catch (e) {
      console.error('Error en búsqueda:', e);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarBusqueda = () => {
    setTermino('');
    setResultados([]);
    setBusquedaRealizada(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header moderno */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-full shadow-xl mb-4">
            <ClipboardDocumentListIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00796B] to-[#004D40] bg-clip-text text-transparent">
            Historias Clínicas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Busca y accede al historial médico completo de tus pacientes de manera rápida y segura
          </p>
        </div>

        {/* Buscador moderno */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
          <form onSubmit={buscar} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por DNI, nombre, apellido o email..."
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-all duration-200 bg-white/50"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                type="submit"
                disabled={loading || !termino.trim()}
                className="flex-1 bg-gradient-to-r from-[#00796B] to-[#004D40] hover:from-[#00695c] hover:to-[#00251a] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <MagnifyingGlassIcon className="w-5 h-5" />
                )}
                {loading ? 'Buscando...' : 'Buscar Paciente'}
              </button>
              
              {busquedaRealizada && (
                <button
                  type="button"
                  onClick={limpiarBusqueda}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Resultados */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6 text-[#00796B]" />
              Resultados de búsqueda
            </h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-[#00796B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Buscando pacientes...</p>
              </div>
            ) : !busquedaRealizada ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Buscar Pacientes</h3>
                <p className="text-gray-500">Ingresa un término de búsqueda para encontrar pacientes</p>
              </div>
            ) : resultados.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserIcon className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Sin resultados</h3>
                <p className="text-gray-500">No se encontraron pacientes con el término: <strong>"{termino}"</strong></p>
                <p className="text-sm text-gray-400 mt-2">Verifica el DNI, nombre o email e intenta nuevamente</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Se encontraron <strong>{resultados.length}</strong> paciente(s)
                </p>
                
                {resultados.map((paciente, index) => (
                  <div 
                    key={paciente.id_usuario} 
                    className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#00796B] transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {paciente.nombre?.charAt(0)}{paciente.apellido?.charAt(0)}
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {paciente.apellido}, {paciente.nombre}
                          </h3>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <IdentificationIcon className="w-4 h-4 text-[#00796B]" />
                              <span>DNI: {paciente.dni}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <EnvelopeIcon className="w-4 h-4 text-[#00695c]" />
                              <span>{paciente.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/dashboard/profesional/paciente/${paciente.id_usuario}/historial`)}
                        className="group bg-gradient-to-r from-[#00796B] to-[#004D40] hover:from-[#00695c] hover:to-[#00251a] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2"
                      >
                        <ClipboardDocumentListIcon className="w-5 h-5" />
                        <span>Ver Historial</span>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoriasClinicas;

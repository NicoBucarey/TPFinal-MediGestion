import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

const HistoriasClinicas = () => {
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const navigate = useNavigate();
  const [termino, setTermino] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState([]);

  const buscar = async (e) => {
    e?.preventDefault();
    if (!termino.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/pacientes/buscar`, {
        params: { termino },
        headers: { Authorization: `Bearer ${token}` }
      });
      setResultados(res.data || []);
    } catch (e) {
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Historias Clínicas</h2>
          <p className="text-gray-600">Buscá un paciente por DNI, nombre, apellido o email</p>
        </div>

        <form onSubmit={buscar} className="bg-white rounded-2xl shadow p-4 flex gap-3">
          <input
            type="text"
            placeholder="Ej: 30123456 o Juan o juan@mail.com"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-[#00796B] hover:bg-[#00695c] text-white font-semibold">
            Buscar
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow p-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Buscando...</div>
          ) : resultados.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Sin resultados</div>
          ) : (
            <ul className="divide-y">
              {resultados.map((p) => (
                <li key={p.id_usuario} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{p.apellido}, {p.nombre}</div>
                    <div className="text-sm text-gray-600">DNI: {p.dni} • {p.email}</div>
                  </div>
                  <div>
                    <button
                      onClick={() => navigate(`/dashboard/profesional/paciente/${p.id_usuario}/historial`)}
                      className="px-3 py-1.5 rounded-md bg-[#00796B] hover:bg-[#00695c] text-white text-sm"
                    >
                      Ver historial
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoriasClinicas;

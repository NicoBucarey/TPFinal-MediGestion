import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { DocumentArrowUpIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API_URL;
const BASE = API.replace(/\/api$/, '');

const NotaClinica = () => {
  const { turnoId } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');

  const [turno, setTurno] = useState(null);
  const [nota, setNota] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const canRegister = turno?.estado && String(turno.estado).toLowerCase() === 'confirmado';
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        const res = await axios.get(`${API}/clinica/turno/${turnoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTurno(res.data);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Error al cargar el turno');
      } finally {
        setLoading(false);
      }
    };
    fetchTurno();
  }, [turnoId, token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canRegister) {
      toast.error('Solo se puede registrar nota para turnos confirmados');
      return;
    }
    if (!nota.trim()) {
      toast.error('La nota clínica es obligatoria');
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('turnoId', turnoId);
      form.append('nota', nota);
      for (const f of files) form.append('archivos', f);
      await axios.post(`${API}/clinica/nota`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Nota guardada');
      navigate(`/dashboard/profesional/paciente/${turno.id_paciente}/historial`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al guardar la nota');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="h-40 bg-white rounded-2xl shadow animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00796B] rounded-2xl shadow-lg mb-6">
            <ClipboardDocumentListIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Nota clínica del turno</h2>
          <p className="text-gray-600">Registra la atención y adjunta documentos</p>
        </div>

  {/* Datos del turno */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Fecha</p>
              <p className="font-semibold">{turno?.fecha} {turno?.hora_inicio?.slice(0,5)}</p>
            </div>
            <div>
              <p className="text-gray-500">Paciente</p>
              <p className="font-semibold">{turno?.pac_nombre ? `${turno.pac_nombre} ${turno.pac_apellido}` : '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Estado</p>
              <p className="font-semibold">{turno?.estado || '—'}</p>
            </div>
          </div>
        </div>

        {/* Restricción por estado */}
        {!canRegister && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">Este turno está en estado "{turno?.estado}". Solo se puede registrar nota para turnos confirmados.</p>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nota clínica</label>
              <textarea
                className="w-full min-h-[160px] rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent disabled:bg-gray-100"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Escribe los detalles de la consulta, hallazgos, indicaciones..."
                required
                disabled={!canRegister}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Adjuntar documentos</label>
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-[#00796B] rounded-lg border-2 border-dashed border-[#00796B]/40 cursor-pointer hover:bg-gray-50">
                  <DocumentArrowUpIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm">Sube PDFs o imágenes (máx 5 archivos)</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    disabled={!canRegister}
                  />
                </label>
              </div>
              {files.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  {files.map((f) => (
                    <div key={f.name}>{f.name}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving || !canRegister}
                className="w-full py-3 rounded-lg bg-[#00796B] hover:bg-[#00695c] text-white font-semibold shadow-md disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar nota'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotaClinica;

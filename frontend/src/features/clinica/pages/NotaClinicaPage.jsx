import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from 'sonner';
import { DocumentArrowUpIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API_URL;
const BASE = API.replace(/\/api$/, '');

const NotaClinicaPage = () => {
  const { turnoId } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');

  const [turno, setTurno] = useState(null);
  const [nota, setNota] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notasPrevias, setNotasPrevias] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [modalDetalle, setModalDetalle] = useState({ visible: false, nota: null });
  const canRegister = turno?.estado && String(turno.estado).toLowerCase() !== 'cancelado';
  const [saving, setSaving] = useState(false);

  const abrirModalDetalle = (notaDetalle) => {
    setModalDetalle({ visible: true, nota: notaDetalle });
  };

  const cerrarModalDetalle = () => {
    setModalDetalle({ visible: false, nota: null });
  };

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        const res = await axios.get(`${API}/clinica/turno/${turnoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const turnoData = res.data;
        setTurno(turnoData);
        
        if (turnoData.id_paciente) {
          setLoadingHistorial(true);
          try {
            const historialRes = await axios.get(`${API}/clinica/paciente/${turnoData.id_paciente}/historial`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setNotasPrevias(historialRes.data || []);
          } catch (error) {
            console.error('Error al cargar historial:', error);
          } finally {
            setLoadingHistorial(false);
          }
        }
        
        if (turnoData.estado === 'confirmado') {
          try {
            await axios.put(`${API}/turnos/${turnoId}/estado`, 
              { estado: 'en_curso' },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setTurno(prev => ({ ...prev, estado: 'en_curso' }));
            toast.info('Consulta iniciada - Estado cambiado a "En curso"');
          } catch (error) {
            console.error('Error al cambiar estado a en_curso:', error);
          }
        }
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
      toast.error('No se puede registrar nota en turnos cancelados');
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

      try {
        await axios.put(`${API}/turnos/${turnoId}/estado`, 
          { estado: 'completado' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Nota clínica guardada exitosamente y turno completado');
      } catch (error) {
        console.error('Error al completar turno:', error);
        toast.success('Nota clínica guardada exitosamente (no se pudo completar turno automáticamente)');
      }

      navigate('/dashboard/profesional/turnos');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-2xl shadow-lg mb-4">
            <ClipboardDocumentListIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nota clínica</h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">Registra la atención y consulta el historial clínico del paciente</p>
        </div>

        <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3">
              <span className="text-lg text-white font-bold">
                {turno?.pac_nombre ? `${turno.pac_nombre.charAt(0)}${turno.pac_apellido?.charAt(0) || ''}` : '👤'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {turno?.pac_nombre ? `${turno.pac_nombre} ${turno.pac_apellido}` : 'Paciente no especificado'}
            </h2>
            <div className="inline-flex items-center gap-4 text-gray-600 bg-white rounded-full px-4 py-2 shadow-sm text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="font-medium">
                  {turno?.fecha ? (() => {
                    try {
                      const fechaStr = turno.fecha.includes('T') ? turno.fecha : `${turno.fecha}T00:00:00`;
                      return new Date(fechaStr).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long',
                        day: 'numeric'
                      });
                    } catch (error) {
                      console.error('Error al formatear fecha:', error, turno.fecha);
                      return turno.fecha;
                    }
                  })() : 'Fecha no disponible'}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="font-medium">{turno?.hora_inicio?.slice(0, 5) || 'Hora no disponible'}</span>
              </div>
            </div>
          </div>
        </div>

        {!canRegister && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">Este turno está en estado "{turno?.estado}". No se puede registrar nota en turnos cancelados.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#00796B] to-[#004D40] p-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 text-white" />
                </div>
                Nueva nota clínica
              </h3>
            </div>
            <div className="p-4">
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nota clínica</label>
                  <textarea
                    className="w-full min-h-[150px] rounded-lg border-2 border-gray-200 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent disabled:bg-gray-100 transition-all duration-200 text-sm"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Escribe los detalles de la consulta, hallazgos, indicaciones..."
                    required
                    disabled={!canRegister}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Adjuntar documentos</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="w-full flex flex-col items-center px-4 py-4 bg-gradient-to-br from-gray-50 to-gray-100 text-[#00796B] rounded-lg border-2 border-dashed border-[#00796B]/40 cursor-pointer hover:from-[#00796B]/5 hover:to-[#00796B]/10 transition-all duration-200">
                      <DocumentArrowUpIcon className="w-6 h-6 mb-2" />
                      <span className="text-xs font-medium">Sube PDFs o imágenes</span>
                      <span className="text-xs text-gray-500 mt-1">(máximo 5 archivos)</span>
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
                    <div className="mt-4 space-y-2">
                      {files.map((f) => (
                        <div key={f.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          📎 <span className="text-sm text-gray-700">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={saving || !canRegister}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-[#00796B] to-[#004D40] hover:from-[#00695c] hover:to-[#00251a] text-white font-bold shadow-lg disabled:opacity-60 transition-all duration-200 transform hover:scale-[1.02] text-sm"
                  >
                    {saving ? '🔄 Guardando...' : '💾 Guardar nota y completar turno'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xs">📋</span>
                </div>
                Historial clínico
              </h3>
            </div>
            <div className="p-4">
            
            {loadingHistorial ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2"></div>
                    <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : notasPrevias.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📝</span>
                </div>
                <h4 className="text-base font-semibold text-gray-600 mb-1">Sin historial previo</h4>
                <p className="text-gray-500 text-sm">Este será el primer registro clínico</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {notasPrevias.map((notaPrevia, index) => {
                  const formatearFechaHistorial = (fecha) => {
                    try {
                      if (!fecha) return 'Fecha no disponible';
                      const fechaObj = new Date(fecha);
                      if (Number.isNaN(fechaObj.getTime())) return 'Fecha inválida';
                      return fechaObj.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      });
                    } catch (error) {
                      console.error('Error al formatear fecha del historial:', error, fecha);
                      return 'Fecha no disponible';
                    }
                  };

                  const esDocumento = notaPrevia.tipo === 'documento';
                  const tieneContenido = notaPrevia.detalle || notaPrevia.nota;
                  const contenidoPreview = esDocumento 
                    ? `Documento: ${notaPrevia.tipo_documento || 'Archivo médico'}`
                    : (tieneContenido ? (notaPrevia.detalle || notaPrevia.nota) : 'Documento sin descripción');
                  
                  const esClickeable = tieneContenido || esDocumento;

                  return (
                    <div 
                      key={index} 
                      className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        esClickeable 
                          ? 'border-gray-200 hover:border-[#00796B] hover:shadow-lg cursor-pointer transform hover:scale-[1.02]' 
                          : 'border-gray-100'
                      }`}
                      onClick={() => esClickeable && abrirModalDetalle(notaPrevia)}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        esDocumento ? 'bg-gradient-to-b from-blue-500 to-purple-600' : 'bg-gradient-to-b from-green-500 to-teal-600'
                      }`}></div>
                      
                      <div className="p-4 pl-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg ${esDocumento ? '📄' : '📝'}`}></span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatearFechaHistorial(notaPrevia.fecha)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                            👨‍⚕️ <span>{notaPrevia.profesional || 'Dr. No especificado'}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg text-sm text-gray-700">
                          {contenidoPreview.length > 120 ? `${contenidoPreview.substring(0, 120)}...` : contenidoPreview}
                        </div>
                        
                        {esClickeable && (
                          <div className="mt-3 text-xs font-medium text-[#00796B] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>👁️</span> Clic para ver detalles completos
                          </div>
                        )}
                        
                        {esDocumento && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              📁 {notaPrevia.tipo_documento || 'Documento'}
                            </span>
                            {notaPrevia.compartido && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                ✅ Compartido
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {modalDetalle.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalDetalle.nota?.tipo === 'documento' ? '📄 Documento Médico' : '📝 Nota Clínica'}
                </h3>
                <button
                  onClick={cerrarModalDetalle}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Fecha:</span>
                    <p className="text-gray-900">
                      {modalDetalle.nota?.fecha ? new Date(modalDetalle.nota.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'No disponible'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Profesional:</span>
                    <p className="text-gray-900">{modalDetalle.nota?.profesional || 'No especificado'}</p>
                  </div>
                  {modalDetalle.nota?.tipo === 'documento' && (
                    <>
                      <div>
                        <span className="font-medium text-gray-700">Tipo:</span>
                        <p className="text-gray-900">{modalDetalle.nota?.tipo_documento || 'Documento médico'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Estado:</span>
                        <p className="text-gray-900">
                          {modalDetalle.nota?.compartido ? '✅ Compartido con paciente' : '🔒 Privado'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6">
                {modalDetalle.nota?.tipo === 'documento' ? (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Archivo:</h4>
                    {modalDetalle.nota?.url ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📎</span>
                            <div className="flex-1">
                              <p className="font-medium">{modalDetalle.nota.tipo_documento}</p>
                              <p className="text-sm text-gray-600">{modalDetalle.nota.url.split('/').pop()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          {(() => {
                            const url = modalDetalle.nota.url;
                            const tipoDocumento = modalDetalle.nota.tipo_documento?.toLowerCase() || '';
                            const extension = url?.split('.').pop()?.toLowerCase() || '';
                            const urlCompleta = url?.startsWith('/') ? `${BASE}${url}` : url;
                            
                            if (['imagen', 'image'].includes(tipoDocumento) || 
                                ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
                              return (
                                <div className="text-center">
                                  <img 
                                    src={urlCompleta} 
                                    alt="Vista previa" 
                                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-sm border"
                                    onError={(e) => {
                                      console.error('Error al cargar imagen:', urlCompleta);
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                  <div style={{ display: 'none' }} className="text-gray-500 py-8">
                                    <span className="text-4xl block mb-2">🖼️</span>
                                    <p>Error al cargar la imagen</p>
                                    <p className="text-sm">Verifica que el archivo sea accesible</p>
                                  </div>
                                </div>
                              );
                            }
                            
                            if (tipoDocumento.includes('pdf') || extension === 'pdf') {
                              return (
                                <div className="bg-gray-100 rounded-lg">
                                  <iframe
                                    src={`${urlCompleta}#toolbar=1&navpanes=1&scrollbar=1`}
                                    width="100%"
                                    height="500px"
                                    className="rounded-lg"
                                    title="Vista previa PDF"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                  <div style={{ display: 'none' }} className="text-center text-gray-500 py-8">
                                    <span className="text-4xl block mb-2">📄</span>
                                    <p>No se puede mostrar la vista previa del PDF</p>
                                    <p className="text-sm">Use el botón de descarga para ver el archivo</p>
                                  </div>
                                </div>
                              );
                            }
                            
                            if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
                              return (
                                <div className="text-center text-gray-500 py-8">
                                  <span className="text-4xl block mb-2">📝</span>
                                  <p className="font-medium">Documento de texto</p>
                                  <p className="text-sm">Formato: {extension.toUpperCase()}</p>
                                  <p className="text-sm mt-2">Use el botón de descarga para abrir el archivo</p>
                                </div>
                              );
                            }
                            
                            return (
                              <div className="text-center text-gray-500 py-8">
                                <span className="text-4xl block mb-2">📎</span>
                                <p className="font-medium">Archivo adjunto</p>
                                <p className="text-sm">Tipo: {modalDetalle.nota.tipo_documento}</p>
                                <p className="text-sm mt-2">Use el botón de descarga para abrir el archivo</p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Archivo no disponible</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Nota clínica:</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[200px]">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {modalDetalle.nota?.detalle || modalDetalle.nota?.nota || 'Sin contenido disponible'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center gap-3">
                <div className="text-sm text-gray-500">
                  {modalDetalle.nota?.tipo === 'documento' && modalDetalle.nota?.url && (
                    <span>💡 Tip: Puedes hacer zoom en la imagen o navegar en el PDF</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={cerrarModalDetalle}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                  {modalDetalle.nota?.url && (
                    <>
                      <a
                        href={modalDetalle.nota.url?.startsWith('/') ? `${BASE}${modalDetalle.nota.url}` : modalDetalle.nota.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        🔗 Abrir en nueva pestaña
                      </a>
                      <a
                        href={modalDetalle.nota.url?.startsWith('/') ? `${BASE}${modalDetalle.nota.url}` : modalDetalle.nota.url}
                        download
                        className="px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695c] transition-colors"
                      >
                        📥 Descargar
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotaClinicaPage;

import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const Ubicaciones = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const baseUrl = (API_URL || '').replace(/\/api$/, '');

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get(`${API_URL}/sucursales/activas`);
        setSucursales(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('Error cargando sucursales', e);
        setSucursales([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ubicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-teal-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestras Ubicaciones</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Encontrá la sucursal más cercana a vos. Estamos para atenderte en múltiples puntos.
          </p>
        </div>
      </section>

      {/* Lista de sucursales */}
      <section className="container mx-auto px-4 py-12">
        {sucursales.length === 0 ? (
          <div className="text-center py-12">
            <MapPinIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No hay sucursales activas disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sucursales.map((s) => (
              <div key={s.id_sucursal} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Imagen */}
                {s.imagen_url ? (
                  <img 
                    src={baseUrl + s.imagen_url} 
                    alt={s.nombre || `Sucursal ${s.numero}`} 
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <MapPinIcon className="w-20 h-20 text-gray-400" />
                  </div>
                )}

                {/* Información */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-xs text-primary font-semibold mb-1">Sucursal #{s.numero}</div>
                    <h2 className="text-2xl font-bold text-gray-900">{s.nombre || 'Sucursal'}</h2>
                  </div>

                  <div className="space-y-3">
                    {/* Dirección */}
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">{s.direccion}</p>
                        <p>{s.localidad}, {s.provincia}</p>
                      </div>
                    </div>

                    {/* Teléfono */}
                    {s.telefono && (
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-primary flex-shrink-0" />
                        <a href={`tel:${s.telefono}`} className="text-sm text-gray-700 hover:text-primary transition">
                          {s.telefono}
                        </a>
                      </div>
                    )}

                    {/* Email */}
                    {s.email && (
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-5 h-5 text-primary flex-shrink-0" />
                        <a href={`mailto:${s.email}`} className="text-sm text-gray-700 hover:text-primary transition truncate">
                          {s.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <div className="pt-4">
                    <a
                      href="/dashboard/turnos/nuevo"
                      className="block w-full text-center bg-primary hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition"
                    >
                      Agendar turno en esta sucursal
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA final */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">¿No encontrás la sucursal que buscás?</h3>
          <p className="text-gray-600 mb-6">Contactanos para más información sobre nuestros puntos de atención.</p>
          <a
            href="/login"
            className="inline-block bg-primary hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-lg transition"
          >
            Iniciá sesión
          </a>
        </div>
      </section>
    </div>
  );
};

export default Ubicaciones;

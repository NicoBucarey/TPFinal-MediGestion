import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Footer({ className = '' }) {
  const [contacto, setContacto] = useState({ direccion: '', telefono: '', email: '' });
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const baseUrl = (API_URL || '').replace(/\/api$/, '');

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get(`${API_URL}/sucursales/activas`);
        const sucursales = Array.isArray(res.data) ? res.data : [];
        const primera = sucursales[0] || null;
        setContacto({
          direccion: primera ? `${primera.direccion}, ${primera.localidad}, ${primera.provincia}` : 'Consulte nuestras ubicaciones',
          telefono: primera?.telefono || '',
          email: primera?.email || ''
        });
      } catch (e) {
        setContacto({ direccion: 'Consulte nuestras ubicaciones', telefono: '', email: '' });
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return (
    <footer className={`relative bg-gradient-to-b from-[#003C37] to-[#00796B] text-white ${className}`}>
      {/* Panel full-height */}
      <div className="min-h-screen flex flex-col">
        {/* Contenido */}
        <div className="flex-1 px-6 md:px-12 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Institucional */}
            <div className="col-span-1">
              <div className="mb-4">
                <img src="/images/logotipo.png" alt="MediGestión" className="h-10 w-auto opacity-95" />
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                MediGestión es un sistema integral de salud digital que conecta pacientes y profesionales, optimiza la gestión de turnos y mejora la calidad de atención con herramientas modernas y seguras.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 8.98h3.96V21H3V8.98zm7.44 0h3.8v1.64h.05c.53-.96 1.84-1.97 3.8-1.97 4.06 0 4.81 2.67 4.81 6.15V21H19.9v-4.97c0-1.18-.02-2.69-1.64-2.69-1.64 0-1.89 1.28-1.89 2.6V21h-3.96V8.98z"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X" className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 4.5h2.686l-5.862 6.705 6.887 8.295H16.9l-4.5-5.427-5.146 5.427H4.57l6.3-6.637L4 4.5h5.236l4.087 4.932L18.244 4.5z"/></svg>
                </a>
              </div>
            </div>

            {/* Navegación */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4">Navegación</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-[#4DD0E1] transition">Inicio</Link></li>
                <li><Link to="/ubicaciones" className="hover:text-[#4DD0E1] transition">Ubicaciones</Link></li>
                <li><Link to="/login" className="hover:text-[#4DD0E1] transition">Portal del paciente</Link></li>
                <li><Link to="/register" className="hover:text-[#4DD0E1] transition">Crear cuenta</Link></li>
                <li><Link to="/dashboard/turnos/nuevo" className="hover:text-[#4DD0E1] transition">Solicitar turno</Link></li>
              </ul>
            </div>

            {/* Contacto (primera sucursal) */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3 items-start">
                  <MapPinIcon className="h-5 w-5 mt-0.5 text-[#4DD0E1]" />
                  <span>{contacto.direccion}</span>
                </li>
                {contacto.telefono && (
                  <li className="flex gap-3 items-center">
                    <PhoneIcon className="h-5 w-5 text-[#4DD0E1]" />
                    <a className="hover:text-[#4DD0E1] transition" href={`tel:${contacto.telefono}`}>{contacto.telefono}</a>
                  </li>
                )}
                {contacto.email && (
                  <li className="flex gap-3 items-center">
                    <EnvelopeIcon className="h-5 w-5 text-[#4DD0E1]" />
                    <a className="hover:text-[#4DD0E1] transition" href={`mailto:${contacto.email}`}>{contacto.email}</a>
                  </li>
                )}
              </ul>
              {/* CTA */}
              <div className="mt-6">
                <Link to="/dashboard/turnos/nuevo" className="inline-block bg-[#4DD0E1] text-[#003C37] font-semibold px-4 py-2 rounded-lg shadow hover:shadow-md hover:translate-y-[-1px] transition-transform">
                  Solicitar turno
                </Link>
              </div>
            </div>

            {/* Servicios */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4">Nuestros Servicios</h3>
              <div className="bg-white/10 rounded-lg p-4 space-y-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#4DD0E1]/20 flex items-center justify-center">
                    <svg className="h-5 w-5 text-[#4DD0E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Atención disponible</p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-xs text-white/70 leading-relaxed">
                MediGestión no reemplaza el consejo médico profesional. Ante situaciones de emergencia, comuníquese con los servicios de urgencia locales. La información provista es confidencial y se gestiona bajo estándares de seguridad.
              </p>
            </div>
          </div>

          {/* Beneficio destacado */}
          <div className="mt-12">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <div className="h-16 w-16 rounded-full bg-[#4DD0E1]/20 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-[#4DD0E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-xl font-semibold mb-3">Gestión rápida</h4>
              <p className="text-sm text-white/80">Agendá tu turno en menos de 2 minutos desde cualquier dispositivo</p>
            </div>
          </div>
        </div>

        {/* Línea final */}
        <div className="px-6 md:px-12 py-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/80">© {new Date().getFullYear()} MediGestión. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6 text-xs text-white/70">
              <Link to="/ubicaciones" className="hover:text-white transition">Sucursales</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#00796B] text-white py-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Identidad */}
          <div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-white/90">Medigestion</p>
                <p className="mt-2 text-sm text-[#4DD0E1]">Atención profesional cercana.</p>
              </div>
            </div>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Enlaces</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm text-white hover:text-[#4DD0E1] transition-colors">Inicio</a></li>
              <li><a href="/ubicaciones" className="text-sm text-white hover:text-[#4DD0E1] transition-colors">Turnos</a></li>
              <li><a href="/turnos" className="text-sm text-white hover:text-[#4DD0E1] transition-colors">Profesionales</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Contacto</h3>
            <ul className="text-sm space-y-1 text-white/90">
              <li>Dirección: Av. Salud 123, Ciudad</li>
              <li>Teléfono: (+54) 11 1234-5678</li>
              <li>Email: <a href="mailto:info@miconsultorio.example" className="hover:text-[#4DD0E1]">info@miconsultorio.example</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20">
          <p className="text-center text-sm text-white">© 2025 Medigestion. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

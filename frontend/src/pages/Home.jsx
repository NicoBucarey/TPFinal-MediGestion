import React from 'react';
import InfoCard from '../components/InfoCard';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <img
          src="/images/hero.png"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            Atención médica cercana, cuando la necesites
          </h1>
          <p className="mt-4 text-white/90 max-w-2xl">Agenda tu turno en pocos pasos con profesionales calificados.</p>
          <div className="mt-6">
            <a href="/dashboard/turnos/nuevo" className="inline-block bg-[#00796B] hover:bg-[#00695c] text-white px-6 py-3 rounded-md shadow-md font-medium">
              Agendar turno
            </a>
          </div>
        </div>
      </section>

      {/* Tarjetas informativas estilo MayoClinic */}
      <section className="container mx-auto px-4 py-16">
        <div className="space-y-12">
          {/* Primera tarjeta */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <img 
                  src="/images/tarjeta1.png"
                  alt="Agenda tus turnos"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Agenda tus turnos online
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Reserva tu consulta médica de forma rápida y sencilla. 
                  Elige el profesional, la fecha y el horario que mejor se adapte a tu agenda.
                  Sin llamadas, sin esperas.
                </p>
                <div>
                  <a 
                    href="/dashboard/turnos/nuevo" 
                    className="inline-block bg-[#00796B] text-white px-8 py-3 rounded-lg hover:bg-[#00695c] transition-colors duration-200"
                  >
                    Conocer más
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Segunda tarjeta */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row-reverse">
              <div className="md:w-1/2">
                <img 
                  src="/images/tarjeta2.png"
                  alt="Gestión profesional"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Portal Profesional
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Gestiona tu agenda médica, accede a historias clínicas y optimiza 
                  tu práctica profesional con nuestras herramientas especializadas.
                </p>
                <div>
                  <a 
                    href="/dashboard/disponibilidad" 
                    className="inline-block bg-[#00796B] text-white px-8 py-3 rounded-lg hover:bg-[#00695c] transition-colors duration-200"
                  >
                    Conocer más
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ubicaciones */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Nuestras ubicaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold">Consultorio Centro</h3>
              <p className="text-sm text-gray-600">Av. Salud 123, Ciudad</p>
              <div className="mt-3 w-full h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">Mapa (mini)</div>
            </div>

            <div className="p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold">Sucursal Norte</h3>
              <p className="text-sm text-gray-600">Calle Norte 456, Ciudad</p>
              <div className="mt-3 w-full h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">Mapa (mini)</div>
            </div>

            <div className="p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold">Sucursal Sur</h3>
              <p className="text-sm text-gray-600">Boulevard Sur 789, Ciudad</p>
              <div className="mt-3 w-full h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">Mapa (mini)</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
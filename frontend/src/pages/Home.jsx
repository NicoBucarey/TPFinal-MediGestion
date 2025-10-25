import React from 'react';
import { UserGroupIcon, HeartIcon, ComputerDesktopIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

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
            Atención profesional cercana, cuando la necesites
          </h1>
          <p className="mt-4 text-white/90 max-w-2xl">
            Agenda tu turno en pocos pasos con profesionales calificados.
          </p>
          <div className="mt-6">
            <a
              href="/dashboard/turnos/nuevo"
              className="inline-block bg-[#00796B] hover:bg-[#00695c] text-white px-6 py-3 rounded-md shadow-md font-medium"
            >
              Agendar turno
            </a>
          </div>
        </div>
      </section>

      {/* Tarjetas informativas estilo MayoClinic */}
      <section className="container mx-auto px-4 py-16 space-y-12">
        {/* Primera tarjeta */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3">
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
              <p className="text-lg text-gray-600">
                Reserva tu consulta médica de forma rápida y sencilla. Elige el profesional, la fecha y el horario que mejor se adapte a tu agenda. Sin llamadas, sin esperas. Además, recibe recordatorios automáticos, consulta tu historial de turnos y reprograma o cancela cuando lo necesites.
              </p>
            </div>
          </div>
        </div>

        {/* Segunda tarjeta enfocada en paciente */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row-reverse">
            <div className="md:w-1/3">
              <img
                src="/images/tarjeta2.png"
                alt="Experiencia del paciente"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Experiencia del paciente
              </h3>
              <p className="text-lg text-gray-600">
                Gestiona tus turnos periódicos y consulta tu historial médico de forma sencilla. 
                Realiza seguimiento post-consulta, encuentra profesionales según tus necesidades y accede a toda la información de tu atención en un solo lugar. 
                Todo pensado para que tu experiencia como paciente sea rápida, clara y confiable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores del consultorio */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Nuestros valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Valor 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl shadow-md">
              <UserGroupIcon className="w-12 h-12 mb-4 text-[#00796B]" />
              <h3 className="text-xl font-semibold mb-2">Profesionalismo</h3>
              <p className="text-gray-600">
                Atención calificada por profesionales capacitados y con experiencia.
              </p>
            </div>

            {/* Valor 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl shadow-md">
              <HeartIcon className="w-12 h-12 mb-4 text-[#00796B]" />
              <h3 className="text-xl font-semibold mb-2">Cercanía</h3>
              <p className="text-gray-600">
                Trato cercano y humano, pensando siempre en el bienestar del paciente.
              </p>
            </div>

            {/* Valor 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl shadow-md">
              <ComputerDesktopIcon className="w-12 h-12 mb-4 text-[#00796B]" />
              <h3 className="text-xl font-semibold mb-2">Tecnología</h3>
              <p className="text-gray-600">
                Herramientas modernas para agendar, registrar y dar seguimiento a consultas.
              </p>
            </div>

            {/* Valor 4 */}
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl shadow-md">
              <ShieldCheckIcon className="w-12 h-12 mb-4 text-[#00796B]" />
              <h3 className="text-xl font-semibold mb-2">Confianza</h3>
              <p className="text-gray-600">
                Seguridad y confidencialidad en la gestión de datos y atención médica.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

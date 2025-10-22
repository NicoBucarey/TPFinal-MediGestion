const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a MediGestion
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tu plataforma integral para la gestión de turnos médicos
          </p>
          
          <div className="flex justify-center">
            <img
              src="/src/assets/medical-team.gif"
              alt="Medical Team"
              className="rounded-lg shadow-lg mb-8 max-w-2xl"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Para Pacientes
              </h3>
              <p className="text-gray-600 mb-4">
                Gestiona tus turnos médicos de forma fácil y rápida. Accede a tu historia clínica en cualquier momento.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Para Profesionales
              </h3>
              <p className="text-gray-600 mb-4">
                Administra tu agenda, consulta historias clínicas y mantén un seguimiento de tus pacientes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Para Secretarios
              </h3>
              <p className="text-gray-600 mb-4">
                Organiza la agenda de los profesionales y gestiona los turnos de manera eficiente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home
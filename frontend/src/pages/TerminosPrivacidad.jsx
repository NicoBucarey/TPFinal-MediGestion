import { Link } from 'react-router-dom';
import { ShieldCheckIcon, DocumentTextIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const TerminosPrivacidad = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-teal-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <ShieldCheckIcon className="h-16 w-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Términos y Privacidad</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Tu confianza es nuestra prioridad. Conocé cómo protegemos tus datos y qué derechos tenés al usar MediGestión.
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
          {/* Términos de Uso */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <DocumentTextIcon className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Términos de Uso</h2>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. Aceptación</h3>
                <p className="text-sm leading-relaxed">
                  Al usar MediGestión aceptás estos términos. Si no estás de acuerdo, no utilices la plataforma.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">2. Uso del sistema</h3>
                <p className="text-sm leading-relaxed">
                  MediGestión permite gestionar turnos, historias clínicas y comunicación entre pacientes y profesionales. El contenido médico es responsabilidad de los profesionales autorizados.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3. Obligaciones del usuario</h3>
                <p className="text-sm leading-relaxed mb-2">
                  Debés:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>Brindar datos reales</li>
                  <li>Proteger tus credenciales</li>
                  <li>Usar el sistema de forma legal y respetuosa</li>
                  <li>No acceder a información que no corresponda a tu rol</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">4. Limitaciones</h3>
                <p className="text-sm leading-relaxed">
                  MediGestión no brinda diagnósticos ni reemplaza la atención médica. En emergencias, contactá a los servicios locales.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">5. Disponibilidad</h3>
                <p className="text-sm leading-relaxed">
                  Buscamos operar 24/7, pero pueden existir interrupciones por mantenimiento o factores externos.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Política de Privacidad */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <LockClosedIcon className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Política de Privacidad</h2>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. Datos que recopilamos</h3>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>Datos personales (nombre, DNI, contacto)</li>
                  <li>Información médica cargada por profesionales</li>
                  <li>Datos de uso y técnicos para seguridad</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">2. Cómo usamos los datos</h3>
                <p className="text-sm leading-relaxed">
                  Para gestionar turnos, registros médicos, notificaciones, soporte y cumplimiento legal. No generamos perfiles comerciales.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3. Seguridad</h3>
                <p className="text-sm leading-relaxed">
                  Cifrado, control de acceso por roles, autenticación segura y respaldos periódicos.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">4. Con quién se comparte</h3>
                <p className="text-sm leading-relaxed mb-2">
                  Solo con:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>Profesionales autorizados</li>
                  <li>Proveedores técnicos necesarios (sin acceso a datos médicos)</li>
                  <li>Autoridades legales cuando corresponda</li>
                  <li>Con tu consentimiento</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">5. Derechos del usuario</h3>
                <p className="text-sm leading-relaxed">
                  Podés solicitar acceso, corrección, eliminación (según normativa), limitación o portabilidad de tus datos.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">6. Conservación</h3>
                <p className="text-sm leading-relaxed">
                  Los datos médicos se guardan según ley vigente; los administrativos mientras la cuenta esté activa y el plazo legal lo requiera.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">7. Cookies</h3>
                <p className="text-sm leading-relaxed">
                  Solo utilizamos cookies esenciales para el funcionamiento del sistema.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">8. Actualizaciones</h3>
                <p className="text-sm leading-relaxed">
                  Podemos modificar estos términos. La versión vigente se publica en esta página.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Contacto */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">¿Tenés preguntas?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Si tenés consultas sobre estos términos o nuestra política de privacidad, no dudes en contactarnos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/ubicaciones" className="btn-primary text-sm">
                Ver ubicaciones
              </Link>
              <Link to="/" className="btn-secondary text-sm">
                Volver al inicio
              </Link>
            </div>
          </div>

          {/* Última actualización */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TerminosPrivacidad;

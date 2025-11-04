import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Definir las tarjetas según el rol del usuario
  const getCardsForRole = (role) => {
    switch (role) {
      case 'admin':
        return [
          {
            title: 'Gestión de Usuarios',
            description: 'Administrar usuarios del sistema',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            to: '/dashboard/usuarios/gestion'
          }
        ];
      case 'secretario':
          return [
            {
              title: 'Gestión de Turnos',
              description: 'Administrar turnos y agenda',
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/turnos/nuevo`
            },
            {
              title: 'Turnos Periódicos',
              description: 'Administrar turnos periódicos',
              icon: 'M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z',
              to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/turnos/periodico/nuevo`
            },
            {
              title: 'Gestión de Pacientes',
              description: 'Administrar pacientes',
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
              to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/secretario/pacientes`
            },
            {
              title: 'Agenda',
              description: 'Ver y gestionar la agenda',
              icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
              to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/secretario/agenda`
            }
          ];
      case 'profesional':
        return [
          {
            title: 'Mis Turnos',
            description: 'Ver y gestionar tus turnos',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/profesional/turnos`
          },
          {
            title: 'Gestión de Disponibilidad',
            description: 'Configura tu disponibilidad',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/disponibilidad`
          },
          {
            title: 'Mis Pacientes',
            description: 'Ver y gestionar tus pacientes',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/profesional/pacientes`
          },
          {
            title: 'Historias Clínicas',
            description: 'Accede a las historias clínicas',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/profesional/historias`
          },
          {
            title: 'Seguimientos',
            description: 'Gestiona los seguimientos post-consulta',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/profesional/seguimientos`
          },
          {
            title: 'Documentos',
            description: 'Accede a tus documentos médicos',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/profesional/documentos`
          }
        ];
      case 'paciente':
        return [
          {
            title: 'Mis Turnos',
            description: 'Ver y gestionar tus turnos',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/paciente/turnos`
          },
          {
            title: 'Buscar Profesional',
            description: 'Encuentra y agenda con profesionales',
            icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/paciente/buscar-profesional`
          },
          {
            title: 'Mis Seguimientos',
            description: 'Gestiona tus seguimientos post-consulta',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/paciente/seguimientos`
          },
          {
            title: 'Mis Documentos',
            description: 'Accede a tus documentos médicos',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/paciente/documentos`
          },
          {
            title: 'Mi Historia Clínica',
            description: 'Consulta tu historia clínica',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            to: `${import.meta.env.VITE_DASHBOARD_BASE || ''}/dashboard/paciente/historia`
          }
        ];
      default:
        return [];
    }
  };

  const cards = getCardsForRole(user?.rol);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Panel de Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.to}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d={card.icon} />
              </svg>
              <h3 className="text-xl font-semibold ml-3">{card.title}</h3>
            </div>
            <p className="text-gray-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
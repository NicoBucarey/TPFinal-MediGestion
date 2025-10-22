import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const userRole = user?.rol;

  const menuItems = {
    admin: [
      { 
        to: '/dashboard/admin', 
        label: 'Dashboard', 
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' 
      },
      { 
        to: '/dashboard/admin/users', 
        label: 'Gestión de Usuarios',
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      },
      { 
        to: '/dashboard/admin/reports', 
        label: 'Reportes',
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      }
    ],
    secretario: [
      { 
        to: '/dashboard/turnos/nuevo', 
        label: 'Gestión de Turnos',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      { 
        to: '/dashboard/secretario/pacientes', 
        label: 'Gestión de Pacientes',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
      },
      { 
        to: '/dashboard/secretario/agenda', 
        label: 'Agenda',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      }
    ],
    profesional: [
      { 
        to: '/dashboard/profesional/turnos', 
        label: 'Mis Turnos',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      {
        to: '/dashboard/disponibilidad',
        label: 'Gestión de Disponibilidad',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      { 
        to: '/dashboard/profesional/pacientes', 
        label: 'Mis Pacientes',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
      },
      { 
        to: '/dashboard/profesional/historias', 
        label: 'Historias Clínicas',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      }
    ],
    paciente: [
      { 
        to: '/dashboard/paciente/turnos', 
        label: 'Mis Turnos',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      { 
        to: '/dashboard/paciente/nuevo-turno', 
        label: 'Sacar Turno',
        icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      { 
        to: '/dashboard/paciente/historia', 
        label: 'Mi Historia Clínica',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      }
    ]
  };

  const roleMenu = menuItems[userRole] || [];

  console.log('Sidebar render:', {
    userRole,
    availableMenuItems: roleMenu,
    currentPath: location.pathname
  });

  return (
    <div className="h-full bg-white w-64 shadow-md">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {roleMenu.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <svg
                  className={`${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-5 w-5`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
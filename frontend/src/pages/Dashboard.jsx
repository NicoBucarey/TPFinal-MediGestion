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
            to: '/dashboard/turnos/nuevo'
          }
        ];
      case 'profesional':
        return [
          {
            title: 'Mis Consultas',
            description: 'Ver agenda de consultas',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            to: '/dashboard/consultas'
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
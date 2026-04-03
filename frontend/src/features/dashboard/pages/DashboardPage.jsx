import { useAuthStore } from '../../../stores/authStore';
import DashboardPageLayout from '../components/DashboardPageLayout';
import RecepcionTurnos from '../../recepcion/components/RecepcionTurnos';
import ProfesionalTurnosHoy from '../components/sections/ProfesionalTurnosHoy';
import PacienteProximosTurnos from '../components/sections/PacienteProximosTurnos';
import {
  useDashboardAdmin,
  useDashboardProfesional,
  useDashboardSecretario,
  useDashboardPaciente
} from '../../../hooks/dashboard';

const DashboardPage = () => {
  const { user } = useAuthStore();

  const adminDashboard = useDashboardAdmin({ enabled: user?.rol === 'admin' });
  const profesionalDashboard = useDashboardProfesional({ enabled: user?.rol === 'profesional' });
  const secretarioDashboard = useDashboardSecretario({ enabled: user?.rol === 'secretario' });
  const pacienteDashboard = useDashboardPaciente({ enabled: user?.rol === 'paciente' });

  const dashboardData =
    user?.rol === 'admin'
      ? adminDashboard
      : user?.rol === 'profesional'
        ? profesionalDashboard
        : user?.rol === 'secretario'
          ? secretarioDashboard
          : user?.rol === 'paciente'
            ? pacienteDashboard
            : null;

  const { stats, actions, loading } = dashboardData || {};

  const title = `Bienvenido, ${user?.nombre || ''} ${user?.apellido || ''}`.trim();
  const subtitle = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const renderExtraSection = () => {
    if (user?.rol === 'profesional') {
      return <ProfesionalTurnosHoy loading={loading} turnos={dashboardData?.turnosHoy || []} />;
    }

    if (user?.rol === 'secretario') {
      return (
        <div className="mb-8">
          <RecepcionTurnos />
        </div>
      );
    }

    if (user?.rol === 'paciente') {
      return <PacienteProximosTurnos loading={loading} turnos={dashboardData?.proximosTurnos || []} />;
    }

    return null;
  };

  if (!user?.rol || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardPageLayout
      title={title}
      subtitle={subtitle}
      stats={stats}
      actions={actions}
      actionsGridClass={user?.rol === 'admin' || user?.rol === 'secretario' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}
    >
      {renderExtraSection()}
    </DashboardPageLayout>
  );
};

export default DashboardPage;

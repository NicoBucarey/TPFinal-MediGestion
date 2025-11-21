import RecepcionTurnos from '../../components/recepcion/RecepcionTurnos';

const RecepcionPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Recepción de Turnos</h1>
        <p className="mt-2 text-gray-600">
          Gestiona los turnos del día actual - confirmaciones, cancelaciones y asistencias
        </p>
      </div>
      
      <RecepcionTurnos />
    </div>
  );
};

export default RecepcionPage;
/**
 * PacienteSeleccionadoCard
 * Shows the selected patient's info and a "Cambiar paciente" link.
 * Shared by all secretary booking flows (turno, periódico, teleconsulta).
 *
 * Props:
 *   paciente  – object  – { nombre, apellido, dni, email }
 *   onCambiar – fn      – called when the user wants to pick a different patient
 */
const PacienteSeleccionadoCard = ({ paciente, onCambiar, hideChange = false }) => (
  <div className="mb-6">
    <h2 className="text-lg font-medium mb-2">Paciente Seleccionado</h2>
    <div className="grid grid-cols-2 gap-4 text-gray-600">
      <p><span className="font-medium">Nombre:</span> {paciente.nombre}</p>
      <p><span className="font-medium">Apellido:</span> {paciente.apellido}</p>
      <p><span className="font-medium">DNI:</span> {paciente.dni}</p>
      <p><span className="font-medium">Email:</span> {paciente.email}</p>
    </div>
    {!hideChange && (
      <button
        onClick={onCambiar}
        className="mt-4 text-blue-600 hover:text-blue-800"
      >
        Cambiar paciente
      </button>
    )}
  </div>
);

export default PacienteSeleccionadoCard;

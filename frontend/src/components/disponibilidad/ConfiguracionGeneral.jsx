const ConfiguracionGeneral = ({ configuracion, onChange }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...configuracion,
      [name]: parseInt(value, 10)
    });
  };

  return (
    <div className="max-w-sm">
      <label className="block text-sm font-medium text-gray-700">
        Duración de turnos (minutos)
      </label>
      <select
        name="duracionTurno"
        value={configuracion.duracionTurno}
        onChange={handleInputChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="15">15 minutos</option>
        <option value="30">30 minutos</option>
        <option value="45">45 minutos</option>
        <option value="60">1 hora</option>
      </select>
    </div>
  );
};

export default ConfiguracionGeneral;
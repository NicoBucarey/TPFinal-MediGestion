import { useState } from 'react';

const BusquedaPaciente = ({ onPacienteSelect }) => {
  const [criterio, setCriterio] = useState('apellido');
  const [busqueda, setBusqueda] = useState('');
  const [pacientes, setPacientes] = useState([]);

  const handleSearch = async () => {
    try {
      console.log('Buscando paciente con criterio:', criterio, 'valor:', busqueda);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/pacientes/buscar?${criterio}=${busqueda}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error de servidor:', errorData);
        return;
      }
      const data = await response.json();
      console.log('Pacientes encontrados:', data);
      setPacientes(data);
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      // TODO: Implementar manejo de errores
    }
  };

  const handlePacienteClick = (paciente) => {
    if (onPacienteSelect) {
      onPacienteSelect(paciente);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex gap-4 mb-6">
        <select
          value={criterio}
          onChange={(e) => setCriterio(e.target.value)}
          className="block w-32 rounded-lg border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="dni">DNI</option>
          <option value="apellido">Apellido</option>
          <option value="email">Correo</option>
        </select>
        
        <input
          type="text"
          placeholder={`Buscar por ${criterio}`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="flex-1 rounded-lg border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Buscar
        </button>
      </div>

      {pacientes.length > 0 && (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6">DNI</th>
                <th scope="col" className="py-3 px-6">Apellido</th>
                <th scope="col" className="py-3 px-6">Nombre</th>
                <th scope="col" className="py-3 px-6">Correo</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr
                  key={paciente.id_usuario}
                  onClick={() => handlePacienteClick(paciente)}
                  className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-4 px-6">{paciente.dni}</td>
                  <td className="py-4 px-6">{paciente.apellido}</td>
                  <td className="py-4 px-6">{paciente.nombre}</td>
                  <td className="py-4 px-6">{paciente.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BusquedaPaciente;
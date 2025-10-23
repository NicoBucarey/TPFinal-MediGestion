import { useState } from 'react';
import { toast } from 'sonner';

const BusquedaPaciente = ({ onPacienteSelect }) => {
  const [busqueda, setBusqueda] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!busqueda.trim()) {
      setPacientes([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/pacientes/buscar?termino=${busqueda}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error de servidor:', errorData);
        toast.error('Error al buscar pacientes');
        return;
      }
      
      const data = await response.json();
      console.log('Pacientes encontrados:', data);
      setPacientes(data);
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      toast.error('Error al buscar pacientes');
    } finally {
      setLoading(false);
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
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por DNI, apellido o correo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="w-full rounded-lg border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
          />
          {loading && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
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
      
      {pacientes.length === 0 && busqueda.trim() !== '' && !loading && (
        <div className="text-center text-gray-500 mt-4">
          No se encontraron pacientes
        </div>
      )}
    </div>
  );
};

export default BusquedaPaciente;
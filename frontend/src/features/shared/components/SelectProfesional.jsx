import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getProfesionales } from '../../../services/bookingService';

const SelectProfesional = ({ value, onChange, className = '' }) => {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        const profesionalesData = await getProfesionales();
        setProfesionales(profesionalesData);
      } catch (error) {
        console.error('Error al cargar profesionales:', error);
        toast.error('No se pudieron cargar los profesionales');
      } finally {
        setLoading(false);
      }
    };

    cargarProfesionales();
  }, []);

  if (loading) {
    return (
      <select disabled className={`${className} cursor-not-allowed`}>
        <option value="">Cargando profesionales...</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={onChange}
      className={className}
      required
    >
      <option value="">Seleccione un profesional</option>
      {profesionales.map(prof => (
        <option key={prof.id_usuario} value={prof.id_usuario}>
          {prof.nombre} {prof.apellido} - {prof.profesion} - {prof.especialidad}
        </option>
      ))}
    </select>
  );
};

export default SelectProfesional;

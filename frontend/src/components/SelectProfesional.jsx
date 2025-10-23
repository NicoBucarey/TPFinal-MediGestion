import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const SelectProfesional = ({ value, onChange, className = '' }) => {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        // Obtener el token del localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await axios.get('/api/profesionales', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Respuesta de profesionales:', response.data);
        
        if (Array.isArray(response.data)) {
          setProfesionales(response.data);
        } else if (response.data.profesionales && Array.isArray(response.data.profesionales)) {
          setProfesionales(response.data.profesionales);
        } else {
          console.error('La respuesta no tiene el formato esperado:', response.data);
          toast.error('Error en el formato de datos de profesionales');
        }
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

  const getFullName = (profesional) => `${profesional.nombre} ${profesional.apellido} - ${profesional.especialidad}`;

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
          {prof.nombre} {prof.apellido} - {prof.especialidad}
        </option>
      ))}
    </select>
  );
};

export default SelectProfesional;
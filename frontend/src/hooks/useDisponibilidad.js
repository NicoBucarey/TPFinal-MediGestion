import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const useDisponibilidad = () => {
  const { user, token } = useAuthStore();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  const obtenerConfiguracion = async () => {
    if (!user?.id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_URL}/disponibilidad/${user.id}`,
        { headers: getHeaders() }
      );
      
      // Transformar el array de horarios a objeto
      const horariosObj = {};
      if (response.data.horarios) {
        response.data.horarios.forEach(horario => {
          horariosObj[horario.dia_semana] = {
            activo: horario.activo,
            horaInicio: horario.hora_inicio,
            horaFin: horario.hora_fin
          };
        });
      }

      return {
        horarios: horariosObj,
        configuracion: response.data.configuracion
      };
    } catch (error) {
      setError(error.response?.data?.error || 'Error al obtener la configuración');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const guardarConfiguracion = async ({ configuracion, horarios }) => {
    if (!user?.id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Asegurarnos de que tenemos todos los días de la semana
      const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
      const horariosCompletos = {};
      
      diasSemana.forEach(dia => {
        horariosCompletos[dia] = horarios[dia] || {
          activo: false,
          horaInicio: '09:00',
          horaFin: '17:00'
        };
      });

      await axios.post(
        `${API_URL}/disponibilidad/${user.id}`,
        {
          configuracion,
          horarios: horariosCompletos
        },
        { headers: getHeaders() }
      );

      return true;
    } catch (error) {
      console.error('Error al guardar:', error);
      setError(error.response?.data?.error || 'Error al guardar la configuración');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const obtenerExcepciones = async () => {
    if (!user?.id) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_URL}/disponibilidad/${user.id}/excepciones`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Error al obtener las excepciones');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const agregarExcepcion = async (excepcion) => {
    if (!user?.id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_URL}/disponibilidad/${user.id}/excepciones`,
        excepcion,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Error al agregar la excepción');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const eliminarExcepcion = async (idExcepcion) => {
    if (!user?.id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(
        `${API_URL}/disponibilidad/${user.id}/excepciones/${idExcepcion}`,
        { headers: getHeaders() }
      );
      return true;
    } catch (error) {
      setError(error.response?.data?.error || 'Error al eliminar la excepción');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    obtenerConfiguracion,
    guardarConfiguracion,
    obtenerExcepciones,
    agregarExcepcion,
    eliminarExcepcion,
  };
};

export default useDisponibilidad;
const pool = require('../db');

const disponibilidadUtils = {
    validarDisponibilidad: async (idProfesional, fecha, horaInicio, horaFin) => {
        try {
            const diaSemana = new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
            
            // 1. Verificar disponibilidad regular del profesional
            const disponibilidadQuery = await pool.query(
                `SELECT * FROM disponibilidad 
                 WHERE id_profesional = $1 
                 AND dia_semana = $2 
                 AND hora_inicio <= $3 
                 AND hora_fin >= $4
                 AND activo = true`,
                [idProfesional, diaSemana, horaInicio, horaFin]
            );

            if (disponibilidadQuery.rows.length === 0) {
                return {
                    disponible: false,
                    mensaje: "El profesional no tiene disponibilidad en ese horario"
                };
            }

            // 2. Verificar excepciones
            const excepcionQuery = await pool.query(
                `SELECT * FROM disponibilidad_excepciones 
                 WHERE id_profesional = $1 
                 AND fecha = $2
                 AND (
                     tipo = 'no_disponible' OR 
                     (tipo = 'horario_especial' AND 
                      (hora_inicio > $3 OR hora_fin < $4))
                 )`,
                [idProfesional, fecha, horaInicio, horaFin]
            );

            if (excepcionQuery.rows.length > 0) {
                return {
                    disponible: false,
                    mensaje: "El profesional tiene una excepción en ese horario"
                };
            }

            // 3. Verificar superposición con otros turnos
            const turnosQuery = await pool.query(
                `SELECT * FROM turno 
                 WHERE id_profesional = $1 
                 AND fecha = $2 
                 AND estado != 'cancelado'
                 AND (
                     (hora_inicio <= $3 AND hora_fin > $3) OR
                     (hora_inicio < $4 AND hora_fin >= $4) OR
                     (hora_inicio >= $3 AND hora_fin <= $4)
                 )`,
                [idProfesional, fecha, horaInicio, horaFin]
            );

            if (turnosQuery.rows.length > 0) {
                return {
                    disponible: false,
                    mensaje: "Ya existe un turno en ese horario"
                };
            }

            return {
                disponible: true,
                mensaje: "Horario disponible"
            };
        } catch (error) {
            console.error('Error en validarDisponibilidad:', error);
            throw new Error('Error al validar disponibilidad');
        }
    },

    validarDisponibilidadPeriodica: async (idProfesional, fechaInicio, fechaFin, horaInicio, horaFin, tipoPeriodicidad, diaSemana) => {
        try {
            // Generar todas las fechas según la periodicidad
            const fechas = generarFechasPeriodicas(fechaInicio, fechaFin, tipoPeriodicidad, diaSemana);
            
            const resultados = [];
            
            // Validar cada fecha individualmente
            for (const fecha of fechas) {
                const resultado = await disponibilidadUtils.validarDisponibilidad(
                    idProfesional,
                    fecha,
                    horaInicio,
                    horaFin
                );

                if (!resultado.disponible) {
                    resultados.push({
                        fecha,
                        ...resultado
                    });
                }
            }

            // Si hay fechas no disponibles, retornarlas
            if (resultados.length > 0) {
                return {
                    disponible: false,
                    conflictos: resultados
                };
            }

            return {
                disponible: true,
                mensaje: "Todas las fechas están disponibles"
            };
        } catch (error) {
            console.error('Error en validarDisponibilidadPeriodica:', error);
            throw new Error('Error al validar disponibilidad periódica');
        }
    }
};

// Función auxiliar para generar fechas según periodicidad
function generarFechasPeriodicas(fechaInicio, fechaFin, tipoPeriodicidad, diaSemana) {
    const fechas = [];
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    const diasSemana = {
        'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3,
        'jueves': 4, 'viernes': 5, 'sabado': 6
    };

    let fecha = new Date(inicio);
    
    while (fecha <= fin) {
        if (tipoPeriodicidad === 'libre') {
            fechas.push(fecha.toISOString().split('T')[0]);
            fecha.setDate(fecha.getDate() + 1);
        } else if (fecha.getDay() === diasSemana[diaSemana.toLowerCase()]) {
            fechas.push(fecha.toISOString().split('T')[0]);
            
            switch (tipoPeriodicidad) {
                case 'semanal':
                    fecha.setDate(fecha.getDate() + 7);
                    break;
                case 'quincenal':
                    fecha.setDate(fecha.getDate() + 14);
                    break;
                case 'mensual':
                    fecha.setMonth(fecha.getMonth() + 1);
                    break;
                default:
                    fecha.setDate(fecha.getDate() + 1);
            }
        } else {
            fecha.setDate(fecha.getDate() + 1);
        }
    }
    
    return fechas;
}

module.exports = disponibilidadUtils;
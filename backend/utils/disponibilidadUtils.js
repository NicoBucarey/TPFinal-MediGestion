const pool = require('../db');

const parseLocalDate = (dateInput) => {
    if (dateInput instanceof Date) {
        return new Date(
            dateInput.getFullYear(),
            dateInput.getMonth(),
            dateInput.getDate(),
            12,
            0,
            0,
            0
        );
    }

    if (typeof dateInput === 'number') {
        const fromTimestamp = new Date(dateInput);
        return new Date(
            fromTimestamp.getFullYear(),
            fromTimestamp.getMonth(),
            fromTimestamp.getDate(),
            12,
            0,
            0,
            0
        );
    }

    if (typeof dateInput === 'string') {
        const [year, month, day] = dateInput.split('-').map(Number);
        if (!year || !month || !day) {
            throw new Error(`Fecha inválida: ${dateInput}`);
        }
        return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    throw new Error(`Formato de fecha no soportado: ${typeof dateInput}`);
};

const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const disponibilidadUtils = {
    validarDisponibilidad: async (idProfesional, fecha, horaInicio, horaFin) => {
        try {
            const fechaNormalizada = formatLocalDate(parseLocalDate(fecha));

            // Obtener día de la semana y normalizarlo (sin acentos)
            const diaSemanaCompleto = parseLocalDate(fechaNormalizada)
                .toLocaleDateString('es-ES', { weekday: 'long' })
                .toLowerCase();
            const diaSemana = diaSemanaCompleto
                .replace('á', 'a')
                .replace('é', 'e')
                .replace('í', 'i')
                .replace('ó', 'o')
                .replace('ú', 'u');
            
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
                [idProfesional, fechaNormalizada, horaInicio, horaFin]
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
                     (hora_inicio < $3 AND hora_fin > $3) OR
                     (hora_inicio < $4 AND hora_fin > $4) OR
                     (hora_inicio >= $3 AND hora_fin <= $4)
                 )`,
                [idProfesional, fechaNormalizada, horaInicio, horaFin]
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
    const inicio = parseLocalDate(fechaInicio);
    const fin = parseLocalDate(fechaFin);
    
    // Normalizar el nombre del día (quita tildes y pasa a minúsculas)
    function normalizarDia(dia) {
        return dia
            .toLowerCase()
            .replace('á', 'a')
            .replace('é', 'e')
            .replace('í', 'i')
            .replace('ó', 'o')
            .replace('ú', 'u');
    }

    const diasSemana = {
        'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3,
        'jueves': 4, 'viernes': 5, 'sabado': 6
    };

    let fecha = new Date(inicio);
    const diaSemanaNormalizado = normalizarDia(diaSemana);

    while (fecha <= fin) {
        if (tipoPeriodicidad === 'libre') {
            fechas.push(formatLocalDate(fecha));
            fecha.setDate(fecha.getDate() + 1);
        } else if (fecha.getDay() === diasSemana[diaSemanaNormalizado]) {
            fechas.push(formatLocalDate(fecha));
            
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

// Expuesto para tests unitarios de lógica de periodicidad
disponibilidadUtils._generarFechasPeriodicas = generarFechasPeriodicas;

module.exports = disponibilidadUtils;
const pool = require('../db');
const TurnoModel = require('../model/turnoModel');
const { validarDisponibilidad, validarDisponibilidadPeriodica } = require('../utils/disponibilidadUtils');

const TurnoPeriodicoController = {
    crearTurnoPeriodico: async (req, res) => {
        try {
            const { 
                profesionalId, 
                pacienteId, 
                tipoPeriodicidad,
                diaSemana,
                horaInicio,
                horaFin,
                fechaInicio,
                fechaFin 
            } = req.body;

            // Validar que la fecha fin no exceda 2 meses desde fecha inicio
            const fechaInicioObj = new Date(fechaInicio);
            const fechaFinObj = new Date(fechaFin);
            const dosMesesDespues = new Date(fechaInicioObj);
            dosMesesDespues.setMonth(dosMesesDespues.getMonth() + 2);

            if (fechaFinObj > dosMesesDespues) {
                return res.status(400).json({ 
                    error: 'La fecha fin no puede exceder 2 meses desde la fecha de inicio' 
                });
            }

            // Iniciar transacción
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Crear el turno periódico
                const turnoPeriodico = await client.query(
                    `INSERT INTO turno_periodico 
                    (id_profesional, id_paciente, tipo_periodicidad, dia_semana, 
                     hora_inicio, hora_fin, fecha_inicio, fecha_fin, estado)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING *`,
                    [profesionalId, pacienteId, tipoPeriodicidad, diaSemana,
                     horaInicio, horaFin, fechaInicio, fechaFin, 'activo']
                );

                // Validar disponibilidad para todas las fechas
                const validacion = await validarDisponibilidadPeriodica(
                    profesionalId,
                    fechaInicio,
                    fechaFin,
                    horaInicio,
                    horaFin,
                    tipoPeriodicidad,
                    diaSemana
                );

                if (!validacion.disponible) {
                    return res.status(400).json({
                        error: 'Existen conflictos en algunas fechas',
                        conflictos: validacion.conflictos
                    });
                }

                // Generar las instancias de turnos según la periodicidad
                const fechasGeneradas = generarFechasTurnos(
                    fechaInicio,
                    fechaFin,
                    tipoPeriodicidad,
                    diaSemana
                );

                // Crear los turnos individuales y sus relaciones
                for (const fecha of fechasGeneradas) {
                    // Validar disponibilidad para cada fecha
                    const disponible = await validarDisponibilidad(
                        profesionalId, 
                        fecha, 
                        horaInicio, 
                        horaFin
                    );

                    if (!disponible) {
                        continue; // Saltar fechas no disponibles
                    }

                    // Crear turno individual
                    const turnoIndividual = await client.query(
                        `INSERT INTO turno 
                        (id_profesional, id_paciente, fecha, hora_inicio, hora_fin, estado)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING *`,
                        [profesionalId, pacienteId, fecha, horaInicio, horaFin, 'pendiente']
                    );

                    // Crear relación en turno_periodico_instancia
                    await client.query(
                        `INSERT INTO turno_periodico_instancia 
                        (id_turno, id_turno_periodico)
                        VALUES ($1, $2)`,
                        [turnoIndividual.rows[0].id_turno, turnoPeriodico.rows[0].id_turno_periodico]
                    );
                }

                await client.query('COMMIT');
                res.status(201).json({
                    mensaje: "Turno periódico creado exitosamente",
                    turnoPeriodico: turnoPeriodico.rows[0]
                });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error en TurnoPeriodicoController.crearTurnoPeriodico:', error);
            res.status(500).json({ error: 'Error al crear el turno periódico' });
        }
    },

    obtenerTurnosPeriodicosProfesional: async (req, res) => {
        try {
            const { id } = req.params;
            
            const resultado = await pool.query(
                `SELECT tp.*, 
                        u.nombre as paciente_nombre, 
                        u.apellido as paciente_apellido,
                        (SELECT COUNT(*) FROM turno_periodico_instancia tpi 
                         JOIN turno t ON tpi.id_turno = t.id_turno 
                         WHERE tpi.id_turno_periodico = tp.id_turno_periodico 
                         AND t.estado = 'pendiente') as turnos_pendientes
                 FROM turno_periodico tp
                 JOIN paciente p ON tp.id_paciente = p.id_paciente
                 JOIN usuario u ON p.id_paciente = u.id_usuario
                 WHERE tp.id_profesional = $1 AND tp.estado = 'activo'
                 ORDER BY tp.fecha_inicio`,
                [id]
            );

            res.json(resultado.rows);
        } catch (error) {
            console.error('Error en TurnoPeriodicoController.obtenerTurnosPeriodicosProfesional:', error);
            res.status(500).json({ error: 'Error al obtener los turnos periódicos' });
        }
    },

    obtenerTurnosPeriodicosPaciente: async (req, res) => {
        try {
            const { id } = req.params;
            
            const resultado = await pool.query(
                `SELECT tp.*, 
                        u.nombre as profesional_nombre, 
                        u.apellido as profesional_apellido,
                        (SELECT COUNT(*) FROM turno_periodico_instancia tpi 
                         JOIN turno t ON tpi.id_turno = t.id_turno 
                         WHERE tpi.id_turno_periodico = tp.id_turno_periodico 
                         AND t.estado = 'pendiente') as turnos_pendientes
                 FROM turno_periodico tp
                 JOIN profesional p ON tp.id_profesional = p.id_profesional
                 JOIN usuario u ON p.id_profesional = u.id_usuario
                 WHERE tp.id_paciente = $1 AND tp.estado = 'activo'
                 ORDER BY tp.fecha_inicio`,
                [id]
            );

            res.json(resultado.rows);
        } catch (error) {
            console.error('Error en TurnoPeriodicoController.obtenerTurnosPeriodicosPaciente:', error);
            res.status(500).json({ error: 'Error al obtener los turnos periódicos' });
        }
    },

    cancelarTurnoPeriodico: async (req, res) => {
        try {
            const { id } = req.params;
            const { cancelarSoloFuturos } = req.query;

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Actualizar estado del turno periódico
                await client.query(
                    'UPDATE turno_periodico SET estado = $1 WHERE id_turno_periodico = $2',
                    ['cancelado', id]
                );

                // Cancelar turnos individuales
                if (cancelarSoloFuturos) {
                    await client.query(
                        `UPDATE turno t
                         SET estado = 'cancelado'
                         FROM turno_periodico_instancia tpi
                         WHERE tpi.id_turno = t.id_turno
                         AND tpi.id_turno_periodico = $1
                         AND t.fecha > CURRENT_DATE`,
                        [id]
                    );
                } else {
                    await client.query(
                        `UPDATE turno t
                         SET estado = 'cancelado'
                         FROM turno_periodico_instancia tpi
                         WHERE tpi.id_turno = t.id_turno
                         AND tpi.id_turno_periodico = $1`,
                        [id]
                    );
                }

                await client.query('COMMIT');
                res.json({ mensaje: "Turno periódico cancelado exitosamente" });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error en TurnoPeriodicoController.cancelarTurnoPeriodico:', error);
            res.status(500).json({ error: 'Error al cancelar el turno periódico' });
        }
    }
};

// Función auxiliar para generar las fechas según la periodicidad
function generarFechasTurnos(fechaInicio, fechaFin, tipoPeriodicidad, diaSemana) {
    const fechas = [];
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Mapear nombres de días a números (0 = Domingo, 1 = Lunes, etc.)
    const diasSemana = {
        'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3,
        'jueves': 4, 'viernes': 5, 'sabado': 6
    };

    let fecha = new Date(inicio);
    
    while (fecha <= fin) {
        if (tipoPeriodicidad === 'libre') {
            fechas.push(new Date(fecha));
        } else {
            if (fecha.getDay() === diasSemana[diaSemana.toLowerCase()]) {
                fechas.push(new Date(fecha));
                
                // Ajustar el incremento según la periodicidad
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
                }
                continue;
            }
        }
        fecha.setDate(fecha.getDate() + 1);
    }
    
    return fechas;
}

module.exports = TurnoPeriodicoController;
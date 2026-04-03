const pool = require('../db');
const TurnoModel = require('../model/turnoModel');
const { validarDisponibilidad, validarDisponibilidadPeriodica } = require('../utils/disponibilidadUtils');

async function crearTurnoPeriodico(req, res) {
    try {
        const { 
            profesionalId, 
            pacienteId, 
            tipoPeriodicidad,
            diaSemana: diaSemanaOriginal,
            horaInicio,
            horaFin,
            fechaInicio,
            fechaFin 
        } = req.body;

        // Normalizar día de la semana (quitar tildes)
        const diaSemana = diaSemanaOriginal
            .toLowerCase()
            .replace('á', 'a')
            .replace('é', 'e')
            .replace('í', 'i')
            .replace('ó', 'o')
            .replace('ú', 'u');

        console.log(`🔧 TURNO PERIODICO - Día original: ${diaSemanaOriginal}, Día normalizado: ${diaSemana}`);

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

            // Guardar datos para el mensaje grupal
            let turnosPeriodicosParaMensaje = [];
            for (const fecha of fechasGeneradas) {
                // Validar disponibilidad para cada fecha
                const disponible = await validarDisponibilidad(
                    profesionalId, 
                    fecha, 
                    horaInicio, 
                    horaFin
                );
                if (!disponible.disponible) continue; // Saltar fechas no disponibles

                // Crear turno individual
                const turno = await TurnoModel.crearTurno({
                    profesionalId,
                    pacienteId,
                    fecha,
                    horaInicio,
                    horaFin
                });

                turnosPeriodicosParaMensaje.push({
                    fecha: turno.fecha,
                    hora_inicio: turno.hora_inicio,
                    profesional_nombre: turno.profesional_nombre || '',
                    profesional_apellido: turno.profesional_apellido || ''
                });

                // Crear relación en turno_periodico_instancia
                await client.query(
                    `INSERT INTO turno_periodico_instancia 
                    (id_turno, id_turno_periodico)
                    VALUES ($1, $2)`,
                    [turno.id_turno, turnoPeriodico.rows[0].id_turno_periodico]
                );
            }

            // Enviar mensaje grupal de confirmación
            try {
                const WhatsAppService = require('../services/whatsappService');

                const pacienteRes = await pool.query(
                    `SELECT nombre, apellido, telefono FROM usuario WHERE id_usuario = $1`,
                    [pacienteId]
                );
                const profesionalRes = await pool.query(
                    `SELECT nombre, apellido FROM usuario WHERE id_usuario = $1`,
                    [profesionalId]
                );

                const paciente = pacienteRes.rows[0];
                const profesional = profesionalRes.rows[0];

                                let mensaje = WhatsAppService.generarMensajeConfirmacionPeriodico(
                                    turnosPeriodicosParaMensaje,
                                    paciente,
                                    profesional
                                );

                if (paciente.telefono) {
                    await WhatsAppService.enviarMensaje(paciente.telefono, mensaje);
                    await pool.query(
                        `INSERT INTO recordatorio (id_turno, fecha_envio, mensaje, tipo, estado)
                         VALUES ($1, NOW(), $2, $3, $4)`,
                        [null, mensaje, 'periodico', 'enviado']
                    );
                }
            } catch (err) {
                console.error('Error al enviar recordatorio WhatsApp grupal:', err);
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
        console.error('Error en crearTurnoPeriodico:', error);
        res.status(500).json({ error: 'Error al crear el turno periódico' });
    }
}

async function obtenerTurnosPeriodicosProfesional(req, res) {
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
        console.error('Error en obtenerTurnosPeriodicosProfesional:', error);
        res.status(500).json({ error: 'Error al obtener los turnos periódicos' });
    }
}

async function obtenerTurnosPeriodicosPaciente(req, res) {
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
        console.error('Error en obtenerTurnosPeriodicosPaciente:', error);
        res.status(500).json({ error: 'Error al obtener los turnos periódicos' });
    }
}

async function cancelarTurnoPeriodico(req, res) {
    try {
        const { id } = req.params;
        const { cancelarSoloFuturos } = req.query;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                'UPDATE turno_periodico SET estado = $1 WHERE id_turno_periodico = $2',
                ['cancelado', id]
            );

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
        console.error('Error en cancelarTurnoPeriodico:', error);
        res.status(500).json({ error: 'Error al cancelar el turno periódico' });
    }
}

// Función auxiliar
function generarFechasTurnos(fechaInicio, fechaFin, tipoPeriodicidad, diaSemana) {
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
            fechas.push(new Date(fecha));
        } else {
            if (fecha.getDay() === diasSemana[diaSemana.toLowerCase()]) {
                fechas.push(new Date(fecha));
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

const TurnoPeriodicoController = {
    crearTurnoPeriodico,
    obtenerTurnosPeriodicosProfesional,
    obtenerTurnosPeriodicosPaciente,
    cancelarTurnoPeriodico
};

module.exports = TurnoPeriodicoController;

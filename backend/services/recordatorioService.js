const pool = require('../db');
const WhatsAppService = require('./whatsappService');

const RecordatorioService = {
    /**
     * Crear recordatorio de confirmación inmediata
     * @param {number} idTurno - ID del turno
     */
    crearRecordatorioConfirmacion: async (idTurno) => {
        try {
            // Obtener datos del turno, paciente y profesional
            const query = `
                SELECT 
                    t.id_turno,
                    t.fecha,
                    t.hora_inicio,
                    t.hora_fin,
                    p.nombre as paciente_nombre,
                    p.apellido as paciente_apellido,
                    p.telefono as paciente_telefono,
                    prof.nombre as profesional_nombre,
                    prof.apellido as profesional_apellido
                FROM turno t
                JOIN usuario p ON t.id_paciente = p.id_usuario
                JOIN usuario prof ON t.id_profesional = prof.id_usuario
                WHERE t.id_turno = $1
            `;
            
            const result = await pool.query(query, [idTurno]);
            
            if (result.rows.length === 0) {
                throw new Error('Turno no encontrado');
            }

            const turno = result.rows[0];
            
            // Generar mensaje personalizado
            const mensaje = WhatsAppService.generarMensajeConfirmacion(
                {
                    fecha: turno.fecha,
                    hora_inicio: turno.hora_inicio,
                    hora_fin: turno.hora_fin
                },
                {
                    nombre: turno.paciente_nombre,
                    apellido: turno.paciente_apellido
                },
                {
                    nombre: turno.profesional_nombre,
                    apellido: turno.profesional_apellido
                }
            );

            // Crear recordatorio en la BD
            const recordatorio = await pool.query(
                `INSERT INTO recordatorio 
                (id_turno, fecha_envio, mensaje, tipo, estado) 
                VALUES ($1, NOW(), $2, $3, $4) 
                RETURNING *`,
                [idTurno, mensaje, 'confirmacion', 'pendiente']
            );

            // Enviar mensaje por WhatsApp
            if (turno.paciente_telefono) {
                const envio = await WhatsAppService.enviarMensaje(
                    turno.paciente_telefono,
                    mensaje
                );

                // Actualizar estado del recordatorio
                if (envio.success) {
                    await pool.query(
                        `UPDATE recordatorio 
                        SET estado = 'enviado' 
                        WHERE id_recordatorio = $1`,
                        [recordatorio.rows[0].id_recordatorio]
                    );
                } else {
                    await pool.query(
                        `UPDATE recordatorio 
                        SET estado = 'fallido', 
                            error_mensaje = $1,
                            intentos = intentos + 1
                        WHERE id_recordatorio = $2`,
                        [envio.error, recordatorio.rows[0].id_recordatorio]
                    );
                }

                return {
                    success: envio.success,
                    recordatorio: recordatorio.rows[0]
                };
            }

            return {
                success: false,
                error: 'Paciente no tiene teléfono registrado',
                recordatorio: recordatorio.rows[0]
            };
        } catch (error) {
            console.error('Error al crear recordatorio de confirmación:', error);
            throw error;
        }
    },

    /**
     * Crear recordatorio para 24h antes del turno
     * @param {number} idTurno - ID del turno
     */
    crearRecordatorio24h: async (idTurno) => {
        try {
            // Obtener datos del turno
            const query = `
                SELECT 
                    t.id_turno,
                    t.fecha,
                    t.hora_inicio,
                    t.hora_fin,
                    p.nombre as paciente_nombre,
                    p.apellido as paciente_apellido,
                    p.telefono as paciente_telefono,
                    prof.nombre as profesional_nombre,
                    prof.apellido as profesional_apellido
                FROM turno t
                JOIN usuario p ON t.id_paciente = p.id_usuario
                JOIN usuario prof ON t.id_profesional = prof.id_usuario
                WHERE t.id_turno = $1
            `;
            
            const result = await pool.query(query, [idTurno]);
            
            if (result.rows.length === 0) {
                throw new Error('Turno no encontrado');
            }

            const turno = result.rows[0];
            
            // Generar mensaje de recordatorio
            const mensaje = WhatsAppService.generarMensajeRecordatorio24h(
                {
                    fecha: turno.fecha,
                    hora_inicio: turno.hora_inicio,
                    hora_fin: turno.hora_fin
                },
                {
                    nombre: turno.paciente_nombre,
                    apellido: turno.paciente_apellido
                },
                {
                    nombre: turno.profesional_nombre,
                    apellido: turno.profesional_apellido
                }
            );

            // Calcular fecha de envío (24h antes del turno)
            const fechaEnvio = new Date(turno.fecha);
            fechaEnvio.setDate(fechaEnvio.getDate() - 1);

            // Crear recordatorio en la BD
            const recordatorio = await pool.query(
                `INSERT INTO recordatorio 
                (id_turno, fecha_envio, mensaje, tipo, estado) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [idTurno, fechaEnvio, mensaje, 'recordatorio_24h', 'pendiente']
            );

            return {
                success: true,
                recordatorio: recordatorio.rows[0]
            };
        } catch (error) {
            console.error('Error al crear recordatorio 24h:', error);
            throw error;
        }
    },

    /**
     * Procesar recordatorios pendientes (ejecutado por cron)
     */
    procesarRecordatoriosPendientes: async () => {
        try {
            // Buscar recordatorios pendientes cuya fecha de envío ya pasó
            const query = `
                SELECT 
                    r.id_recordatorio,
                    r.id_turno,
                    r.mensaje,
                    t.fecha,
                    t.hora_inicio,
                    p.telefono as paciente_telefono,
                    p.nombre as paciente_nombre
                FROM recordatorio r
                JOIN turno t ON r.id_turno = t.id_turno
                JOIN usuario p ON t.id_paciente = p.id_usuario
                WHERE r.estado = 'pendiente' 
                AND r.tipo = 'recordatorio_24h'
                AND r.fecha_envio <= NOW()
                AND r.intentos < 3
            `;

            const result = await pool.query(query);

            console.log(`Procesando ${result.rows.length} recordatorios pendientes...`);

            for (const recordatorio of result.rows) {
                if (recordatorio.paciente_telefono) {
                    // Enviar mensaje
                    const envio = await WhatsAppService.enviarMensaje(
                        recordatorio.paciente_telefono,
                        recordatorio.mensaje
                    );

                    // Actualizar estado
                    if (envio.success) {
                        await pool.query(
                            `UPDATE recordatorio 
                            SET estado = 'enviado' 
                            WHERE id_recordatorio = $1`,
                            [recordatorio.id_recordatorio]
                        );
                        console.log(`Recordatorio enviado a ${recordatorio.paciente_nombre}`);
                    } else {
                        await pool.query(
                            `UPDATE recordatorio 
                            SET estado = 'fallido', 
                                error_mensaje = $1,
                                intentos = intentos + 1
                            WHERE id_recordatorio = $2`,
                            [envio.error, recordatorio.id_recordatorio]
                        );
                        console.error(`Error al enviar recordatorio: ${envio.error}`);
                    }
                } else {
                    console.warn(`Paciente ${recordatorio.paciente_nombre} no tiene teléfono`);
                }
            }

            return {
                procesados: result.rows.length
            };
        } catch (error) {
            console.error('Error al procesar recordatorios pendientes:', error);
            throw error;
        }
    }
};

module.exports = RecordatorioService;

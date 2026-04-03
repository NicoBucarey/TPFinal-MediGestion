const TurnoModel = require('../model/turnoModel');

const TeleconsultaController = {
  crearTeleconsulta: async (req, res) => {
    try {
      const { profesionalId, pacienteId, fechaHora, motivoConsulta, tipo = 'teleconsulta' } = req.body;

      console.log('Datos recibidos para crear teleconsulta:', { profesionalId, pacienteId, fechaHora, motivoConsulta, tipo });

      if (!profesionalId || !pacienteId || !fechaHora) {
        return res.status(400).json({ error: 'Faltan datos requeridos: profesionalId, pacienteId, fechaHora' });
      }

      // Convertir la fecha y hora recibidas a los formatos necesarios
      const fechaObj = new Date(fechaHora);
      const fecha = fechaObj.toISOString().split('T')[0];
      const horaInicio = fechaObj.toTimeString().split(' ')[0];
      const horaFin = new Date(fechaObj.getTime() + 30 * 60000).toTimeString().split(' ')[0];

      console.log('Fecha y hora procesadas:', { fecha, horaInicio, horaFin });

      // Generar enlace de reunión único
      const linkReunion = generarLinkReunion(profesionalId, pacienteId, fechaObj);
      
      const teleconsulta = await TurnoModel.crearTurno({
        profesionalId,
        pacienteId,
        fecha,
        horaInicio,
        horaFin,
        tipo: 'teleconsulta',
        linkReunion,
        plataforma: 'jitsi'
      });

      console.log('Teleconsulta creada:', teleconsulta);

      // Enviar recordatorio por WhatsApp (no bloqueante)
      setImmediate(async () => {
        try {
          const RecordatorioService = require('../services/recordatorioService');
          await RecordatorioService.crearRecordatorioConfirmacion(teleconsulta.id_turno);
        } catch (err) {
          console.error('Error al enviar recordatorio WhatsApp para teleconsulta (no crítico):', err.message);
        }
      });

      res.status(201).json({
        message: 'Teleconsulta creada exitosamente',
        turno: teleconsulta
      });
    } catch (error) {
      console.error('Error al crear teleconsulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  obtenerTeleconsultas: async (req, res) => {
    try {
      const { rol } = req.user;
      const userId = req.user.id;

      let query, queryParams;

      if (rol === 'paciente') {
        query = `
          SELECT 
            t.id_turno,
            t.fecha,
            t.hora_inicio,
            t.hora_fin,
            t.tipo,
            t.link_reunion,
            t.plataforma,
            t.estado,
            u_prof.nombre as profesional_nombre,
            u_prof.apellido as profesional_apellido,
            p.especialidad as profesional_especialidad
          FROM turno t
          JOIN profesional p ON t.id_profesional = p.id_profesional
          JOIN usuario u_prof ON t.id_profesional = u_prof.id_usuario
          WHERE t.id_paciente = $1 AND t.tipo = 'teleconsulta'
          ORDER BY t.fecha DESC, t.hora_inicio DESC
        `;
        queryParams = [userId];
      } else if (rol === 'profesional') {
        query = `
          SELECT 
            t.id_turno,
            t.fecha,
            t.hora_inicio,
            t.hora_fin,
            t.tipo,
            t.link_reunion,
            t.plataforma,
            t.estado,
            u_pac.nombre as paciente_nombre,
            u_pac.apellido as paciente_apellido,
            u_pac.email as paciente_email,
            u_pac.telefono as paciente_telefono
          FROM turno t
          JOIN usuario u_pac ON t.id_paciente = u_pac.id_usuario
          WHERE t.id_profesional = $1 AND t.tipo = 'teleconsulta'
          ORDER BY t.fecha DESC, t.hora_inicio DESC
        `;
        queryParams = [userId];
      } else if (rol === 'secretario') {
        query = `
          SELECT 
            t.id_turno,
            t.fecha,
            t.hora_inicio,
            t.hora_fin,
            t.tipo,
            t.link_reunion,
            t.plataforma,
            t.estado,
            u_pac.nombre as paciente_nombre,
            u_pac.apellido as paciente_apellido,
            u_pac.email as paciente_email,
            u_pac.telefono as paciente_telefono,
            u_prof.nombre as profesional_nombre,
            u_prof.apellido as profesional_apellido,
            p.especialidad as profesional_especialidad
          FROM turno t
          JOIN usuario u_pac ON t.id_paciente = u_pac.id_usuario
          JOIN profesional p ON t.id_profesional = p.id_profesional
          JOIN usuario u_prof ON t.id_profesional = u_prof.id_usuario
          WHERE t.tipo = 'teleconsulta'
          ORDER BY t.fecha DESC, t.hora_inicio DESC
        `;
        queryParams = [];
      } else {
        return res.status(403).json({ error: 'No tienes permisos para ver teleconsultas' });
      }

      const pool = require('../db');
      const result = await pool.query(query, queryParams);

      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener teleconsultas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

// Función auxiliar para generar enlace de reunión
function generarLinkReunion(profesionalId, pacienteId, fecha) {
  const timestamp = fecha.getTime();
  const roomId = `teleconsulta-${profesionalId}-${pacienteId}-${timestamp}`;
  return `https://meet.jit.si/${roomId}`;
}

module.exports = TeleconsultaController;
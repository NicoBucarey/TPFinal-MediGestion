const path = require('path');
const pool = require('../db');

const ClinicaController = {
  // POST /api/clinica/nota
  crearNotaClinica: async (req, res) => {
    const { turnoId, nota } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    if (!turnoId || !nota) {
      return res.status(400).json({ message: 'turnoId y nota son requeridos' });
    }
    if (userRole !== 'profesional') {
      return res.status(403).json({ message: 'Solo profesionales pueden registrar notas clínicas' });
    }

    try {
      // Validar turno y propiedad del profesional
      const turnoRes = await pool.query(
        `SELECT t.id_turno, t.id_profesional, t.id_paciente, t.fecha, t.hora_inicio, t.hora_fin, t.estado,
                u.nombre as pac_nombre, u.apellido as pac_apellido
         FROM turno t
         JOIN paciente p ON p.id_paciente = t.id_paciente
         JOIN usuario u ON u.id_usuario = p.id_paciente
         WHERE t.id_turno = $1`,
        [turnoId]
      );

      if (turnoRes.rows.length === 0) {
        return res.status(404).json({ message: 'Turno no encontrado' });
      }
      const turno = turnoRes.rows[0];
      if (turno.id_profesional !== userId) {
        return res.status(403).json({ message: 'No tiene permisos para registrar nota en este turno' });
      }

      // Validar estado del turno: solo 'confirmado' permite registrar nota
      if (!turno.estado || String(turno.estado).toLowerCase() !== 'confirmado') {
        return res.status(400).json({ message: 'Solo se puede registrar nota para turnos confirmados' });
      }

      // Crear nota clínica
      const notaRes = await pool.query(
        'INSERT INTO nota_clinica (id_turno, detalle) VALUES ($1, $2) RETURNING id_nota_clinica, fecha_creacion',
        [turnoId, nota]
      );

      const idNota = notaRes.rows[0].id_nota_clinica;

      // Procesar archivos si existen
      const files = req.files || [];
      const documentos = [];
      for (const f of files) {
        const tipoDoc = f.mimetype.startsWith('image/') ? 'imagen' : (f.mimetype === 'application/pdf' ? 'pdf' : 'otro');
        const relativeUrl = `/uploads/${path.basename(f.path)}`;
        const docRes = await pool.query(
          `INSERT INTO documento_medico (id_turno, id_profesional, tipo_documento, url)
           VALUES ($1, $2, $3, $4)
           RETURNING id_documento, tipo_documento, url, fecha, compartido_con_paciente`,
          [turnoId, userId, tipoDoc, relativeUrl]
        );
        documentos.push(docRes.rows[0]);
      }

      res.status(201).json({
        message: 'Nota clínica guardada correctamente',
        nota: {
          id: idNota,
          turnoId: turnoId,
          paciente: `${turno.pac_nombre} ${turno.pac_apellido}`,
          fecha: notaRes.rows[0].fecha_creacion
        },
        documentos
      });
    } catch (error) {
      console.error('Error crearNotaClinica:', error);
      res.status(500).json({ message: 'Error al guardar la nota clínica' });
    }
  },

  // GET /api/clinica/turno/:id
  obtenerTurnoDetalle: async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();
    try {
      const q = await pool.query(
        `SELECT t.*, 
                up.nombre as pac_nombre, up.apellido as pac_apellido,
                ur.nombre as prof_nombre, ur.apellido as prof_apellido
         FROM turno t
         JOIN usuario up ON up.id_usuario = t.id_paciente
         JOIN usuario ur ON ur.id_usuario = t.id_profesional
         WHERE t.id_turno = $1`,
        [id]
      );
      if (q.rows.length === 0) return res.status(404).json({ message: 'Turno no encontrado' });
      const turno = q.rows[0];
      if (userRole === 'profesional' && turno.id_profesional !== userId) {
        return res.status(403).json({ message: 'No autorizado para este turno' });
      }
      res.json(turno);
    } catch (e) {
      console.error('Error obtenerTurnoDetalle:', e);
      res.status(500).json({ message: 'Error al obtener el turno' });
    }
  },

  // GET /api/clinica/paciente/:id/historial
  obtenerHistorialPaciente: async (req, res) => {
    const { id } = req.params; // pacienteId
    const { desde, hasta, tipo, profesionalId } = req.query;
    const userRole = req.user?.rol?.toLowerCase();
    const userId = req.user?.id;
    try {
      // Autorización básica: profesionales pueden ver cualquier paciente; pacientes solo su propio historial
      if (userRole === 'paciente' && userId !== Number(id)) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      const params = [id];
      let whereDate = '';
      if (desde) { params.push(desde); whereDate += ` AND n.fecha_creacion >= $${params.length}`; }
      if (hasta) { params.push(hasta); whereDate += ` AND n.fecha_creacion <= $${params.length}`; }

      const paramsDoc = [id];
      let whereDocDate = '';
      if (desde) { paramsDoc.push(desde); whereDocDate += ` AND d.fecha >= $${paramsDoc.length}`; }
      if (hasta) { paramsDoc.push(hasta); whereDocDate += ` AND d.fecha <= $${paramsDoc.length}`; }
      if (profesionalId) { paramsDoc.push(profesionalId); whereDocDate += ` AND t.id_profesional = $${paramsDoc.length}`; }

      const notasQ = await pool.query(
        `SELECT n.id_nota_clinica as id, 'nota' as tipo, n.detalle, n.fecha_creacion as fecha,
                t.id_turno, t.id_profesional,
                up.nombre || ' ' || up.apellido as paciente,
                ur.nombre || ' ' || ur.apellido as profesional
         FROM nota_clinica n
         JOIN turno t ON t.id_turno = n.id_turno
         JOIN usuario up ON up.id_usuario = t.id_paciente
         JOIN usuario ur ON ur.id_usuario = t.id_profesional
         WHERE t.id_paciente = $1 ${whereDate}
        `, params);

      const docsQ = await pool.query(
        `SELECT d.id_documento as id, 'documento' as tipo, d.tipo_documento, d.url, d.fecha,
                t.id_turno, t.id_profesional,
                up.nombre || ' ' || up.apellido as paciente,
                ur.nombre || ' ' || ur.apellido as profesional,
                d.compartido_con_paciente as compartido
         FROM documento_medico d
         JOIN turno t ON t.id_turno = d.id_turno
         JOIN usuario up ON up.id_usuario = t.id_paciente
         JOIN usuario ur ON ur.id_usuario = t.id_profesional
         WHERE t.id_paciente = $1 ${whereDocDate}
        `, paramsDoc);

      let items = [...notasQ.rows, ...docsQ.rows];
      if (tipo === 'nota') items = items.filter(i => i.tipo === 'nota');
      if (tipo === 'documento') items = items.filter(i => i.tipo === 'documento');
      items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      res.json(items);
    } catch (e) {
      console.error('Error obtenerHistorialPaciente:', e);
      res.status(500).json({ message: 'Error al obtener historial' });
    }
  },

  // GET /api/clinica/documentos
  listarDocumentos: async (req, res) => {
    const { pacienteId, tipo, compartido } = req.query;
    const params = [];
    let where = ' WHERE 1=1 ';
    if (pacienteId) { where += ` AND t.id_paciente = $${params.length + 1}`; params.push(pacienteId); }
    if (tipo) { where += ` AND d.tipo_documento = $${params.length + 1}`; params.push(tipo); }
    if (compartido != null) { where += ` AND d.compartido_con_paciente = $${params.length + 1}`; params.push(compartido === 'true'); }
    try {
      const q = await pool.query(
        `SELECT d.id_documento, d.tipo_documento, d.url, d.fecha, d.compartido_con_paciente,
                up.nombre || ' ' || up.apellido as paciente,
                ur.nombre || ' ' || ur.apellido as profesional
         FROM documento_medico d
         JOIN turno t ON t.id_turno = d.id_turno
         JOIN usuario up ON up.id_usuario = t.id_paciente
         JOIN usuario ur ON ur.id_usuario = t.id_profesional
         ${where}
         ORDER BY d.fecha DESC`,
        params
      );
      res.json(q.rows);
    } catch (e) {
      console.error('Error listarDocumentos:', e);
      res.status(500).json({ message: 'Error al listar documentos' });
    }
  },

  // PATCH /api/clinica/documentos/:id/compartir
  toggleCompartirDocumento: async (req, res) => {
    const { id } = req.params;
    const { compartido } = req.body;
    try {
      const q = await pool.query(
        'UPDATE documento_medico SET compartido_con_paciente = $1 WHERE id_documento = $2 RETURNING id_documento, compartido_con_paciente',
        [!!compartido, id]
      );
      if (q.rows.length === 0) return res.status(404).json({ message: 'Documento no encontrado' });
      res.json(q.rows[0]);
    } catch (e) {
      console.error('Error toggleCompartirDocumento:', e);
      res.status(500).json({ message: 'Error al actualizar estado de documento' });
    }
  },

  // GET /api/clinica/documentos/compartidos - Para pacientes
  obtenerDocumentosCompartidos: async (req, res) => {
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    if (userRole !== 'paciente') {
      return res.status(403).json({ message: 'Solo pacientes pueden acceder a sus documentos compartidos' });
    }

    try {
      const { tipo } = req.query;
      let where = ' WHERE t.id_paciente = $1 AND d.compartido_con_paciente = true ';
      const params = [userId];

      if (tipo) {
        where += ` AND d.tipo_documento = $${params.length + 1}`;
        params.push(tipo);
      }

      const q = await pool.query(
        `SELECT d.id_documento, d.tipo_documento, d.url, d.fecha, d.compartido_con_paciente,
                ur.nombre || ' ' || ur.apellido as profesional,
                t.id_turno, t.fecha as fecha_turno
         FROM documento_medico d
         JOIN turno t ON t.id_turno = d.id_turno
         JOIN usuario ur ON ur.id_usuario = t.id_profesional
         ${where}
         ORDER BY d.fecha DESC`,
        params
      );

      res.json(q.rows);
    } catch (e) {
      console.error('Error obtenerDocumentosCompartidos:', e);
      res.status(500).json({ message: 'Error al obtener documentos compartidos' });
    }
  }
};

module.exports = ClinicaController;

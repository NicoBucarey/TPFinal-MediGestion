const pool = require('../db');
const bcrypt = require('bcryptjs');

// Obtener perfil del usuario autenticado (adaptado a estructura real de tablas)
const obtenerPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol;

    let query;
    switch (userRole) {
      case 'profesional':
        query = `
          SELECT 
            u.nombre, u.apellido, u.telefono, u.mail AS email,
            NULL AS dni, NULL AS direccion, NULL AS fecha_nacimiento,
            p.profesion, p.especialidad
          FROM usuario u
          LEFT JOIN profesional p ON p.id_profesional = u.id_usuario
          WHERE u.id_usuario = $1
        `;
        break;
      case 'secretario':
        query = `
          SELECT 
            u.nombre, u.apellido, u.telefono, u.mail AS email,
            NULL AS dni, NULL AS direccion, NULL AS fecha_nacimiento
          FROM usuario u
          WHERE u.id_usuario = $1
        `;
        break;
      case 'paciente':
        query = `
          SELECT 
            u.nombre, u.apellido, u.telefono, u.mail AS email,
            p.dni, NULL AS direccion, p.fecha_nac AS fecha_nacimiento
          FROM usuario u
          LEFT JOIN paciente p ON p.id_paciente = u.id_usuario
          WHERE u.id_usuario = $1
        `;
        break;
      default:
        return res.status(403).json({ error: 'Rol no autorizado para ver perfil' });
    }

    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    const row = result.rows[0];
    res.json({
      nombre: row.nombre || '',
      apellido: row.apellido || '',
      email: row.email || '',
      telefono: row.telefono || '',
      dni: row.dni || '',
      direccion: row.direccion || '',
      fecha_nacimiento: row.fecha_nacimiento || ''
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error.message);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

// Actualizar perfil del usuario autenticado
const actualizarPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol;
    const { nombre, apellido, email, telefono, dni, direccion, fecha_nacimiento } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email) {
      return res.status(400).json({ error: 'Nombre, apellido y email son obligatorios' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Actualizar datos básicos en usuario
      await client.query(
        'UPDATE usuario SET nombre = $1, apellido = $2, telefono = $3, mail = $4 WHERE id_usuario = $5',
        [nombre, apellido, telefono, email, userId]
      );

      // Determinar la tabla y actualizar según el rol
      // Actualizar datos específicos según rol
      if (userRole === 'paciente') {
        await client.query(
          'UPDATE paciente SET fecha_nac = $1, dni = $2 WHERE id_paciente = $3',
          [fecha_nacimiento || null, dni || null, userId]
        );
      }

      await client.query('COMMIT');

      res.json({ 
        message: 'Perfil actualizado correctamente',
        usuario: { nombre, apellido, email }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

// Actualizar contraseña del usuario autenticado
const actualizarPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { passwordActual, passwordNueva } = req.body;

    // Validaciones
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son obligatorias' });
    }

    if (passwordNueva.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar contraseña actual
    const userResult = await pool.query(
      'SELECT contrasenia FROM usuario WHERE id_usuario = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isValidPassword = await bcrypt.compare(passwordActual, userResult.rows[0].contrasenia);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(passwordNueva, 10);

    // Actualizar contraseña
    await pool.query(
      'UPDATE usuario SET contrasenia = $1 WHERE id_usuario = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  actualizarPassword
};

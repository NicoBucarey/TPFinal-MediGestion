const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const authController = {
  async verify(req, res) {
    try {
      // El middleware auth ya verificó el token, así que si llegamos aquí, el token es válido
      const user = req.user;
      
      // Obtener datos actualizados del usuario
      const result = await pool.query(
        'SELECT u.*, r.nombre as rol FROM usuario u JOIN rol r ON u.id_rol = r.id_rol WHERE u.id_usuario = $1',
        [user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const userData = result.rows[0];

      res.json({
        user: {
          id: userData.id_usuario,
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.mail,
          rol: userData.rol.toLowerCase()
        }
      });
    } catch (error) {
      console.error('Error en verify:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuario por email
      const result = await pool.query(
        'SELECT u.*, r.nombre as rol FROM usuario u JOIN rol r ON u.id_rol = r.id_rol WHERE u.mail = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const user = result.rows[0];

      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.contrasenia);
      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: user.id_usuario,
          rol: user.rol.toLowerCase() // Cambiado de 'role' a 'rol' para mantener consistencia
        },
        process.env.JWT_SECRET || 'tu_secreto_super_seguro',
        { expiresIn: '1d' }
      );

      res.json({
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.mail,
          rol: user.rol
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Función para crear el usuario administrador inicial
  async createInitialAdmin() {
    try {
      // Verificar si ya existe un admin
      const adminCheck = await pool.query(
        'SELECT * FROM usuario WHERE mail = $1',
        ['admin@medigestion.com']
      );

      if (adminCheck.rows.length > 0) {
        console.log('El usuario administrador ya existe');
        return;
      }

      // Obtener el id del rol admin
      const roleResult = await pool.query(
        'SELECT id_rol FROM rol WHERE nombre = $1',
        ['admin']
      );

      if (roleResult.rows.length === 0) {
        throw new Error('El rol de administrador no existe');
      }

      const adminRoleId = roleResult.rows[0].id_rol;

      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);

      // Insertar el usuario administrador
      await pool.query(
        'INSERT INTO usuario (nombre, apellido, telefono, mail, contrasenia, id_rol) VALUES ($1, $2, $3, $4, $5, $6)',
        ['Admin', 'Sistema', '0000000000', 'admin@medigestion.com', hashedPassword, adminRoleId]
      );

      console.log('Usuario administrador creado exitosamente');
    } catch (error) {
      console.error('Error al crear el usuario administrador:', error);
    }
  },

  // Crear usuario profesional o secretario (solo admin)
  async createStaffUser(req, res) {
    try {
      const { nombre, apellido, telefono, email, password, rol, profesion, especialidad } = req.body;
      
      // Verificar que el rol sea válido
      if (!['profesional', 'secretario'].includes(rol)) {
        return res.status(400).json({ message: 'Rol inválido' });
      }

      // Verificar que el email no exista
      const userCheck = await pool.query(
        'SELECT * FROM usuario WHERE mail = $1',
        [email]
      );

      if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      // Obtener el id del rol
      const roleResult = await pool.query(
        'SELECT id_rol FROM rol WHERE nombre = $1',
        [rol]
      );

      const roleId = roleResult.rows[0].id_rol;

      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Iniciar transacción
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insertar usuario
        const userResult = await client.query(
          'INSERT INTO usuario (nombre, apellido, telefono, mail, contrasenia, id_rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_usuario',
          [nombre, apellido, telefono, email, hashedPassword, roleId]
        );

        const userId = userResult.rows[0].id_usuario;

        // Si es profesional, insertar datos adicionales
        if (rol === 'profesional') {
          await client.query(
            'INSERT INTO profesional (id_profesional, profesion, especialidad) VALUES ($1, $2, $3)',
            [userId, profesion, especialidad]
          );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Usuario creado exitosamente' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear el usuario' });
    }
  },

  // Registro de pacientes
  async registerPatient(req, res) {
    try {
      const { 
        nombre, 
        apellido, 
        telefono, 
        email, 
        password,
        dni,
        fechaNacimiento
      } = req.body;

      // Verificar que el email y DNI no existan
      const userCheck = await pool.query(
        'SELECT * FROM usuario WHERE mail = $1',
        [email]
      );

      if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      const dniCheck = await pool.query(
        'SELECT p.* FROM paciente p WHERE p.dni = $1',
        [dni]
      );

      if (dniCheck.rows.length > 0) {
        return res.status(400).json({ message: 'El DNI ya está registrado' });
      }

      // Obtener el id del rol paciente
      const roleResult = await pool.query(
        'SELECT id_rol FROM rol WHERE nombre = $1',
        ['paciente']
      );

      const roleId = roleResult.rows[0].id_rol;

      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Iniciar transacción
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insertar usuario
        const userResult = await client.query(
          'INSERT INTO usuario (nombre, apellido, telefono, mail, contrasenia, id_rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_usuario',
          [nombre, apellido, telefono, email, hashedPassword, roleId]
        );

        const userId = userResult.rows[0].id_usuario;

        // Insertar paciente
        await client.query(
          'INSERT INTO paciente (id_paciente, fecha_nac, dni) VALUES ($1, $2, $3)',
          [userId, fechaNacimiento, dni]
        );

        await client.query('COMMIT');

        // Generar token JWT para login automático
        const token = jwt.sign(
          { 
            id: userId,
            rol: 'paciente'
          },
          process.env.JWT_SECRET || 'tu_secreto_super_seguro',
          { expiresIn: '1d' }
        );

        res.status(201).json({ 
          message: 'Paciente registrado exitosamente',
          token,
          user: {
            id: userId,
            nombre,
            apellido,
            email,
            rol: 'paciente'
          }
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error detallado en registro de paciente:', error);
      res.status(500).json({ 
        message: 'Error al registrar el paciente',
        error: error.message 
      });
    }
  }
};

module.exports = authController;
const pool = require('../db');

// Crear sucursal
exports.crearSucursal = async (req, res) => {
  try {
    const { numero, nombre, direccion, localidad, provincia, telefono, email, activa } = req.body;
    if (!numero || !direccion || !localidad || !provincia) {
      return res.status(400).json({ error: 'numero, direccion, localidad y provincia son obligatorios' });
    }
    const result = await pool.query(
      `INSERT INTO sucursal (numero, nombre, direccion, localidad, provincia, telefono, email, activa)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [numero, nombre || null, direccion, localidad, provincia, telefono || null, email || null, activa !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error crear sucursal:', error.message);
    res.status(500).json({ error: 'Error al crear sucursal' });
  }
};

// Listar sucursales
exports.listarSucursales = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sucursal ORDER BY id_sucursal DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error listar sucursales:', error.message);
    res.status(500).json({ error: 'Error al listar sucursales' });
  }
};

// Listado público (solo activas)
exports.listarSucursalesActivas = async (_req, res) => {
  try {
    const result = await pool.query('SELECT id_sucursal, numero, nombre, direccion, localidad, provincia FROM sucursal WHERE activa = true ORDER BY numero ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error listar sucursales activas:', error.message);
    res.status(500).json({ error: 'Error al listar sucursales activas' });
  }
};

// Obtener una sucursal
exports.obtenerSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM sucursal WHERE id_sucursal = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obtener sucursal:', error.message);
    res.status(500).json({ error: 'Error al obtener sucursal' });
  }
};

// Actualizar sucursal
exports.actualizarSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, nombre, direccion, localidad, provincia, telefono, email, activa } = req.body;
    const result = await pool.query(
      `UPDATE sucursal SET numero=$1, nombre=$2, direccion=$3, localidad=$4, provincia=$5, telefono=$6, email=$7, activa=$8
       WHERE id_sucursal=$9 RETURNING *`,
      [numero, nombre, direccion, localidad, provincia, telefono, email, activa, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizar sucursal:', error.message);
    res.status(500).json({ error: 'Error al actualizar sucursal' });
  }
};

// Desactivar / eliminar lógica (soft delete)
exports.desactivarSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE sucursal SET activa = false WHERE id_sucursal = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json({ message: 'Sucursal desactivada', sucursal: result.rows[0] });
  } catch (error) {
    console.error('Error desactivar sucursal:', error.message);
    res.status(500).json({ error: 'Error al desactivar sucursal' });
  }
};

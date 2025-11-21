const pool = require('../db');

// Crear sucursal (con soporte de imagen opcional)
exports.crearSucursal = async (req, res) => {
  try {
    const { numero, nombre, direccion, localidad, provincia, telefono, email } = req.body;
    const activaStr = req.body.activa;
    const activa = (activaStr === true || activaStr === 'true' || activaStr === '1' || activaStr === 1 || activaStr === 'on');
    if (!numero || !direccion || !localidad || !provincia) {
      return res.status(400).json({ error: 'numero, direccion, localidad y provincia son obligatorios' });
    }
    const imagenUrl = req.file ? `/uploads/sucursales/${req.file.filename}` : null;
    let result;
    try {
      result = await pool.query(
        `INSERT INTO sucursal (numero, nombre, direccion, localidad, provincia, telefono, email, activa, imagen_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [numero, nombre || null, direccion, localidad, provincia, telefono || null, email || null, activa, imagenUrl]
      );
    } catch (err) {
      if (err.code === '42703') { // undefined_column (imagen_url no existe aún)
        result = await pool.query(
          `INSERT INTO sucursal (numero, nombre, direccion, localidad, provincia, telefono, email, activa)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [numero, nombre || null, direccion, localidad, provincia, telefono || null, email || null, activa]
        );
      } else if (err.code === '23505') { // unique_violation
        return res.status(409).json({ error: 'El número de sucursal ya existe' });
      } else {
        throw err;
      }
    }
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error crear sucursal:', error.code, error.message);
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
    try {
      const result = await pool.query('SELECT id_sucursal, numero, nombre, direccion, localidad, provincia, imagen_url FROM sucursal WHERE activa = true ORDER BY numero ASC');
      return res.json(result.rows);
    } catch (err) {
      if (err.code === '42703') { // undefined_column: imagen_url no existe aún
        const result = await pool.query('SELECT id_sucursal, numero, nombre, direccion, localidad, provincia FROM sucursal WHERE activa = true ORDER BY numero ASC');
        const rows = result.rows.map(r => ({ ...r, imagen_url: null }));
        return res.json(rows);
      }
      throw err;
    }
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

// Actualizar sucursal (incluye reemplazo de imagen si se envía archivo)
exports.actualizarSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, nombre, direccion, localidad, provincia, telefono, email } = req.body;
    const activaStr = req.body.activa;
    const activa = (activaStr === true || activaStr === 'true' || activaStr === '1' || activaStr === 1 || activaStr === 'on');

    // Obtener imagen actual si no se envía nueva
    let imagenUrl;
    if (req.file) {
      imagenUrl = `/uploads/sucursales/${req.file.filename}`;
    } else {
      const current = await pool.query('SELECT imagen_url FROM sucursal WHERE id_sucursal = $1', [id]);
      if (current.rows.length === 0) return res.status(404).json({ error: 'Sucursal no encontrada' });
      imagenUrl = current.rows[0].imagen_url || null;
    }

    let result;
    try {
      result = await pool.query(
        `UPDATE sucursal SET numero=$1, nombre=$2, direccion=$3, localidad=$4, provincia=$5, telefono=$6, email=$7, activa=$8, imagen_url=$9
         WHERE id_sucursal=$10 RETURNING *`,
        [numero, nombre, direccion, localidad, provincia, telefono, email, activa, imagenUrl, id]
      );
    } catch (err) {
      if (err.code === '42703') { // undefined_column
        result = await pool.query(
          `UPDATE sucursal SET numero=$1, nombre=$2, direccion=$3, localidad=$4, provincia=$5, telefono=$6, email=$7, activa=$8
           WHERE id_sucursal=$9 RETURNING *`,
          [numero, nombre, direccion, localidad, provincia, telefono, email, activa, id]
        );
      } else if (err.code === '23505') {
        return res.status(409).json({ error: 'El número de sucursal ya existe' });
      } else {
        throw err;
      }
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sucursal no encontrada' });
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizar sucursal:', error.code, error.message);
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

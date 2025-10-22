const verifyToken = async (req, res) => {
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
        rol: userData.rol
      }
    });
  } catch (error) {
    console.error('Error en verify:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
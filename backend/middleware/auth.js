const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_super_seguro');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar roles
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Verificar autenticación
    
    if (!req.user || !req.user.rol) {
      return res.status(403).json({ message: 'Rol de usuario no encontrado' });
    }

    // Convertir todo a minúsculas para la comparación
    const userRole = req.user.rol.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    // Verificar autorización de roles

    if (!req.user || !normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Acceso denegado - Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};

// Middleware para verificar rol de admin
const adminMiddleware = (req, res, next) => {
  // Verificar permisos de administrador
  
  if (!req.user || !req.user.rol) {
    return res.status(403).json({ message: 'Rol de usuario no encontrado' });
  }
  
  const userRole = req.user.rol.toLowerCase();
  
  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado - Se requiere rol de administrador' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, checkRole };
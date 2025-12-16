const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function (req, res, next) {
  // 1. Leer el token del header
  // A veces el front lo manda como 'x-auth-token', a veces como 'Authorization: Bearer ...'
  let token = req.header('x-auth-token');
  
  // Si no viene en x-auth-token, miramos si viene como Bearer
  if (!token) {
      const bearerHeader = req.header('Authorization');
      if (bearerHeader) {
          token = bearerHeader.replace('Bearer ', '');
      }
  }

  // 2. Si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso denegado' });
  }

  // 3. Verificar el token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ASIGNACIÓN INTELIGENTE (Para evitar el error de ID undefined)
    if (decoded.user) {
        req.user = decoded.user; 
    } else {
        req.user = decoded;      
    }

    next();
  } catch (err) {
    console.error("Token Error:", err.message);
    res.status(401).json({ msg: 'Token no es válido' });
  }
};
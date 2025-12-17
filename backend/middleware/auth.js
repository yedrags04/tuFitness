const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function (req, res, next) {
  
  let token = req.header('x-auth-token');
  
  
  if (!token) {
      const bearerHeader = req.header('Authorization');
      if (bearerHeader) {
          token = bearerHeader.replace('Bearer ', '');
      }
  }

 
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso denegado' });
  }

  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
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
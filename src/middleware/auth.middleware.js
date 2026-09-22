const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifica el token JWT enviado en el header Authorization: Bearer <token>
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Formato de token inválido. Usa: Bearer <token>' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    req.usuario = decoded;
    next();
  });
}

module.exports = verifyToken;

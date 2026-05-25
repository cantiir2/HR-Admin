const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }
  if (!token) return res.status(401).json({ error: 'Token diperlukan' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid' });
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Hanya admin yang diizinkan' });
  }
  next();
};

module.exports = { authenticateToken, authenticateAdmin };

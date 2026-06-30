const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

module.exports = (prisma) => {
  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ error: 'Email atau password salah' });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(400).json({ error: 'Email atau password salah' });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, jobRoleCode: user.jobRoleCode },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name, jobRoleCode: user.jobRoleCode, profilePhoto: user.profilePhoto } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get Current User (Check Auth)
  router.get('/me', authenticateToken, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, role: true, name: true, jobRoleCode: true, profilePhoto: true }
      });
      if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Logout
  router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout berhasil' });
  });

  return router;
};

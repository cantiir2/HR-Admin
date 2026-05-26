const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

module.exports = (prisma) => {
  // ─── GET all system master entries (optionally filter by category) ───────
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const { category, isActive } = req.query;
      const where = {};
      if (category) where.category = category;
      if (isActive === 'true') where.isActive = true;
      if (isActive === 'false') where.isActive = false;

      const items = await prisma.systemMaster.findMany({
        where,
        orderBy: [{ category: 'asc' }, { code: 'asc' }]
      });
      res.json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ─── POST create new system master entry (Admin) ────────────────────────
  router.post('/', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { category, code, name, description } = req.body;
      if (!category || !code || !name) {
        return res.status(400).json({ error: 'Category, code, dan name wajib diisi' });
      }

      const item = await prisma.systemMaster.create({
        data: { category: category.toUpperCase(), code: code.toUpperCase(), name, description }
      });
      res.status(201).json(item);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Kombinasi category + code sudah ada' });
      }
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ─── PUT update system master entry (Admin) ──────────────────────────────
  router.put('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { name, description, isActive } = req.body;
      const item = await prisma.systemMaster.update({
        where: { id: req.params.id },
        data: { name, description, isActive }
      });
      res.json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ─── DELETE system master entry (Admin) ──────────────────────────────────
  router.delete('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      await prisma.systemMaster.delete({ where: { id: req.params.id } });
      res.json({ message: 'Berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

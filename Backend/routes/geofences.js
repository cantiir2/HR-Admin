const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

module.exports = (prisma) => {
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const geofences = await prisma.geofence.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(geofences);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const geofence = await prisma.geofence.findUnique({
        where: { id: req.params.id }
      });
      if (!geofence) {
        return res.status(404).json({ error: 'Geofence tidak ditemukan' });
      }
      res.json(geofence);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { name, description, location, latitude, longitude, isActive } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Nama area geofence wajib diisi' });
      }

      const geofence = await prisma.geofence.create({
        data: {
          name: name.trim(),
          description: description || null,
          location: location || null,
          latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
          longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : null,
          isActive: isActive !== undefined ? Boolean(isActive) : true
        }
      });
      res.status(201).json(geofence);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { name, description, location, latitude, longitude, isActive } = req.body;
      const existing = await prisma.geofence.findUnique({
        where: { id: req.params.id }
      });
      if (!existing) {
        return res.status(404).json({ error: 'Geofence tidak ditemukan' });
      }

      const updated = await prisma.geofence.update({
        where: { id: req.params.id },
        data: {
          name: name !== undefined ? name.trim() : existing.name,
          description: description !== undefined ? description : existing.description,
          location: location !== undefined ? location : existing.location,
          latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : (latitude === null ? null : existing.latitude),
          longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : (longitude === null ? null : existing.longitude),
          isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive
        }
      });
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.delete('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const existing = await prisma.geofence.findUnique({
        where: { id: req.params.id }
      });
      if (!existing) {
        return res.status(404).json({ error: 'Geofence tidak ditemukan' });
      }

      await prisma.geofence.delete({
        where: { id: req.params.id }
      });
      res.json({ message: 'Geofence berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

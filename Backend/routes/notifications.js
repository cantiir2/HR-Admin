const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const {
  createBulkNotifications,
  getAdminRecipients
} = require('../services/notificationService');
const { buildOrderBy } = require('../utils/sorting');

module.exports = (prisma) => {
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
      const { sortBy, sortOrder } = req.query;

      const allowedSortFields = ['type', 'title', 'isRead', 'createdAt'];
      const orderBy = buildOrderBy(sortBy, sortOrder, allowedSortFields, { sortBy: 'createdAt', sortOrder: 'desc' });

      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy,
        take: limit
      });
      res.json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
      const count = await prisma.notification.count({
        where: { userId: req.user.id, isRead: false }
      });
      res.json({ count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
      const notification = await prisma.notification.findFirst({
        where: { id: req.params.id, userId: req.user.id }
      });
      if (!notification) return res.status(404).json({ error: 'Notifikasi tidak ditemukan' });

      const updated = await prisma.notification.update({
        where: { id: req.params.id },
        data: { isRead: true, readAt: new Date() }
      });
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/read-all', authenticateToken, async (req, res) => {
    try {
      const result = await prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true, readAt: new Date() }
      });
      res.json({ message: 'Semua notifikasi ditandai sudah dibaca', count: result.count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/generate-contract-expiring', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { generateContractExpiringNotifications } = require('../services/contractNotificationService');
      const result = await generateContractExpiringNotifications(prisma);
      
      res.json({ 
        message: 'Generate notifikasi kontrak selesai', 
        contracts: result.contractsChecked, 
        notifications: result.notificationsCreated 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

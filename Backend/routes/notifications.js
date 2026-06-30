const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const {
  createBulkNotifications,
  getAdminRecipients
} = require('../services/notificationService');

module.exports = (prisma) => {
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
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
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setUTCDate(thirtyDaysLater.getUTCDate() + 30);

      const [contracts, admins] = await Promise.all([
        prisma.userContract.findMany({
          where: {
            endDate: { gte: today, lte: thirtyDaysLater }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                projects: {
                  include: {
                    project: {
                      select: {
                        id: true,
                        name: true,
                        projectManager: { select: { id: true, name: true, email: true, role: true } }
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { endDate: 'asc' }
        }),
        getAdminRecipients(prisma)
      ]);

      let created = 0;
      for (const contract of contracts) {
        const projectManagers = contract.user.projects
          .map(item => item.project.projectManager)
          .filter(Boolean);
        const recipients = [...admins, ...projectManagers];
        const endDateText = contract.endDate.toISOString().slice(0, 10);

        const notifications = await createBulkNotifications(prisma, recipients, {
          type: 'CONTRACT_EXPIRING',
          title: 'Kontrak Akan Berakhir',
          message: `Kontrak ${contract.user.name} akan berakhir pada ${endDateText}.`,
          detail: `Nomor kontrak: ${contract.contractNumber}. Vendor: ${contract.vendor}.`,
          referenceId: contract.id,
          referenceType: 'USER_CONTRACT',
          skipDuplicate: true
        });
        created += notifications.length;
      }

      res.json({ message: 'Generate notifikasi kontrak selesai', contracts: contracts.length, notifications: created });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

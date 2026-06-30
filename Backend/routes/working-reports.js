const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const excelService = require('../services/excelService');
const {
  canAccessWorkingReportUser,
  getWorkingReportDetail,
  getUserWorkingReports,
  submitWorkingReport,
  listWorkingReports,
  approveWorkingReport,
  rejectWorkingReport,
  generateWorkingReportReminders,
  generateWorkingReportLateStatus,
  validateMonthYear
} = require('../services/workingReportService');

module.exports = (prisma) => {
  router.get('/me', authenticateToken, async (req, res) => {
    try {
      const reports = await getUserWorkingReports(prisma, req.user.id);
      res.json(reports);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/me/:month/:year', authenticateToken, async (req, res) => {
    try {
      const result = await getWorkingReportDetail(prisma, req.user.id, req.params.month, req.params.year, req.query.sortBy, req.query.sortOrder);
      if (result.error) return res.status(400).json({ error: result.error });
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/submit', authenticateToken, async (req, res) => {
    try {
      const result = await submitWorkingReport(prisma, req.user.id, req.body.month, req.body.year);
      if (result.error) return res.status(400).json({ error: result.error });
      res.status(201).json({ message: 'Working Report berhasil disubmit', report: result.report, deadlineDate: result.deadlineDate });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/export', authenticateToken, async (req, res) => {
    try {
      const userId = req.query.userId || req.user.id;
      const period = validateMonthYear(req.query.month, req.query.year);
      if (period.error) return res.status(400).json({ error: period.error });
      if (!(await canAccessWorkingReportUser(prisma, req.user, userId))) {
        return res.status(403).json({ error: 'Anda tidak memiliki akses export WR ini' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

      const buffer = await excelService.generateWorkingReport(userId, period.month, period.year, prisma);
      const fileName = `Working Report - ${String(period.month).padStart(2, '0')}-${period.year} ${user.name}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Export WR error:', error);
      res.status(500).json({ error: 'Failed to generate working report' });
    }
  });

  router.get('/', authenticateToken, async (req, res) => {
    try {
      const result = await listWorkingReports(prisma, req.user, req.query);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/:id/approve', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const result = await approveWorkingReport(prisma, req.params.id, req.user.id);
      if (result.error) return res.status(400).json({ error: result.error });
      res.json({ message: 'Working Report berhasil diapprove', report: result.report });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/:id/reject', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const result = await rejectWorkingReport(prisma, req.params.id, req.user.id, req.body.rejectionReason);
      if (result.error) return res.status(400).json({ error: result.error });
      res.json({ message: 'Working Report berhasil direject', report: result.report });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/generate-reminders', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const result = await generateWorkingReportReminders(prisma);
      res.json({ message: 'Generate reminder WR selesai', ...result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/generate-late-status', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const result = await generateWorkingReportLateStatus(prisma);
      res.json({ message: 'Generate late WR selesai', ...result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

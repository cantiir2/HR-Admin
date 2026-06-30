const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const {
  getLeaveBalance,
  toLeaveResponse,
  createLeaveRequest,
  listLeaveRequests,
  getLeaveEvidencePhoto,
  cancelLeaveRequest,
  approveLeaveByPm,
  approveLeaveByAdmin,
  rejectLeaveRequest
} = require('../services/leaveService');

module.exports = (prisma) => {
  router.get('/me/balance', authenticateToken, async (req, res) => {
    try {
      const balance = await getLeaveBalance(prisma, req.user.id, req.query.contractId);
      res.json(balance);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/me', authenticateToken, async (req, res) => {
    try {
      const leaves = await prisma.leaveRequest.findMany({
        where: { userId: req.user.id },
        include: {
          contract: true,
          pmApprover: { select: { id: true, name: true } },
          adminApprover: { select: { id: true, name: true } },
          rejectedBy: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(leaves.map(toLeaveResponse));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/', authenticateToken, async (req, res) => {
    try {
      const result = await createLeaveRequest(prisma, req.user.id, req.body);
      if (result.error) {
        return res.status(result.requiresWarning ? 409 : 400).json(result);
      }
      res.status(201).json({ message: 'Pengajuan cuti berhasil dibuat', leave: result.leave });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/:id/cancel', authenticateToken, async (req, res) => {
    try {
      const result = await cancelLeaveRequest(prisma, req.params.id, req.user.id);
      if (result.error) return res.status(400).json({ error: result.error });
      res.json({ message: 'Pengajuan cuti berhasil dibatalkan', leave: toLeaveResponse(result.leave) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/', authenticateToken, async (req, res) => {
    try {
      const result = await listLeaveRequests(prisma, req.user, req.query);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/:id/evidence-photo', authenticateToken, async (req, res) => {
    try {
      const result = await getLeaveEvidencePhoto(prisma, req.params.id, req.user);
      if (result.error) return res.status(result.status || 400).json({ error: result.error });
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/:id/approve-pm', authenticateToken, async (req, res) => {
    try {
      const result = await approveLeaveByPm(prisma, req.params.id, req.user);
      if (result.error) return res.status(400).json({ error: result.error });
      res.json({ message: 'Pengajuan cuti berhasil diapprove PM', leave: toLeaveResponse(result.leave) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/:id/approve-admin', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const result = await approveLeaveByAdmin(prisma, req.params.id, req.user.id);
      if (result.error) return res.status(400).json({ error: result.error });
      res.json({ message: 'Pengajuan cuti berhasil diapprove Admin', leave: toLeaveResponse(result.leave) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/:id/reject', authenticateToken, async (req, res) => {
    try {
      const result = await rejectLeaveRequest(prisma, req.params.id, req.user, req.body.rejectionReason);
      if (result.error) return res.status(400).json({ error: result.error });
      res.json({ message: 'Pengajuan cuti berhasil direject', leave: toLeaveResponse(result.leave) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

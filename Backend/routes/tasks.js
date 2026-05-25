const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (prisma) => {

  // PUT update task status
  router.put('/:id/status', authenticateToken, async (req, res) => {
    try {
      const { status } = req.body;
      const task = await prisma.task.update({
        where: { id: req.params.id },
        data: { status }
      });
      res.json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // PUT update full task data
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { title, description, assignedToId, status, startDate, dueDate, milestoneId } = req.body;
      const data = {};
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (assignedToId !== undefined) data.assignedToId = assignedToId || null;
      if (status !== undefined) data.status = status;
      if (milestoneId !== undefined) data.milestoneId = milestoneId;
      if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
      if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

      const task = await prisma.task.update({
        where: { id: req.params.id },
        data,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } }
        }
      });
      res.json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

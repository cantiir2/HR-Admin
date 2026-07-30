const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const { buildOrderBy } = require('../utils/sorting');

module.exports = (prisma) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN: Project CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  // GET all projects
  router.get('/', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { projectManagerId } = req.query;
      const projects = await prisma.project.findMany({
        where: projectManagerId ? { projectManagerId } : undefined,
        include: {
          projectManager: { select: { id: true, name: true, email: true, jobRoleCode: true, profilePhoto: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, jobRoleCode: true, profilePhoto: true } }
            }
          }
        },
        orderBy: buildOrderBy(req.query.sortBy, req.query.sortOrder, ['name', 'customer', 'customerName', 'woNumber', 'contractStart', 'contractEnd', 'status', 'createdAt'], { sortBy: 'createdAt', sortOrder: 'desc' })
      });
      res.json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST search projects with filters and pagination
  router.post('/search', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const {
        pageNo: pageNoBody = 1,
        pageSize: pageSizeBody = 5,
        search = '',
        status = '',
        projectManagerId = '',
        customer = '',
        dateFrom = '',
        dateTo = '',
        sortBy,
        sortOrder
      } = req.body || {};

      const allowedSortFields = ['name', 'customer', 'customerName', 'woNumber', 'contractStart', 'contractEnd', 'status', 'createdAt'];
      const orderBy = buildOrderBy(sortBy, sortOrder, allowedSortFields, { sortBy: 'createdAt', sortOrder: 'desc' });

      const pageNo = Math.max(parseInt(pageNoBody, 10) || 1, 1);
      const pageSize = Math.min(Math.max(parseInt(pageSizeBody, 10) || 5, 1), 50);
      const skip = (pageNo - 1) * pageSize;

      if (dateFrom && dateTo && dateFrom > dateTo) {
        return res.status(400).json({
          error: 'Tanggal mulai filter tidak boleh lebih besar dari tanggal selesai filter'
        });
      }

      const andWhere = [];

      if (search) {
        andWhere.push({
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { customer: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { woNumber: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } }
          ]
        });
      }

      if (status) andWhere.push({ status });
      if (projectManagerId) andWhere.push({ projectManagerId });

      if (customer) {
        andWhere.push({
          customer: {
            contains: customer,
            mode: 'insensitive'
          }
        });
      }

      if (dateFrom && dateTo) {
        andWhere.push({
          contractStart: { lte: new Date(dateTo) },
          contractEnd: { gte: new Date(dateFrom) }
        });
      } else if (dateFrom) {
        andWhere.push({ contractEnd: { gte: new Date(dateFrom) } });
      } else if (dateTo) {
        andWhere.push({ contractStart: { lte: new Date(dateTo) } });
      }

      const where = andWhere.length ? { AND: andWhere } : {};
      const include = {
        projectManager: { select: { id: true, name: true, email: true, jobRoleCode: true, profilePhoto: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, jobRoleCode: true, profilePhoto: true } }
          }
        }
      };

      const [totalRows, projects] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.findMany({
          where,
          include,
          orderBy,
          skip,
          take: pageSize
        })
      ]);

      res.json({
        data: projects,
        page: {
          pageNo,
          pageSize,
          totalRows,
          totalPages: Math.ceil(totalRows / pageSize)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  // GET my projects
  router.get('/my-projects', authenticateToken, async (req, res) => {
    try {
      const pageNo = Math.max(parseInt(req.query.pageNo, 10) || 1, 1);
      const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 10, 1), 50);
      const skip = (pageNo - 1) * pageSize;
      const timeline = req.query.timeline;
      const status = req.query.status;

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const baseWhere = {
        AND: [
          {
            OR: [
              { projectManagerId: req.user.id },
              { members: { some: { userId: req.user.id } } }
            ]
          }
        ]
      };

      if (status) {
        baseWhere.AND.push({ status });
      }

      let whereCondition = baseWhere;

      if (timeline === 'current') {
        whereCondition = {
          AND: [
            baseWhere,
            {
              OR: [
                {
                  projectManagerId: req.user.id,
                  contractStart: { lte: today },
                  contractEnd: { gte: today }
                },
                {
                  members: {
                    some: {
                      userId: req.user.id,
                      joinedAt: { lte: today },
                      leftAt: { gte: today }
                    }
                  }
                },
                {
                  members: {
                    some: {
                      userId: req.user.id,
                      joinedAt: null
                    }
                  },
                  contractStart: { lte: today },
                  contractEnd: { gte: today }
                }
              ]
            }
          ]
        };
      } else if (timeline === 'incoming') {
        whereCondition = {
          AND: [
            baseWhere,
            {
              OR: [
                {
                  projectManagerId: req.user.id,
                  contractStart: { gt: today }
                },
                {
                  members: {
                    some: {
                      userId: req.user.id,
                      joinedAt: { gt: today }
                    }
                  }
                },
                {
                  members: {
                    some: {
                      userId: req.user.id,
                      joinedAt: null
                    }
                  },
                  contractStart: { gt: today }
                }
              ]
            }
          ]
        };
      }

      let orderByCondition = { createdAt: 'desc' };
      if (timeline === 'incoming') {
        orderByCondition = { contractStart: 'asc' };
      } else if (timeline === 'current') {
        orderByCondition = { contractEnd: 'asc' };
      }

      const [projects, totalRows] = await prisma.$transaction([
        prisma.project.findMany({
          where: whereCondition,
          skip,
          take: pageSize,
          include: {
            projectManager: { select: { id: true, name: true, email: true, jobRoleCode: true, profilePhoto: true } },
            members: {
              where: { userId: req.user.id }, // only return member's own allocation to get their dates
              include: {
                user: { select: { id: true, name: true, email: true, jobRoleCode: true, profilePhoto: true } }
              }
            }
          },
          orderBy: orderByCondition
        }),
        prisma.project.count({ where: whereCondition })
      ]);

      res.json({
        data: projects,
        page: {
          pageNo,
          pageSize,
          totalRows,
          totalPages: Math.ceil(totalRows / pageSize)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET single project
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
          projectManager: { select: { id: true, name: true, email: true, jobRoleCode: true, profilePhoto: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, jobRoleCode: true } }
            }
          },
          milestones: {
            include: {
              tasks: {
                include: {
                  assignedTo: { select: { id: true, name: true, email: true } }
                }
              }
            },
            orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }]
          }
        }
      });
      if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });
      res.json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST create project
  router.post('/', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { name, description, location, latitude, longitude, contractStart, contractEnd, status, customer, customerName, woNumber } = req.body;
      const projectManagerId = req.body.projectManagerId ?? req.body.project_manager_id;
      if (!name || !contractStart || !contractEnd || !customer || !projectManagerId) {
        return res.status(400).json({ error: 'Nama, Customer Company, Project Manager, tanggal mulai, dan tanggal selesai wajib diisi' });
      }
      const periodError = validatePeriod(contractStart, contractEnd, 'project');
      if (periodError) return res.status(400).json({ error: periodError });
      if (projectManagerId && !(await prisma.user.findUnique({ where: { id: projectManagerId } }))) {
        return res.status(400).json({ error: 'Project Manager tidak ditemukan' });
      }

      const project = await prisma.project.create({
        data: {
          name, description, location, customer: String(customer).trim(),
          customerName: customerName ? String(customerName).trim() : null,
          woNumber, projectManagerId: projectManagerId || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          contractStart: new Date(contractStart),
          contractEnd: new Date(contractEnd),
          status: status || 'active'
        }
      });
      res.status(201).json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // PUT update project
  router.put('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { name, description, location, latitude, longitude, contractStart, contractEnd, status, customer, customerName, woNumber } = req.body;
      const projectManagerId = req.body.projectManagerId ?? req.body.project_manager_id;
      const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ error: 'Project tidak ditemukan' });
      const periodError = validatePeriod(
        contractStart || toDateText(existing.contractStart),
        contractEnd || toDateText(existing.contractEnd),
        'project'
      );
      if (periodError) return res.status(400).json({ error: periodError });
      if (!projectManagerId) return res.status(400).json({ error: 'Project Managet tidak boleh kosong' })
      if (projectManagerId && !(await prisma.user.findUnique({ where: { id: projectManagerId } }))) {
        return res.status(400).json({ error: 'Project Manager tidak ditemukan' });
      }
      const data = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (location !== undefined) data.location = location;
      if (latitude !== undefined) data.latitude = latitude ? parseFloat(latitude) : null;
      if (longitude !== undefined) data.longitude = longitude ? parseFloat(longitude) : null;
      if (contractStart !== undefined) data.contractStart = new Date(contractStart);
      if (contractEnd !== undefined) data.contractEnd = new Date(contractEnd);
      if (status !== undefined) data.status = status;
      if (customer !== undefined) data.customer = customer ? String(customer).trim() : null;
      if (customerName !== undefined) data.customerName = customerName ? String(customerName).trim() : null;
      if (woNumber !== undefined) data.woNumber = woNumber;
      if (projectManagerId !== undefined) data.projectManagerId = projectManagerId || null;

      const project = await prisma.project.update({
        where: { id: req.params.id },
        data
      });
      res.json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // DELETE project
  router.delete('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      await prisma.project.delete({ where: { id: req.params.id } });
      res.json({ message: 'Project berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Project Members
  // ═══════════════════════════════════════════════════════════════════════════

  // POST assign member to project
  router.post('/:id/members', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { userId, roleInProject, joinedAt, leftAt } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId wajib diisi' });
      const periodError = validatePeriod(joinedAt, leftAt, 'assignment');
      if (periodError) return res.status(400).json({ error: periodError });
      const project = await prisma.project.findUnique({ where: { id: req.params.id } });
      if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });
      if (joinedAt && new Date(joinedAt) < project.contractStart ||
        leftAt && new Date(leftAt) > project.contractEnd) {
        return res.status(400).json({ error: 'Tanggal assignment harus berada dalam periode project' });
      }

      const member = await prisma.projectMember.create({
        data: {
          projectId: req.params.id,
          userId,
          roleInProject: roleInProject || 'Member',
          joinedAt: joinedAt ? new Date(joinedAt) : null,
          leftAt: leftAt ? new Date(leftAt) : null
        },
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      });
      res.status(201).json(member);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'User sudah ada di project ini' });
      }
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/:id/members/:userId', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { joinedAt, leftAt, roleInProject } = req.body;
      const { id: projectId, userId } = req.params;

      const existingMember = await prisma.projectMember.findFirst({
        where: { projectId, userId }
      });
      if (!existingMember) {
        return res.status(404).json({ error: 'Member tidak ditemukan dalam project ini' });
      }

      const periodError = validatePeriod(joinedAt, leftAt, 'assignment');
      if (periodError) return res.status(400).json({ error: periodError });

      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });

      if ((joinedAt && new Date(joinedAt) < project.contractStart) ||
          (leftAt && new Date(leftAt) > project.contractEnd)) {
        return res.status(400).json({ error: 'Tanggal assignment harus berada dalam periode project' });
      }

      const updatedMember = await prisma.projectMember.update({
        where: { id: existingMember.id },
        data: {
          roleInProject: roleInProject !== undefined ? roleInProject : existingMember.roleInProject,
          joinedAt: joinedAt ? new Date(joinedAt) : null,
          leftAt: leftAt ? new Date(leftAt) : null
        },
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      });

      res.json(updatedMember);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // DELETE remove member from project
  router.delete('/:id/members/:userId', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      await prisma.projectMember.deleteMany({
        where: {
          projectId: req.params.id,
          userId: req.params.userId
        }
      });
      res.json({ message: 'Member berhasil dihapus dari project' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Milestones & Tasks
  // ═══════════════════════════════════════════════════════════════════════════

  // POST create milestone
  router.post('/:id/milestones', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { name, status } = req.body;
      if (!String(name || '').trim()) return res.status(400).json({ error: 'Nama milestone wajib diisi' });
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: { milestones: { orderBy: { endDate: 'desc' } } }
      });
      if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });
      const previous = project.milestones[0];
      const defaultStart = previous?.endDate
        ? addDays(previous.endDate, 1)
        : project.contractStart;
      const defaultEnd = minDate(addDays(defaultStart, 6), project.contractEnd);
      const startDate = req.body.startDate ? new Date(req.body.startDate) : defaultStart;
      const endDate = req.body.endDate ? new Date(req.body.endDate) : defaultEnd;
      const rangeError = validateMilestoneRange(project, startDate, endDate);
      if (rangeError) return res.status(400).json({ error: rangeError });
      const milestone = await prisma.milestone.create({
        data: {
          projectId: req.params.id,
          name: name.trim(),
          startDate,
          endDate,
          status: status || 'pending'
        }
      });
      res.status(201).json(milestone);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/:id/milestones/:milestoneId', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { name, startDate, endDate, status } = req.body;
      if (!String(name || '').trim()) return res.status(400).json({ error: 'Nama milestone wajib diisi' });
      if (!startDate || !endDate) return res.status(400).json({ error: 'Tanggal mulai dan selesai milestone wajib diisi' });
      const project = await prisma.project.findUnique({ where: { id: req.params.id } });
      if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });
      const start = new Date(startDate);
      const end = new Date(endDate);
      const rangeError = validateMilestoneRange(project, start, end);
      if (rangeError) return res.status(400).json({ error: rangeError });
      const existing = await prisma.milestone.findFirst({ where: { id: req.params.milestoneId, projectId: req.params.id } });
      if (!existing) return res.status(404).json({ error: 'Milestone tidak ditemukan' });
      const milestone = await prisma.milestone.update({
        where: { id: existing.id },
        data: { name: name.trim(), startDate: start, endDate: end, status: status || existing.status }
      });
      res.json(milestone);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST create task in a milestone
  router.post('/:id/milestones/:milestoneId/tasks', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { title, description, assignedToId, status, startDate, dueDate } = req.body;
      const task = await prisma.task.create({
        data: {
          milestoneId: req.params.milestoneId,
          title,
          description,
          assignedToId: assignedToId || null,
          status: status || 'TODO',
          startDate: startDate ? new Date(startDate) : null,
          dueDate: dueDate ? new Date(dueDate) : null
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } }
        }
      });
      res.status(201).json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // DELETE task
  router.delete('/:id/tasks/:taskId', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      await prisma.task.delete({ where: { id: req.params.taskId } });
      res.json({ message: 'Task berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // DELETE milestone
  router.delete('/:id/milestones/:milestoneId', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      await prisma.milestone.delete({ where: { id: req.params.milestoneId } });
      res.json({ message: 'Milestone berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

function toDateText(value) {
  return value.toISOString().split('T')[0];
}

function validatePeriod(startDate, endDate, label) {
  if (!startDate || !endDate) return null;
  if (Number.isNaN(new Date(startDate).getTime()) || Number.isNaN(new Date(endDate).getTime())) {
    return `Format tanggal ${label} tidak valid`;
  }
  return new Date(startDate) > new Date(endDate)
    ? `Tanggal mulai ${label} tidak boleh lebih besar dari tanggal selesai`
    : null;
}

function addDays(value, count) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + count);
  return result;
}

function minDate(first, second) {
  return first < second ? first : second;
}

function validateMilestoneRange(project, startDate, endDate) {
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'Format tanggal milestone tidak valid';
  }
  if (startDate > endDate) return 'Tanggal mulai milestone tidak boleh melebihi tanggal selesai';
  if (startDate < project.contractStart) return 'Tanggal mulai milestone tidak boleh kurang dari tanggal mulai project';
  if (endDate > project.contractEnd) return 'Tanggal selesai milestone tidak boleh melebihi tanggal selesai project';
  return null;
}

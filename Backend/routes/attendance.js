const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const { buildOrderBy } = require('../utils/sorting');
const { detectProjectArea } = require('../utils/geofence');

module.exports = (prisma) => {
  async function getActiveGeofences() {
    try {
      const geofences = await prisma.geofence.findMany({
        where: { isActive: true }
      });
      if (geofences && geofences.length > 0) {
        return geofences;
      }
    } catch (e) { }
    return await prisma.project.findMany({
      where: {
        status: { in: ['active', 'Active', 'ACTIVE'] }
      }
    });
  }

  function getAreaStatus(lat, lng, geofences) {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      return null;
    }
    const match = detectProjectArea(lat, lng, geofences);
    if (match) {
      return { ...match, inRange: true };
    }
    return { name: 'Luar Area', location: '', inRange: false };
  }

  function attachAreaStatus(attendance, geofences) {
    if (!attendance) return null;
    const checkInArea = getAreaStatus(attendance.checkInLat, attendance.checkInLng, geofences);
    const checkOutArea = getAreaStatus(attendance.checkOutLat, attendance.checkOutLng, geofences);
    return {
      ...attendance,
      checkInArea,
      checkOutArea
    };
  }

  router.post('/check-in', authenticateToken, async (req, res) => {
    try {
      const { photo, latitude, longitude, note } = req.body;
      if (!latitude || !longitude) return res.status(400).json({ error: 'Lokasi GPS diperlukan' });

      const today = new Date();
      const dateOnly = jakartaDate();

      const existing = await prisma.attendance.findUnique({
        where: { userId_date: { userId: req.user.id, date: dateOnly } }
      });

      if (existing && existing.checkInTime) {
        return res.status(400).json({ error: 'Anda sudah melakukan check-in hari ini' });
      }

      const activeProjects = await getActiveGeofences();

      if (existing) {
        const updated = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            checkInTime: today,
            checkInPhoto: photo,
            checkInLat: parseFloat(latitude),
            checkInLng: parseFloat(longitude),
            checkInNote: note
          }
        });
        return res.status(200).json({ message: 'Check-in berhasil', attendance: attachAreaStatus(updated, activeProjects) });
      }

      const attendance = await prisma.attendance.create({
        data: {
          userId: req.user.id,
          date: dateOnly,
          checkInTime: today,
          checkInPhoto: photo,
          checkInLat: parseFloat(latitude),
          checkInLng: parseFloat(longitude),
          checkInNote: note
        }
      });

      res.status(201).json({ message: 'Check-in berhasil', attendance: attachAreaStatus(attendance, activeProjects) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/check-out', authenticateToken, async (req, res) => {
    try {
      const { photo, latitude, longitude, note } = req.body;
      if (!latitude || !longitude) return res.status(400).json({ error: 'Lokasi GPS diperlukan' });

      const today = new Date();
      const dateOnly = jakartaDate();

      const existing = await prisma.attendance.findUnique({
        where: { userId_date: { userId: req.user.id, date: dateOnly } }
      });

      if (!existing || !existing.checkInTime) {
        return res.status(400).json({ error: 'Anda belum melakukan check-in hari ini' });
      }

      const activeProjects = await getActiveGeofences();

      if (existing.checkOutTime) {
        if (today <= existing.checkOutTime) {
          return res.status(400).json({ error: 'Waktu check-out baru harus lebih besar dari check-out sebelumnya' });
        }

        const updated = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            checkOutTime: today,
            checkOutPhoto: photo,
            checkOutLat: parseFloat(latitude),
            checkOutLng: parseFloat(longitude),
            checkOutNote: note
          }
        });

        return res.json({ message: 'Check-out lembur berhasil diperbarui', attendance: attachAreaStatus(updated, activeProjects) });
      }

      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkOutTime: today,
          checkOutPhoto: photo,
          checkOutLat: parseFloat(latitude),
          checkOutLng: parseFloat(longitude),
          checkOutNote: note
        }
      });

      res.json({ message: 'Check-out berhasil', attendance: attachAreaStatus(updated, activeProjects) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/today', authenticateToken, async (req, res) => {
    try {
      const dateOnly = jakartaDate();
      const attendance = await prisma.attendance.findFirst({
        where: { userId: req.user.id, date: dateOnly },
        include: {
          user: { select: { name: true, email: true, jobRoleCode: true } }
        }
      });

      const activeProjects = await getActiveGeofences();

      if (!attendance) {
        return res.json(null);
      }

      res.json(attachAreaStatus(attendance, activeProjects));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/me', authenticateToken, async (req, res) => {
    try {
      const { month, year, sortBy, sortOrder } = req.query;
      let whereClause = { userId: req.user.id };

      const allowedSortFields = ['date', 'checkInTime', 'checkOutTime', 'createdAt'];
      const orderBy = buildOrderBy(sortBy, sortOrder, allowedSortFields, { sortBy: 'date', sortOrder: 'desc' });

      if (month && year) {
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);
        const startDate = new Date(Date.UTC(y, m - 1, 1));
        const endDate = new Date(Date.UTC(y, m, 1));
        whereClause.date = {
          gte: startDate,
          lt: endDate
        };
      }

      const [attendances, activeProjects] = await Promise.all([
        prisma.attendance.findMany({
          where: whereClause,
          orderBy,
          omit: {
            checkInPhoto: true,
            checkOutPhoto: true
          },
          ...(month && year ? {} : { take: 30 })
        }),
        getActiveGeofences()
      ]);

      res.json(attendances.map(att => attachAreaStatus(att, activeProjects)));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { page, limit, search, date, startDate, endDate, all, projectManagerId, sortBy, sortOrder } = req.query;

      const allowedSortFields = ['date', 'user.name', 'checkInTime', 'checkOutTime', 'createdAt'];
      const orderBy = buildOrderBy(sortBy, sortOrder, allowedSortFields, { sortBy: 'date', sortOrder: 'desc' });

      let whereClause = {};
      if (date && !isValidDateInput(date)) {
        return res.status(400).json({ error: 'Format tanggal harus YYYY-MM-DD' });
      }
      if (startDate && !isValidDateInput(startDate)) {
        return res.status(400).json({ error: 'Format tanggal startDate harus YYYY-MM-DD' });
      }
      if (endDate && !isValidDateInput(endDate)) {
        return res.status(400).json({ error: 'Format tanggal endDate harus YYYY-MM-DD' });
      }

      if (all !== 'true') {
        if (startDate && endDate) {
          whereClause.date = {
            gte: jakartaDate(startDate),
            lte: jakartaDate(endDate)
          };
        } else if (date) {
          whereClause.date = jakartaDate(date);
        } else {
          whereClause.date = jakartaDate();
        }
      }

      whereClause.user = {
        role: 'MEMBER',
        jobRoleCode: { not: null, not: '' },
        ...(projectManagerId ? {
          projects: { some: { project: { projectManagerId } } }
        } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      const activeProjects = await getActiveGeofences();

      if (page && limit) {
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        const [attendances, total] = await Promise.all([
          prisma.attendance.findMany({
            where: whereClause,
            include: {
              user: { select: { name: true, email: true, jobRoleCode: true } }
            },
            orderBy,
            skip,
            take: limitNumber
          }),
          prisma.attendance.count({ where: whereClause })
        ]);

        return res.json({
          data: attendances.map(att => attachAreaStatus(att, activeProjects)),
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        });
      }

      const attendances = await prisma.attendance.findMany({
        where: whereClause,
        include: {
          user: { select: { name: true, email: true, jobRoleCode: true } }
        },
        orderBy
      });
      res.json(attendances.map(att => attachAreaStatus(att, activeProjects)));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/locations', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { date, projectManagerId } = req.query;
      if (date && !isValidDateInput(date)) {
        return res.status(400).json({ error: 'Format tanggal harus YYYY-MM-DD' });
      }
      const dateOnly = date ? jakartaDate(date) : jakartaDate();

      const [locations, activeProjects] = await Promise.all([
        prisma.attendance.findMany({
          where: {
            date: dateOnly,
            user: {
              role: 'MEMBER',
              jobRoleCode: { not: null, not: '' },
              ...(projectManagerId ? {
                projects: { some: { project: { projectManagerId } } }
              } : {})
            }
          },
          include: {
            user: { select: { name: true, email: true, jobRoleCode: true } }
          }
        }),
        getActiveGeofences()
      ]);

      res.json(locations.map(loc => attachAreaStatus(loc, activeProjects)));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/export', authenticateToken, async (req, res) => {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({ error: 'Month and year are required' });
      }

      const excelService = require('../services/excelService');
      const buffer = await excelService.generateWorkingReport(req.user.id, month, year, prisma);

      const fileName = `Working Report - ${String(month).padStart(2, '0')}-${year} ${req.user.name}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      res.send(buffer);
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Failed to generate working report' });
    }
  });

  return router;
};

function isValidDateInput(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value)) &&
    !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function jakartaDate(dateValue) {
  const dateText = dateValue || new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
  return new Date(`${dateText}T00:00:00.000Z`);
}

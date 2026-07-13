const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const { buildOrderBy } = require('../utils/sorting');
const notificationService = require('../services/notificationService');

module.exports = (prisma) => {

  // Helper to parse date string strictly
  function jakartaDate(dateValue) {
    const dateText = dateValue || new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    return new Date(`${dateText}T00:00:00.000Z`);
  }

  // Helper to combine date and time string into Date object
  function combineDateTime(dateStr, timeStr) {
    if (!timeStr) return null;
    return new Date(`${dateStr}T${timeStr}:00.000Z`);
  }

  // GET /api/attendance-requests/me
  router.get('/me', authenticateToken, async (req, res) => {
    try {
      const { status, month, year, pageNo = 1, pageSize = 20 } = req.query;

      const whereClause = { userId: req.user.id };

      if (status) {
        whereClause.status = status;
      }

      if (month && year) {
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);
        const startDate = new Date(Date.UTC(y, m - 1, 1));
        const endDate = new Date(Date.UTC(y, m, 1));
        whereClause.requestDate = {
          gte: startDate,
          lt: endDate
        };
      }

      const skip = (parseInt(pageNo) - 1) * parseInt(pageSize);

      const [requests, total] = await Promise.all([
        prisma.attendanceRequest.findMany({
          where: whereClause,
          orderBy: { requestDate: 'desc' },
          skip,
          take: parseInt(pageSize),
          select: {
            id: true,
            requestDate: true,
            requestType: true,
            requestedCheckInTime: true,
            requestedCheckOutTime: true,
            status: true,
            reason: true,
            declineReason: true,
            createdAt: true,
            evidencePhotoName: true
          }
        }),
        prisma.attendanceRequest.count({ where: whereClause })
      ]);

      const mappedRequests = requests.map(req => {
        return {
          ...req,
          hasEvidence: true // we know evidence is mandatory
        };
      });

      res.json({ data: mappedRequests, total, page: parseInt(pageNo) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET /api/attendance-requests/eligible-dates
  router.get('/eligible-dates', authenticateToken, async (req, res) => {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({ error: 'Month and year required' });
      }

      const m = parseInt(month, 10);
      const y = parseInt(year, 10);

      const startDate = new Date(Date.UTC(y, m - 1, 1));
      let maxDate = new Date(Date.UTC(y, m, 1));
      maxDate.setUTCDate(maxDate.getUTCDate() - 1); // Last day of the requested month

      const today = jakartaDate();

      // End date should not be after today
      if (maxDate > today) {
        maxDate = today;
      }

      // Fetch attendances for the month
      const attendances = await prisma.attendance.findMany({
        where: {
          userId: req.user.id,
          date: {
            gte: startDate,
            lte: maxDate
          }
        }
      });

      const attendanceMap = {};
      attendances.forEach(att => {
        const dateStr = att.date.toISOString().split('T')[0];
        attendanceMap[dateStr] = att;
      });

      // Generate all weekdays in the month up to today
      const eligibleDates = [];
      let currentDate = new Date(startDate);
      const todayStr = today.toISOString().split('T')[0];

      while (currentDate <= maxDate) {
        // We include weekends as well unless specified. The prompt says: "Jika weekend juga boleh, jangan filter weekend."
        // Let's include all days up to today.
        const dateStr = currentDate.toISOString().split('T')[0];
        const label = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit', month: 'short', year: '2-digit'
        }).format(currentDate);

        const att = attendanceMap[dateStr];
        let missingCheckIn = true;
        let missingCheckOut = true;

        if (att) {
          missingCheckIn = !att.checkInTime;
          missingCheckOut = !att.checkOutTime;
        }

        if (missingCheckIn || missingCheckOut) {
          let suggestedTypes = [];
          const isToday = dateStr === todayStr;

          if (isToday) {
            if (missingCheckIn) suggestedTypes.push('CHECK_IN');
            else if (missingCheckOut) suggestedTypes.push('CHECK_OUT');
          } else {
            if (missingCheckIn && missingCheckOut) suggestedTypes.push('CHECK_IN', 'CHECK_OUT', 'BOTH');
            else if (missingCheckIn) suggestedTypes.push('CHECK_IN');
            else if (missingCheckOut) suggestedTypes.push('CHECK_OUT');
          }

          eligibleDates.push({
            date: dateStr,
            label,
            isToday,
            missingCheckIn,
            missingCheckOut,
            suggestedRequestTypes: suggestedTypes
          });
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      // Filter out dates that already have PENDING requests
      const pendingRequests = await prisma.attendanceRequest.findMany({
        where: {
          userId: req.user.id,
          status: 'PENDING',
          requestDate: {
            gte: startDate,
            lte: maxDate
          }
        }
      });
      const pendingDates = new Set(pendingRequests.map(r => r.requestDate.toISOString().split('T')[0]));

      const finalEligibleDates = eligibleDates.filter(d => !pendingDates.has(d.date));

      res.json(finalEligibleDates.reverse()); // newest first
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST /api/attendance-requests
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const {
        requestDate,
        requestType,
        requestedCheckInTime,
        requestedCheckOutTime,
        reason,
        evidencePhoto,
        evidencePhotoName
      } = req.body;

      if (!requestDate || !requestType || !reason || !evidencePhoto) {
        return res.status(400).json({ error: 'Data tidak lengkap (tanggal, tipe, alasan, evidence wajib)' });
      }

      const reqDateObj = jakartaDate(requestDate);
      const today = jakartaDate();

      if (reqDateObj > today) {
        return res.status(400).json({ error: 'Hanya bisa mengajukan untuk tanggal yang sudah lewat atau hari ini' });
      }

      // Determine existing attendance
      const attendance = await prisma.attendance.findUnique({
        where: { userId_date: { userId: req.user.id, date: reqDateObj } }
      });

      const isToday = reqDateObj.getTime() === today.getTime();
      let missingCheckIn = true;
      let missingCheckOut = true;

      if (attendance) {
        missingCheckIn = !attendance.checkInTime;
        missingCheckOut = !attendance.checkOutTime;
      }

      if (isToday) {
        if (!missingCheckIn && !missingCheckOut) {
          return res.status(400).json({ error: 'Attendance hari ini sudah lengkap, tidak bisa mengajukan request' });
        }

        if (requestType === 'BOTH') {
          return res.status(400).json({ error: 'Tidak dapat menggunakan request BOTH untuk hari ini' });
        }

        if (requestType === 'CHECK_IN' && !missingCheckIn) {
          return res.status(400).json({ error: 'Check-In hari ini sudah ada' });
        }
        if (requestType === 'CHECK_OUT' && !missingCheckOut) {
          return res.status(400).json({ error: 'Check-Out hari ini sudah ada' });
        }
      } else {
        if (requestType === 'CHECK_IN' && !missingCheckIn) {
          return res.status(400).json({ error: 'Check-In sudah ada' });
        }
        if (requestType === 'CHECK_OUT' && !missingCheckOut) {
          return res.status(400).json({ error: 'Check-Out sudah ada' });
        }
      }

      if (requestType === 'CHECK_IN' && !requestedCheckInTime) {
        return res.status(400).json({ error: 'Waktu Check-In wajib' });
      }
      if (requestType === 'CHECK_OUT' && !requestedCheckOutTime) {
        return res.status(400).json({ error: 'Waktu Check-Out wajib' });
      }
      if (requestType === 'BOTH') {
        if (!requestedCheckInTime || !requestedCheckOutTime) {
          return res.status(400).json({ error: 'Waktu Check-In dan Check-Out wajib' });
        }
        const inTime = new Date(`1970-01-01T${requestedCheckInTime}:00`);
        const outTime = new Date(`1970-01-01T${requestedCheckOutTime}:00`);
        if (outTime <= inTime) {
          return res.status(400).json({ error: 'Check-Out harus setelah Check-In' });
        }
      }

      if (requestType === 'CHECK_OUT' && attendance && attendance.checkInTime) {
        // Ensure requestedCheckOutTime > existing checkInTime
        const existingInTime = attendance.checkInTime;
        const reqOutTimeObj = combineDateTime(requestDate, requestedCheckOutTime);
        if (reqOutTimeObj <= existingInTime) {
          return res.status(400).json({ error: 'Waktu Check-Out harus setelah Waktu Check-In yang sudah ada' });
        }
      }

      // Check if duplicate pending exists
      const existing = await prisma.attendanceRequest.findFirst({
        where: {
          userId: req.user.id,
          requestDate: reqDateObj,
          status: 'PENDING'
        }
      });

      if (existing) {
        return res.status(400).json({ error: 'Masih ada request PENDING untuk tanggal tersebut' });
      }

      const mimeType = evidencePhoto.match(/data:(.*);base64/)?.[1] || 'image/jpeg';

      const result = await prisma.$transaction(async (tx) => {
        const request = await tx.attendanceRequest.create({
          data: {
            userId: req.user.id,
            attendanceId: attendance ? attendance.id : null,
            requestDate: reqDateObj,
            requestType,
            requestedCheckInTime: combineDateTime(requestDate, requestedCheckInTime),
            requestedCheckOutTime: combineDateTime(requestDate, requestedCheckOutTime),
            reason,
            evidencePhoto,
            evidencePhotoName,
            evidencePhotoMimeType: mimeType
          }
        });

        const pmRecipients = await notificationService.getProjectManagerRecipientsForAttendanceRequest(tx, req.user.id, reqDateObj);
        const notifications = [];

        const formattedDate = new Intl.DateTimeFormat('id-ID', {
          day: '2-digit', month: 'long', year: 'numeric'
        }).format(reqDateObj);

        for (const recipient of pmRecipients) {
          const projectNames = recipient.projectNames?.length ? recipient.projectNames.join(', ') : '-';
          const detail = `Member: ${req.user.name}\nTanggal: ${formattedDate}\nTipe Request: ${requestType}\nRequested Check-In: ${requestedCheckInTime || '-'}\nRequested Check-Out: ${requestedCheckOutTime || '-'}\nAlasan: ${reason}\nProject terkait: ${projectNames}\nEvidence: tersedia`;

          const notification = await notificationService.createNotification(tx, {
            userId: recipient.id,
            recipient,
            type: 'ATTENDANCE_REQUEST',
            title: 'Attendance Request Baru',
            message: `${req.user.name} mengajukan attendance request untuk tanggal ${formattedDate}.`,
            detail,
            emailDetail: detail,
            referenceId: request.id,
            referenceType: 'ATTENDANCE_REQUEST',
            channel: 'BOTH',
            skipDuplicate: true,
            sendEmail: false
          });

          if (notification) notifications.push(notification);
        }

        return { request, notifications };
      });

      notificationService.sendNotificationEmails(prisma, result.notifications).catch(() => { });

      res.status(201).json({ message: 'Request berhasil dikirim', data: { id: result.request.id } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // PUT /api/attendance-requests/:id/cancel
  router.put('/:id/cancel', authenticateToken, async (req, res) => {
    try {
      const request = await prisma.attendanceRequest.findUnique({ where: { id: req.params.id } });
      if (!request || request.userId !== req.user.id) {
        return res.status(404).json({ error: 'Request tidak ditemukan' });
      }
      if (request.status !== 'PENDING') {
        return res.status(400).json({ error: 'Hanya bisa membatalkan request PENDING' });
      }

      await prisma.attendanceRequest.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED' }
      });

      res.json({ message: 'Request dibatalkan' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET /api/attendance-requests/:id/evidence
  router.get('/:id/evidence', authenticateToken, async (req, res) => {
    try {
      const request = await prisma.attendanceRequest.findUnique({ where: { id: req.params.id } });
      if (!request) return res.status(404).json({ error: 'Not found' });

      if (req.user.role !== 'ADMIN' && request.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json({
        evidencePhoto: request.evidencePhoto,
        evidencePhotoName: request.evidencePhotoName,
        evidencePhotoMimeType: request.evidencePhotoMimeType
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ================= ADMIN ENDPOINTS =================

  // GET /api/attendance-requests
  router.get('/', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { status, search, requestType, startDate, endDate, pageNo = 1, pageSize = 20, sortBy, sortOrder } = req.query;

      const whereClause = {};

      if (status) whereClause.status = status;
      if (requestType) whereClause.requestType = requestType;

      if (startDate && endDate) {
        whereClause.requestDate = {
          gte: jakartaDate(startDate),
          lte: jakartaDate(endDate)
        };
      }

      if (search) {
        whereClause.user = {
          name: { contains: search, mode: 'insensitive' }
        };
      }

      const allowedSortFields = ['requestDate', 'createdAt', 'status', 'user.name', 'requestType', 'requestedCheckInTime', 'reason'];
      const orderBy = buildOrderBy(sortBy, sortOrder, allowedSortFields, { sortBy: 'createdAt', sortOrder: 'desc' });
      const skip = (parseInt(pageNo) - 1) * parseInt(pageSize);

      const [requests, total] = await Promise.all([
        prisma.attendanceRequest.findMany({
          where: whereClause,
          include: {
            user: { select: { name: true, email: true } }
          },
          orderBy,
          skip,
          take: parseInt(pageSize)
        }),
        prisma.attendanceRequest.count({ where: whereClause })
      ]);

      const mapped = requests.map(r => {
        const { evidencePhoto, ...rest } = r; // omit base64
        return { ...rest, hasEvidence: !!evidencePhoto };
      });

      res.json({
        data: mapped,
        total,
        page: parseInt(pageNo),
        totalPages: Math.ceil(total / parseInt(pageSize))
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // PUT /api/attendance-requests/:id/approve
  router.put('/:id/approve', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNote } = req.body;

      const request = await prisma.attendanceRequest.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!request) return res.status(404).json({ error: 'Not found' });
      if (request.status !== 'PENDING') return res.status(400).json({ error: 'Request sudah tidak PENDING' });

      // Transaction
      await prisma.$transaction(async (tx) => {
        // 1. Mark request as approved
        await tx.attendanceRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedById: req.user.id,
            approvedAt: new Date()
          }
        });

        // 2. Create or Update Attendance
        let attendance = await tx.attendance.findUnique({
          where: { userId_date: { userId: request.userId, date: request.requestDate } }
        });

        const dataUpdate = {};
        if (request.requestType === 'CHECK_IN' || request.requestType === 'BOTH') {
          dataUpdate.checkInTime = request.requestedCheckInTime;
          dataUpdate.checkInNote = request.reason;
          dataUpdate.checkInPhoto = request.evidencePhoto;
        }
        if (request.requestType === 'CHECK_OUT' || request.requestType === 'BOTH') {
          dataUpdate.checkOutTime = request.requestedCheckOutTime;
          dataUpdate.checkOutNote = request.reason;
          dataUpdate.checkOutPhoto = request.evidencePhoto;
        }

        if (attendance) {
          await tx.attendance.update({
            where: { id: attendance.id },
            data: dataUpdate
          });
        } else {
          await tx.attendance.create({
            data: {
              userId: request.userId,
              date: request.requestDate,
              ...dataUpdate
            }
          });
        }

        const formattedDate = new Intl.DateTimeFormat('id-ID', {
          day: '2-digit', month: 'long', year: 'numeric'
        }).format(request.requestDate);

        const notification = await notificationService.createNotification(tx, {
          userId: request.userId,
          type: 'ATTENDANCE_REQUEST_APPROVED',
          title: 'Attendance Request Disetujui',
          message: `Attendance request Anda untuk tanggal ${formattedDate} telah disetujui.`,
          referenceId: request.id,
          referenceType: 'ATTENDANCE_REQUEST',
          channel: 'BOTH',
          sendEmail: false
        });

        return { notification };
      });

      notificationService.sendNotificationEmails(prisma, [result.notification]).catch(() => { });

      res.json({ message: 'Request approved' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // PUT /api/attendance-requests/:id/decline
  router.put('/:id/decline', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { declineReason } = req.body;

      if (!declineReason) {
        return res.status(400).json({ error: 'Alasan penolakan wajib diisi' });
      }

      const request = await prisma.attendanceRequest.findUnique({ where: { id } });
      if (!request) return res.status(404).json({ error: 'Not found' });
      if (request.status !== 'PENDING') return res.status(400).json({ error: 'Request sudah tidak PENDING' });

      const result = await prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.attendanceRequest.update({
          where: { id },
          data: {
            status: 'DECLINED',
            declinedById: req.user.id,
            declinedAt: new Date(),
            declineReason
          }
        });

        const formattedDate = new Intl.DateTimeFormat('id-ID', {
          day: '2-digit', month: 'long', year: 'numeric'
        }).format(request.requestDate);

        const notification = await notificationService.createNotification(tx, {
          userId: request.userId,
          type: 'ATTENDANCE_REQUEST_DECLINED',
          title: 'Attendance Request Ditolak',
          message: `Attendance request Anda untuk tanggal ${formattedDate} ditolak. Alasan: ${declineReason}`,
          referenceId: request.id,
          referenceType: 'ATTENDANCE_REQUEST',
          channel: 'BOTH',
          sendEmail: false
        });

        return { notification };
      });

      notificationService.sendNotificationEmails(prisma, [result.notification]).catch(() => { });

      res.json({ message: 'Request ditolak' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

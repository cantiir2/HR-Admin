const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PDFParse } = require('pdf-parse');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const { encryptText, decryptText, maskSensitiveNumber } = require('../utils/encryption');
const { calculateBase64FileSize, validateBase64File } = require('../utils/fileValidation');
const { buildOrderBy } = require('../utils/sorting');
const { getLeaveBalance } = require('../services/leaveService');
const { log } = require('console');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];
const PROFILE_FIELDS = [
  'phone', 'address', 'birthPlace', 'gender', 'religion', 'maritalStatus',
  'education', 'profilePhoto', 'profilePhotoName', 'workingExperience',
  'skill', 'emergencyContactName', 'emergencyContactPhone', 'fatherName',
  'motherName'
];

async function changeUserPassword(prisma, userId, currentPassword, newPassword, confirmPassword) {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error('Semua field password wajib diisi');
  }

  if (newPassword.length < 8) {
    throw new Error('Password baru minimal 8 karakter');
  }

  if (newPassword !== confirmPassword) {
    throw new Error('Konfirmasi password baru tidak sesuai');
  }

  if (newPassword === currentPassword) {
    throw new Error('Password baru tidak boleh sama dengan password lama');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true }
  });

  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error('Password lama tidak sesuai');
  }

  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash }
  });

  return { message: 'Password berhasil diubah' };
}

module.exports = (prisma) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN: User Management
  // ═══════════════════════════════════════════════════════════════════════════

  // GET all users
  router.get('/', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const allowedSortFields = ['name', 'email', 'role', 'jobRoleCode', 'contractStart', 'contractEnd', 'createdAt'];
      const orderBy = buildOrderBy(req.query.sortBy, req.query.sortOrder, allowedSortFields, { sortBy: 'createdAt', sortOrder: 'desc' });

      const users = await prisma.user.findMany({
        select: {
          id: true, email: true, name: true, role: true, jobRoleCode: true,
          phone: true, contractStart: true, contractEnd: true,
          profilePhoto: true, profilePhotoName: true, createdAt: true,
          ktpNumberEncrypted: true, kkNumberEncrypted: true,
          contracts: { orderBy: { endDate: 'desc' }, take: 1 },
          projects: { include: { project: { select: { name: true } } } }
        },
        orderBy
      });
      res.json(users.map(user => ({
        ...user,
        ktpNumberEncrypted: undefined,
        kkNumberEncrypted: undefined,
        ktpNumberMasked: maskEncryptedNumber(user.ktpNumberEncrypted),
        kkNumberMasked: maskEncryptedNumber(user.kkNumberEncrypted)
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST users search with filters and pagination
  router.post('/search', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const {
        pageNo: pageNoBody = 1,
        pageSize: pageSizeBody = 10,
        search = '',
        role = '',
        jobRoleCode = '',
        contractStatus = '',
        sortBy,
        sortOrder
      } = req.body || {};

      const allowedSortFields = ['name', 'email', 'role', 'jobRoleCode', 'contractStart', 'contractEnd', 'createdAt'];
      const orderBy = buildOrderBy(sortBy, sortOrder, allowedSortFields, { sortBy: 'createdAt', sortOrder: 'desc' });

      const pageNo = Math.max(parseInt(pageNoBody, 10) || 1, 1);
      const pageSize = Math.min(Math.max(parseInt(pageSizeBody, 10) || 10, 1), 50);
      const skip = (pageNo - 1) * pageSize;
      const andWhere = [];

      if (search) {
        andWhere.push({
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
          ]
        });
      }
      // Fetch roles mapping lookup
      const [allUserRoles, allRoleMasters] = await Promise.all([
        prisma.userRole.findMany(),
        prisma.roleMaster.findMany()
      ]);

      const roleMasterMap = new Map(allRoleMasters.map(r => [Number(r.id), r.name]));
      const userRoleInfoMap = new Map();
      allUserRoles.forEach(ur => {
        const rName = roleMasterMap.get(Number(ur.roleId));
        if (rName) {
          userRoleInfoMap.set(ur.userName, { roleId: Number(ur.roleId), roleName: rName });
        }
      });

      if (role) {
        if (!isNaN(role)) {
          // Filtered by roleId
          const targetRoleId = Number(role);
          const matchedUserNames = new Set(
            allUserRoles.filter(ur => Number(ur.roleId) === targetRoleId).map(ur => ur.userName)
          );
          andWhere.push({
            OR: [
              { email: { in: Array.from(matchedUserNames) } },
              { id: { in: Array.from(matchedUserNames) } }
            ]
          });
        } else {
          // Filtered by role string (e.g. ADMIN / MEMBER or Role Name)
          andWhere.push({ role });
        }
      }
      if (jobRoleCode) andWhere.push({ jobRoleCode });

      const where = andWhere.length ? { AND: andWhere } : {};
      const select = {
        id: true, email: true, name: true, role: true, jobRoleCode: true,
        phone: true, contractStart: true, contractEnd: true,
        profilePhoto: true, profilePhotoName: true, createdAt: true,
        ktpNumberEncrypted: true, kkNumberEncrypted: true,
        contracts: { orderBy: { endDate: 'desc' }, take: 1 },
        projects: { include: { project: { select: { name: true } } } }
      };
      const toSafeUser = user => {
        const urInfo = userRoleInfoMap.get(user.email) || userRoleInfoMap.get(user.id) || null;
        const roleName = urInfo ? urInfo.roleName : (user.role === 'ADMIN' ? 'System Administrator' : 'STAFF');
        const roleId = urInfo ? urInfo.roleId : (user.role === 'ADMIN' ? 1 : 4);

        return {
          ...user,
          roleId,
          roleName,
          ktpNumberEncrypted: undefined,
          kkNumberEncrypted: undefined,
          ktpNumberMasked: maskEncryptedNumber(user.ktpNumberEncrypted),
          kkNumberMasked: maskEncryptedNumber(user.kkNumberEncrypted)
        };
      };

      let totalRows;
      let users;

      if (contractStatus) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

        const candidates = await prisma.user.findMany({
          where,
          select,
          orderBy
        });
        const matchesStatus = user => {
          const contractEnd = user.contracts[0]?.endDate || user.contractEnd;
          if (!contractEnd) return false;
          const endDate = new Date(contractEnd);
          if (contractStatus === 'active') return endDate >= today;
          if (contractStatus === 'expired') return endDate < today;
          if (contractStatus === 'expiring_30_days') {
            return endDate >= today && endDate <= thirtyDaysLater;
          }
          return true;
        };
        const filteredUsers = candidates.filter(matchesStatus);
        totalRows = filteredUsers.length;
        users = filteredUsers.slice(skip, skip + pageSize);
      } else {
        [totalRows, users] = await Promise.all([
          prisma.user.count({ where }),
          prisma.user.findMany({
            where,
            select,
            orderBy,
            skip,
            take: pageSize
          })
        ]);
      }

      res.json({
        data: users.map(toSafeUser),
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

  // GET members ordered by project availability (Admin)
  router.get('/available-members', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { startDate, endDate, skill } = req.query;
      if ((startDate && !isDateInput(startDate)) || (endDate && !isDateInput(endDate))) {
        return res.status(400).json({ error: 'Format tanggal harus YYYY-MM-DD' });
      }
      if (startDate && endDate && startDate > endDate) {
        return res.status(400).json({ error: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai' });
      }

      const parseDateOnly = (value) => {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
      };
      const toDateOnly = (date) => {
        if (!date) return null;
        const value = new Date(date);
        return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
      };

      const rangeStart = startDate ? parseDateOnly(startDate) : (endDate ? parseDateOnly(endDate) : null);
      const rangeEnd = endDate ? parseDateOnly(endDate) : rangeStart;
      const today = toDateOnly(new Date());

      const jobRoles = await prisma.systemMaster.findMany({
        where: { category: 'JOB_ROLE', isActive: true },
        select: { code: true, name: true }
      });
      const jobRoleMap = new Map(jobRoles.map(role => [role.code, role.name]));

      const users = await prisma.user.findMany({
        where: {
          role: 'MEMBER',
          ...(skill ? { jobRoleCode: skill } : {})
        },
        select: {
          id: true, name: true, email: true, jobRoleCode: true, skill: true,
          projects: {
            where: {
              project: { status: 'active' }
            },
            include: { project: { select: { id: true, name: true, contractStart: true, contractEnd: true } } }
          }
        },
        orderBy: { name: 'asc' }
      });

      const rows = users.map(user => {
        const sortedAssignments = user.projects
          .map(item => ({
            ...item,
            assignedStart: toDateOnly(item.joinedAt || item.project.contractStart),
            assignedEnd: toDateOnly(item.leftAt || item.project.contractEnd)
          }))
          .filter(item => item.assignedStart && item.assignedEnd)
          .sort((a, b) => a.assignedStart.getTime() - b.assignedStart.getTime());

        const conflictAssignments = sortedAssignments.filter(item => (
          rangeStart
            ? item.assignedStart <= rangeEnd && item.assignedEnd >= rangeStart
            : item.assignedStart <= today && item.assignedEnd >= today
        ));

        const isAvailable = conflictAssignments.length === 0;

        let availabilityStatus = 'Available Now';
        let availableFrom = null;
        let availableUntil = null;
        let priorityOrder = 0;

        if (!isAvailable) {
          availableFrom = new Date(Math.min(...conflictAssignments.map(item => item.assignedStart.getTime())));
          let busyUntil = new Date(Math.max(...conflictAssignments.map(item => item.assignedEnd.getTime())));
          for (const item of sortedAssignments) {
            if (item.assignedStart > today && item.assignedStart <= busyUntil) {
              if (item.assignedEnd > busyUntil) {
                busyUntil = item.assignedEnd;
              }
            }
          }
          availableUntil = busyUntil;
          availabilityStatus = 'Available From';
          priorityOrder = busyUntil.getTime();
        } else if (rangeStart) {
          availabilityStatus = 'Available On Selected Date';
          availableFrom = rangeStart;
          const futureAssignments = sortedAssignments.filter(item => item.assignedStart > rangeStart);
          availableUntil = futureAssignments.length > 0 ? futureAssignments[0].assignedStart : null;
        } else {
          availableFrom = null;
          const futureAssignments = sortedAssignments.filter(item => item.assignedStart > today);
          availableUntil = futureAssignments.length > 0 ? futureAssignments[0].assignedStart : null;
        }

        const totalAllocation = conflictAssignments.reduce((sum, item) => sum + (item.allocation || 100), 0);
        const remainingAllocation = Math.max(0, 100 - totalAllocation);
        const assignedProjectsList = conflictAssignments.map(item => ({
          id: item.project.id,
          name: item.project.name,
          allocation: item.allocation || 100
        }));

        let currentProjectText = null;
        if (conflictAssignments.length > 0) {
          const projectDetails = conflictAssignments
            .map(item => `${item.project.name} (${item.allocation || 100}%)`)
            .join(', ');
          currentProjectText = `${projectDetails} [Total: ${totalAllocation}%, Sisa: ${remainingAllocation}%]`;
        }

        return {
          user_id: user.id,
          name: user.name,
          email: user.email,
          job_title: jobRoleMap.get(user.jobRoleCode) || user.jobRoleCode || null,
          job_role_code: user.jobRoleCode,
          job_role_name: jobRoleMap.get(user.jobRoleCode) || user.jobRoleCode || null,
          skill: user.skill,
          current_project: currentProjectText,
          total_allocation: totalAllocation,
          remaining_allocation: remainingAllocation,
          assigned_projects: assignedProjectsList,
          available_from: availableFrom,
          available_until: availableUntil,
          availability_status: availabilityStatus,
          matching_score: priorityOrder,
          priority_order: priorityOrder
        };
      });

      rows.sort((a, b) => a.priority_order - b.priority_order || a.name.localeCompare(b.name));
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST available members search with filters and pagination
  router.post('/available-members/search', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const {
        pageNo: pageNoBody = 1,
        pageSize: pageSizeBody = 10,
        startDate = '',
        endDate = '',
        skill = '',
        search = '',
        sortBy = 'priority_order',
        sortOrder = 'asc'
      } = req.body || {};

      const pageNo = Math.max(parseInt(pageNoBody, 10) || 1, 1);
      const pageSize = Math.min(Math.max(parseInt(pageSizeBody, 10) || 10, 1), 50);
      const skip = (pageNo - 1) * pageSize;

      if ((startDate && !isDateInput(startDate)) || (endDate && !isDateInput(endDate))) {
        return res.status(400).json({ error: 'Format tanggal harus YYYY-MM-DD' });
      }

      if (startDate && endDate && startDate > endDate) {
        return res.status(400).json({ error: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai' });
      }

      const parseDateOnly = (value) => {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
      };

      const toDateOnly = (date) => {
        if (!date) return null;

        const value = new Date(date);
        return new Date(Date.UTC(
          value.getUTCFullYear(),
          value.getUTCMonth(),
          value.getUTCDate()
        ));
      };

      const normalizeSortParams = (requestedSortBy, requestedSortOrder) => {
        const allowedSortFields = [
          'name',
          'email',
          'job_title',
          'job_role_code',
          'job_role_name',
          'skill',
          'current_project',
          'available_from',
          'available_until',
          'availability_status',
          'matching_score',
          'priority_order'
        ];

        const normalizedSortBy = allowedSortFields.includes(requestedSortBy)
          ? requestedSortBy
          : 'priority_order';

        const normalizedSortOrder = ['asc', 'desc'].includes(String(requestedSortOrder).toLowerCase())
          ? String(requestedSortOrder).toLowerCase()
          : 'asc';

        return {
          sortBy: normalizedSortBy,
          sortOrder: normalizedSortOrder
        };
      };

      const compareAvailableMembers = (a, b, field, order) => {
        const direction = order === 'desc' ? -1 : 1;

        const getValue = (row) => {
          if (field === 'available_from' || field === 'available_until') {
            return row[field] ? new Date(row[field]).getTime() : 0;
          }

          if (field === 'matching_score' || field === 'priority_order') {
            return Number(row[field] || 0);
          }

          return row[field] ?? '';
        };

        const valueA = getValue(a);
        const valueB = getValue(b);

        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return (valueA - valueB) * direction;
        }

        return String(valueA).localeCompare(String(valueB), 'id', {
          sensitivity: 'base',
          numeric: true
        }) * direction;
      };

      const rangeStart = startDate ? parseDateOnly(startDate) : (endDate ? parseDateOnly(endDate) : null);
      const rangeEnd = endDate ? parseDateOnly(endDate) : rangeStart;
      const today = toDateOnly(new Date());

      const jobRoles = await prisma.systemMaster.findMany({
        where: {
          category: 'JOB_ROLE',
          isActive: true
        },
        select: {
          code: true,
          name: true
        }
      });

      const jobRoleMap = new Map(jobRoles.map(role => [role.code, role.name]));

      const users = await prisma.user.findMany({
        where: {
          role: 'MEMBER',
          ...(skill ? { jobRoleCode: skill } : {}),
          ...(search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          } : {})
        },
        select: {
          id: true,
          name: true,
          email: true,
          jobRoleCode: true,
          skill: true,
          projects: {
            where: {
              project: {
                status: 'active'
              }
            },
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  contractStart: true,
                  contractEnd: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      let rows = users.map(user => {
        const sortedAssignments = user.projects
          .map(item => ({
            ...item,
            assignedStart: toDateOnly(item.joinedAt || item.project.contractStart),
            assignedEnd: toDateOnly(item.leftAt || item.project.contractEnd)
          }))
          .filter(item => item.assignedStart && item.assignedEnd)
          .sort((a, b) => a.assignedStart.getTime() - b.assignedStart.getTime());

        const conflictAssignments = sortedAssignments.filter(item => (
          rangeStart
            ? item.assignedStart <= rangeEnd && item.assignedEnd >= rangeStart
            : item.assignedStart <= today && item.assignedEnd >= today
        ));

        const isAvailable = conflictAssignments.length === 0;

        let availabilityStatus = 'Available Now';
        let availableFrom = null;
        let availableUntil = null;
        let priorityOrder = 0;

        if (!isAvailable) {
          availableFrom = new Date(Math.min(...conflictAssignments.map(item => item.assignedStart.getTime())));
          let busyUntil = new Date(Math.max(...conflictAssignments.map(item => item.assignedEnd.getTime())));
          for (const item of sortedAssignments) {
            if (item.assignedStart > today && item.assignedStart <= busyUntil) {
              if (item.assignedEnd > busyUntil) {
                busyUntil = item.assignedEnd;
              }
            }
          }
          availableUntil = busyUntil;
          availabilityStatus = 'Available From';
          priorityOrder = busyUntil.getTime();
        } else if (rangeStart) {
          availabilityStatus = 'Available On Selected Date';
          availableFrom = rangeStart;
          const futureAssignments = sortedAssignments.filter(item => item.assignedStart > rangeStart);
          availableUntil = futureAssignments.length > 0 ? futureAssignments[0].assignedStart : null;
        } else {
          availableFrom = null;
          const futureAssignments = sortedAssignments.filter(item => item.assignedStart > today);
          availableUntil = futureAssignments.length > 0 ? futureAssignments[0].assignedStart : null;
        }

        const totalAllocation = conflictAssignments.reduce((sum, item) => sum + (item.allocation || 100), 0);
        const remainingAllocation = Math.max(0, 100 - totalAllocation);
        const assignedProjectsList = conflictAssignments.map(item => ({
          id: item.project.id,
          name: item.project.name,
          allocation: item.allocation || 100
        }));

        let currentProjectText = null;
        if (conflictAssignments.length > 0) {
          const projectDetails = conflictAssignments
            .map(item => `${item.project.name} (${item.allocation || 100}%)`)
            .join(', ');
          currentProjectText = `${projectDetails} [Total: ${totalAllocation}%, Sisa: ${remainingAllocation}%]`;
        }

        return {
          user_id: user.id,
          name: user.name,
          email: user.email,
          job_title: jobRoleMap.get(user.jobRoleCode) || user.jobRoleCode || null,
          job_role_code: user.jobRoleCode,
          job_role_name: jobRoleMap.get(user.jobRoleCode) || user.jobRoleCode || null,
          skill: user.skill,
          current_project: currentProjectText,
          total_allocation: totalAllocation,
          remaining_allocation: remainingAllocation,
          assigned_projects: assignedProjectsList,
          available_from: availableFrom,
          available_until: availableUntil,
          availability_status: availabilityStatus,
          matching_score: priorityOrder,
          priority_order: priorityOrder,
          has_conflict: !isAvailable
        };
      });

      if (rangeStart) {
        rows = rows.filter(row => !row.has_conflict);
      }

      const normalizedSort = normalizeSortParams(sortBy, sortOrder);

      rows.sort((a, b) => {
        const result = compareAvailableMembers(
          a,
          b,
          normalizedSort.sortBy,
          normalizedSort.sortOrder
        );

        if (result !== 0) {
          return result;
        }

        return a.name.localeCompare(b.name, 'id', {
          sensitivity: 'base',
          numeric: true
        });
      });

      const totalRows = rows.length;

      return res.json({
        data: rows.slice(skip, skip + pageSize),
        page: {
          pageNo,
          pageSize,
          totalRows,
          totalPages: Math.ceil(totalRows / pageSize)
        },
        sort: {
          sortBy: normalizedSort.sortBy,
          sortOrder: normalizedSort.sortOrder
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  });



  router.post('/contract-number', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const contractNumber = await generateContractNumber(prisma);
      res.json({ contractNumber });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST create user (Admin)
  const handleCreateUser = async (req, res) => {
    try {
      const { email, password, name, role, roleId, jobRoleCode, contractStart, contractEnd } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, dan nama wajib diisi' });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: 'Email sudah terdaftar' });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const isSystemAdminRole = roleId === 1 || roleId === '1' || role === 'ADMIN';

      const user = await prisma.user.create({
        data: {
          email, passwordHash, name,
          role: isSystemAdminRole ? 'ADMIN' : 'MEMBER',
          jobRoleCode: jobRoleCode || null,
          contractStart: contractStart ? new Date(contractStart) : null,
          contractEnd: contractEnd ? new Date(contractEnd) : null,
        }
      });

      // Save role in tb_m_user_role
      const targetRoleId = roleId ? BigInt(roleId) : (isSystemAdminRole ? BigInt(1) : BigInt(4));
      await prisma.userRole.deleteMany({
        where: { OR: [{ userName: user.email }, { userName: user.id }] }
      });
      await prisma.userRole.create({
        data: {
          userName: user.email,
          roleId: targetRoleId,
          createdBy: req.user.email || req.user.name || 'system'
        }
      });

      res.status(201).json({ message: 'User berhasil dibuat', userId: user.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  router.post('/add', authenticateToken, authenticateAdmin, handleCreateUser);
  router.post('/', authenticateToken, authenticateAdmin, handleCreateUser);

  // PUT update user (Admin)
  router.put('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const { email, name, role, roleId, jobRoleCode, contractStart, contractEnd, password } = req.body;
      const data = {};
      if (email) data.email = email;
      if (name) data.name = name;
      if (roleId === 1 || roleId === '1' || role === 'ADMIN') {
        data.role = 'ADMIN';
      } else if (roleId) {
        data.role = 'MEMBER';
      }
      if (jobRoleCode !== undefined) data.jobRoleCode = jobRoleCode || null;
      if (contractStart !== undefined) data.contractStart = contractStart ? new Date(contractStart) : null;
      if (contractEnd !== undefined) data.contractEnd = contractEnd ? new Date(contractEnd) : null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        data.passwordHash = await bcrypt.hash(password, salt);
      }

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data
      });

      // Save updated role in tb_m_user_role if provided
      if (roleId) {
        const targetRoleId = BigInt(roleId);
        await prisma.userRole.deleteMany({
          where: { OR: [{ userName: user.email }, { userName: user.id }] }
        });
        await prisma.userRole.create({
          data: {
            userName: user.email || user.id,
            roleId: targetRoleId,
            createdBy: req.user.email || req.user.name || 'system'
          }
        });
      }

      res.json({ message: 'User berhasil diperbarui' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });


  // GET detail user (Admin)
  router.get('/:id/detail', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        include: {
          projects: { include: { project: { select: { id: true, name: true, status: true } } } },
          documents: {
            select: {
              id: true, fileName: true, fileType: true, documentType: true, label: true,
              originalFileName: true, storedFileName: true, filePath: true, mimeType: true,
              fileSize: true, uploadedAt: true, createdAt: true, updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
          },
          jobHistories: { orderBy: { startDate: 'desc' } },
          contracts: { orderBy: { startDate: 'desc' } }
        }
      });

      if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

      const contractsWithBalance = await Promise.all(
        (user.contracts || []).map(async (contract) => {
          const balance = await getLeaveBalance(prisma, user.id, contract.id);
          return {
            ...contract,
            annualLeaveQuota: contract.annualLeaveQuota ?? 12,
            leaveBalance: {
              entitlementDays: balance.entitlementDays,
              usedLeaveDays: balance.usedLeaveDays,
              remainingLeaveDays: balance.remainingLeaveDays
            }
          };
        })
      );

      const ktpNumber = decryptSafe(user.ktpNumberEncrypted);
      const kkNumber = decryptSafe(user.kkNumberEncrypted);
      const { passwordHash, ktpNumberEncrypted, kkNumberEncrypted, cvFile, ...safeUser } = user;

      res.json({
        ...safeUser,
        contracts: contractsWithBalance,
        ktpNumber,
        kkNumber,
        ktpNumberMasked: maskSensitiveNumber(ktpNumber),
        kkNumberMasked: maskSensitiveNumber(kkNumber),
        hasCvFile: Boolean(cvFile || user.documents.some(doc => doc.documentType === 'CV'))
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET download user file (Admin)
  router.get('/admin/:id/files/:fileId/download', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const document = await prisma.userDocument.findFirst({
        where: { id: req.params.fileId, userId: req.params.id }
      });

      if (!document) return res.status(404).json({ error: 'File tidak ditemukan' });
      res.json(toDownloadPayload(document));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/admin/:id/documents', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const document = await createDocument(prisma, req.params.id, req.body);
      res.status(201).json({ message: 'File berhasil diupload', document });
    } catch (error) {
      if (error.message) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/me/job-histories', authenticateToken, async (req, res) => createJobHistory(prisma, req.user.id, req, res));
  router.put('/me/job-histories/:historyId', authenticateToken, async (req, res) => updateJobHistory(prisma, req.user.id, req.params.historyId, req, res));
  router.delete('/me/job-histories/:historyId', authenticateToken, async (req, res) => deleteHistory(prisma.userJobHistory, req.user.id, req.params.historyId, res));
  router.post('/:id/job-histories', authenticateToken, authenticateAdmin, async (req, res) => createJobHistory(prisma, req.params.id, req, res));
  router.put('/:id/job-histories/:historyId', authenticateToken, authenticateAdmin, async (req, res) => updateJobHistory(prisma, req.params.id, req.params.historyId, req, res));
  router.delete('/:id/job-histories/:historyId', authenticateToken, authenticateAdmin, async (req, res) => deleteHistory(prisma.userJobHistory, req.params.id, req.params.historyId, res));
  router.post('/:id/contracts', authenticateToken, authenticateAdmin, async (req, res) => createContract(prisma, req.params.id, req, res));
  router.put('/:id/contracts/:contractId', authenticateToken, authenticateAdmin, async (req, res) => updateContract(prisma, req.params.id, req.params.contractId, req, res));
  router.delete('/:id/contracts/:contractId', authenticateToken, authenticateAdmin, async (req, res) => deleteHistory(prisma.userContract, req.params.id, req.params.contractId, res));

  // DELETE user (Admin)
  router.delete('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET users with expiring contracts (Admin — notifications)
  router.get('/expiring-contracts', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const now = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(now.getDate() + 30);

      const [contracts, legacyUsers] = await Promise.all([
        prisma.userContract.findMany({
          where: { endDate: { gte: now, lte: thirtyDaysLater } },
          include: { user: { select: { id: true, name: true, email: true, jobRoleCode: true } } },
          orderBy: { endDate: 'asc' }
        }),
        prisma.user.findMany({
          where: {
            contractEnd: { gte: now, lte: thirtyDaysLater },
            contracts: { none: {} }
          },
          select: {
            id: true, name: true, email: true, jobRoleCode: true,
            contractStart: true, contractEnd: true
          }
        })
      ]);
      const rows = contracts.map(contract => ({
        ...contract.user,
        contractStart: contract.startDate,
        contractEnd: contract.endDate,
        contractNumber: contract.contractNumber
      })).concat(legacyUsers);
      rows.sort((first, second) => new Date(first.contractEnd) - new Date(second.contractEnd));
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMBER: Profile
  // ═══════════════════════════════════════════════════════════════════════════

  // GET my profile
  router.get('/me/profile', authenticateToken, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true, email: true, name: true, role: true, jobRoleCode: true,
          phone: true, address: true, birthDate: true, birthPlace: true,
          gender: true, religion: true, maritalStatus: true, education: true,
          cvFileName: true, profilePhoto: true, profilePhotoName: true,
          workingExperience: true, skill: true, emergencyContactName: true,
          emergencyContactPhone: true, fatherName: true, motherName: true,
          ktpNumberEncrypted: true, kkNumberEncrypted: true,
          documents: {
            select: {
              id: true, fileName: true, fileType: true, documentType: true, label: true,
              originalFileName: true, storedFileName: true, filePath: true, mimeType: true,
              fileSize: true, uploadedAt: true, createdAt: true, updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
          },
          jobHistories: { orderBy: { startDate: 'desc' } },
          projects: { include: { project: { select: { id: true, name: true, status: true } } } }
        }
      });

      if (user.jobRoleCode) {
        const roleMaster = await prisma.systemMaster.findUnique({
          where: { category_code: { category: 'JOB_ROLE', code: user.jobRoleCode } }
        });
        if (roleMaster) user.jobRoleName = roleMaster.name;
      }

      const ktpNumber = decryptSafe(user?.ktpNumberEncrypted);
      const kkNumber = decryptSafe(user?.kkNumberEncrypted);
      const contractInfo = await getCurrentUserContract(prisma, req.user.id);

      res.json({
        ...user,
        ...contractInfo,
        ktpNumberEncrypted: undefined,
        kkNumberEncrypted: undefined,
        ktpNumberMasked: maskSensitiveNumber(ktpNumber),
        kkNumberMasked: maskSensitiveNumber(kkNumber)
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // PUT update my profile
  router.put('/me/profile', authenticateToken, async (req, res) => {
    try {
      const data = {};
      for (const field of PROFILE_FIELDS) {
        if (req.body[field] !== undefined) data[field] = req.body[field] || null;
      }

      const { birthDate, ktpNumber, kkNumber, emergencyContactPhone } = req.body;
      if (birthDate !== undefined) data.birthDate = birthDate ? new Date(birthDate) : null;
      if (emergencyContactPhone !== undefined && emergencyContactPhone && !isPhone(emergencyContactPhone)) {
        return res.status(400).json({ error: 'Nomor darurat tidak valid' });
      }
      if (ktpNumber !== undefined && ktpNumber) {
        if (!isFixedNumeric(ktpNumber, 16)) return res.status(400).json({ error: 'Nomor KTP harus 16 digit numerik' });
        data.ktpNumberEncrypted = encryptText(ktpNumber);
      }
      if (kkNumber !== undefined && kkNumber) {
        if (!isFixedNumeric(kkNumber, 16)) return res.status(400).json({ error: 'Nomor KK harus 16 digit numerik' });
        data.kkNumberEncrypted = encryptText(kkNumber);
      }

      await prisma.user.update({ where: { id: req.user.id }, data });
      res.json({ message: 'Profil berhasil diperbarui' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // PUT change password
  router.put('/me/change-password', authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const result = await changeUserPassword(prisma, req.user.id, currentPassword, newPassword, confirmPassword);
      res.json(result);
    } catch (error) {
      if (error.message === 'User tidak ditemukan') {
        res.status(404).json({ error: error.message });
      } else if (
        error.message.includes('wajib diisi') ||
        error.message.includes('minimal 8 karakter') ||
        error.message.includes('tidak sesuai') ||
        error.message.includes('tidak boleh sama')
      ) {
        res.status(400).json({ error: error.message });
      } else {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
    }
  });

  // POST upload profile/supporting document
  router.post('/me/documents', authenticateToken, async (req, res) => {
    try {
      const { fileData, fileName, documentType } = req.body;
      const normalizedType = normalizeDocumentType(documentType);
      const document = await createDocument(prisma, req.user.id, req.body);

      const profileUpdate = {};
      if (normalizedType === 'FOTO') {
        profileUpdate.profilePhoto = fileData;
        profileUpdate.profilePhotoName = document.storedFileName;
      }
      if (normalizedType === 'CV') {
        profileUpdate.cvFile = fileData;
        profileUpdate.cvFileName = document.storedFileName;
      }
      if (Object.keys(profileUpdate).length > 0) {
        await prisma.user.update({ where: { id: req.user.id }, data: profileUpdate });
      }

      res.status(201).json({ message: 'File berhasil diupload', document });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET download own uploaded file
  router.get('/me/files/:fileId/download', authenticateToken, async (req, res) => {
    try {
      const document = await prisma.userDocument.findFirst({
        where: { id: req.params.fileId, userId: req.user.id }
      });

      if (!document) return res.status(404).json({ error: 'File tidak ditemukan' });
      res.json(toDownloadPayload(document));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST upload & parse CV
  router.post('/me/cv', authenticateToken, async (req, res) => {
    try {
      const { cvFile, cvFileName, label } = req.body;
      if (!cvFile) return res.status(400).json({ error: 'File CV wajib diupload' });
      const validationError = validateFile(cvFile, cvFileName || 'cv.pdf', 'application/pdf');
      if (validationError) return res.status(400).json({ error: validationError });

      // Store the CV file
      await prisma.user.update({
        where: { id: req.user.id },
        data: { cvFile, cvFileName: cvFileName || 'cv.pdf' }
      });
      const document = await createDocument(prisma, req.user.id, {
        fileName: cvFileName || 'cv.pdf',
        fileType: 'application/pdf',
        fileData: cvFile,
        documentType: 'CV',
        label: label || 'Curriculum Vitae'
      });
      await prisma.user.update({
        where: { id: req.user.id },
        data: { cvFileName: document.storedFileName }
      });

      // Try to parse the PDF and extract info
      let parsedData = {};
      try {
        // Remove base64 prefix if exists
        const base64Data = cvFile.replace(/^data:application\/pdf;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        const text = pdfData.text;
        await parser.destroy();

        // Simple ATS-style extraction
        parsedData = extractFromCV(text);
        console.log('Check parsing data: ', parsedData);
      } catch (parseErr) {
        console.error('CV parse error :', parseErr.message);
      }

      res.json({ message: 'CV berhasil diupload', parsed: parsedData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET download my CV
  router.get('/me/cv', authenticateToken, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { cvFile: true, cvFileName: true }
      });
      if (!user?.cvFile) return res.status(404).json({ error: 'CV belum diupload' });
      res.json({ cvFile: user.cvFile, cvFileName: user.cvFileName });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Backward-compatible admin document paths, after /me routes to avoid collisions.
  router.get('/:id/files/:fileId/download', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const document = await prisma.userDocument.findFirst({
        where: { id: req.params.fileId, userId: req.params.id }
      });
      if (!document) return res.status(404).json({ error: 'File tidak ditemukan' });
      res.json(toDownloadPayload(document));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/:id/documents', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
      const document = await createDocument(prisma, req.params.id, req.body);
      res.status(201).json({ message: 'File berhasil diupload', document });
    } catch (error) {
      if (error.message) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

// ─── Helper: Extract info from CV text ──────────────────────────────────────
function extractFromCV(text) {
  const data = {};
  console.log('Check Extrack PDF Parse: ', text)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  // Name — usually the first non-empty line
  if (lines.length > 0) data.name = lines[0];

  // Email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) data.email = emailMatch[0];

  // Phone
  const phoneMatch = text.match(/(?:\+62|62|0)[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/);
  if (phoneMatch) data.phone = phoneMatch[0].replace(/\s/g, '');

  // Address — look for keywords
  const addressLine = lines.find(l => /alamat|address|jl\.|jalan/i.test(l));
  if (addressLine) data.address = addressLine.replace(/^(alamat|address)\s*[:;]\s*/i, '');

  // Birth date — look for patterns
  const birthMatch = text.match(/(?:tanggal lahir|ttl|born|dob)\s*[:;]?\s*([^\n,]+)/i);
  if (birthMatch) data.birthInfo = birthMatch[1].trim();

  // Gender
  if (/laki-laki|male/i.test(text)) data.gender = 'L';
  else if (/perempuan|female/i.test(text)) data.gender = 'P';

  // Religion
  const religions = ['islam', 'kristen', 'katolik', 'hindu', 'budha', 'konghucu'];
  for (const r of religions) {
    if (text.toLowerCase().includes(r)) {
      data.religion = r.charAt(0).toUpperCase() + r.slice(1);
      break;
    }
  }

  // Education
  const eduMatch = text.match(/(?:pendidikan|education)\s*[:;]?\s*([^\n]+)/i);
  if (eduMatch) data.education = eduMatch[1].trim();

  return data;
}

function decryptSafe(value) {
  try {
    return decryptText(value);
  } catch (error) {
    console.error('Decrypt error:', error.message);
    return null;
  }
}

function maskEncryptedNumber(encryptedValue) {
  return maskSensitiveNumber(decryptSafe(encryptedValue));
}

function isFixedNumeric(value, length) {
  return new RegExp(`^\\d{${length}}$`).test(String(value));
}

function isPhone(value) {
  return /^(?:\+62|62|0)[0-9\s-]{8,15}$/.test(String(value));
}

function normalizeDocumentType(value) {
  const allowed = ['KTP', 'KK', 'CV', 'FOTO', 'LAINNYA'];
  const normalized = String(value || 'LAINNYA').toUpperCase();
  return allowed.includes(normalized) ? normalized : 'LAINNYA';
}

function validateFile(fileData, fileName, fileType) {
  return validateBase64File({
    fileData,
    fileName,
    mimeType: fileType,
    allowedMimeTypes: ALLOWED_FILE_TYPES,
    maxSizeBytes: MAX_FILE_SIZE,
    maxSizeLabel: '10MB'
  });
}

function toDownloadPayload(document) {
  return {
    fileData: document.fileData,
    fileName: document.storedFileName || document.fileName,
    fileType: document.mimeType || document.fileType || 'application/octet-stream',
    documentType: document.documentType
  };
}

async function createDocument(prisma, userId, payload) {
  const { fileData, fileName, fileType, documentType, label } = payload;
  const normalizedType = normalizeDocumentType(documentType);
  const validationError = validateFile(fileData, fileName, fileType);
  if (validationError) throw new Error(validationError);
  if (!String(label || '').trim()) throw new Error('Label file wajib diisi');

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  if (!user) throw new Error('User tidak ditemukan');
  const storedFileName = buildStoredFileName(userId, user.name, normalizedType, fileName);
  const fileSize = calculateBase64FileSize(fileData);

  return prisma.userDocument.create({
    data: {
      userId,
      fileName: storedFileName,
      fileType,
      fileData,
      documentType: normalizedType,
      label: String(label).trim(),
      originalFileName: fileName,
      storedFileName,
      filePath: `/uploads/users/${userId}/${storedFileName}`,
      mimeType: fileType,
      fileSize
    },
    select: {
      id: true, fileName: true, fileType: true, documentType: true, label: true,
      originalFileName: true, storedFileName: true, filePath: true, mimeType: true,
      fileSize: true, uploadedAt: true, createdAt: true, updatedAt: true
    }
  });
}

function buildStoredFileName(userId, userName, documentType, fileName) {
  const extension = String(fileName).split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const timestamp = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date()).replace(/[- :]/g, '');
  const clean = value => String(value).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_');
  return `${clean(userId)}_${clean(userName)}_${clean(documentType)}_${timestamp}.${extension}`;
}

function isDateInput(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value)) &&
    !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function validatePeriod(startDate, endDate) {
  if (startDate && !isDateInput(startDate)) return 'Format tanggal mulai harus YYYY-MM-DD';
  if (endDate && !isDateInput(endDate)) return 'Format tanggal selesai harus YYYY-MM-DD';
  if (startDate && endDate && startDate > endDate) return 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai';
  return null;
}

async function createJobHistory(prisma, userId, req, res) {
  try {
    const { companyName, jobTitle, description, startDate, endDate, isPresent } = req.body;
    if (!String(companyName || '').trim() || !String(jobTitle || '').trim()) {
      return res.status(400).json({ error: 'Perusahaan dan jabatan wajib diisi' });
    }
    const periodError = validatePeriod(startDate, isPresent ? null : endDate);
    if (periodError) return res.status(400).json({ error: periodError });
    const history = await prisma.userJobHistory.create({
      data: {
        userId, companyName: companyName.trim(), jobTitle: jobTitle.trim(),
        description: description || null, startDate: startDate ? new Date(startDate) : null,
        endDate: !isPresent && endDate ? new Date(endDate) : null, isPresent: Boolean(isPresent)
      }
    });
    res.status(201).json({ message: 'Riwayat pekerjaan berhasil ditambahkan', history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateJobHistory(prisma, userId, id, req, res) {
  try {
    const existing = await prisma.userJobHistory.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Riwayat pekerjaan tidak ditemukan' });
    const { companyName, jobTitle, description, startDate, endDate, isPresent } = req.body;
    if (!String(companyName || '').trim() || !String(jobTitle || '').trim()) {
      return res.status(400).json({ error: 'Perusahaan dan jabatan wajib diisi' });
    }
    const periodError = validatePeriod(startDate, isPresent ? null : endDate);
    if (periodError) return res.status(400).json({ error: periodError });
    const history = await prisma.userJobHistory.update({
      where: { id },
      data: {
        companyName: companyName.trim(), jobTitle: jobTitle.trim(), description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: !isPresent && endDate ? new Date(endDate) : null, isPresent: Boolean(isPresent)
      }
    });
    res.json({ message: 'Riwayat pekerjaan berhasil diperbarui', history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

function validateContract(payload) {
  const { vendor, startDate, endDate, contractValue, annualLeaveQuota } = payload;
  if (!String(vendor || '').trim()) return 'Vendor wajib diisi';
  const periodError = validatePeriod(startDate, endDate);
  if (periodError) return periodError;
  if (!startDate || !endDate) return 'Tanggal mulai dan selesai kontrak wajib diisi';
  if (contractValue === '' || contractValue === null || contractValue === undefined ||
    !Number.isFinite(Number(contractValue)) || Number(contractValue) < 0) {
    return 'Nilai kontrak harus numerik dan minimal 0';
  }
  if (annualLeaveQuota !== undefined && annualLeaveQuota !== null && annualLeaveQuota !== '') {
    const quotaNum = Number(annualLeaveQuota);
    if (!Number.isInteger(quotaNum) || quotaNum < 0) {
      return 'Jatah cuti tahunan harus berupa bilangan bulat positif atau 0';
    }
  }
  return null;
}

async function createContract(prisma, userId, req, res) {
  try {
    const error = validateContract(req.body);
    if (error) return res.status(400).json({ error });
    const { vendor, startDate, endDate, contractValue, annualLeaveQuota } = req.body;
    const contractNumber = req.body.contractNumber
      ? await acceptGeneratedContractNumber(prisma, req.body.contractNumber)
      : await generateContractNumber(prisma);
    
    const quota = (annualLeaveQuota !== undefined && annualLeaveQuota !== null && annualLeaveQuota !== '')
      ? Number(annualLeaveQuota)
      : 12;

    const contract = await prisma.userContract.create({
      data: {
        userId, contractNumber, vendor: vendor.trim(),
        startDate: new Date(startDate), endDate: new Date(endDate), contractValue: String(contractValue),
        annualLeaveQuota: quota
      }
    });
    res.status(201).json({ message: 'Kontrak berhasil ditambahkan', contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateContract(prisma, userId, id, req, res) {
  try {
    const existing = await prisma.userContract.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Kontrak tidak ditemukan' });
    const validationError = validateContract(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    const { vendor, startDate, endDate, contractValue, annualLeaveQuota } = req.body;
    const updateData = {
      vendor: vendor.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      contractValue: String(contractValue)
    };
    if (annualLeaveQuota !== undefined && annualLeaveQuota !== null && annualLeaveQuota !== '') {
      updateData.annualLeaveQuota = Number(annualLeaveQuota);
    }
    const contract = await prisma.userContract.update({
      where: { id },
      data: updateData
    });
    res.json({ message: 'Kontrak berhasil diperbarui', contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function generateContractNumber(prisma) {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date()).replace(/-/g, '');
  let number;
  let exists;
  do {
    number = `CTR-${date}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    exists = await prisma.userContract.findUnique({ where: { contractNumber: number } });
  } while (exists);
  return number;
}

async function acceptGeneratedContractNumber(prisma, value) {
  const contractNumber = String(value).trim();
  if (!/^CTR-\d{8}-[A-F0-9]{8}$/.test(contractNumber)) {
    return generateContractNumber(prisma);
  }
  const exists = await prisma.userContract.findUnique({ where: { contractNumber } });
  return exists ? generateContractNumber(prisma) : contractNumber;
}

async function deleteHistory(model, userId, id, res) {
  try {
    const result = await model.deleteMany({ where: { id, userId } });
    if (!result.count) return res.status(404).json({ error: 'Data history tidak ditemukan' });
    res.json({ message: 'Data history berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

/*****/
/** Nama Function: calculateContractStatus **/
/** Deskripsi Function: Menghitung status kontrak berdasarkan periode kontrak dan tanggal hari ini **/
/** Creator by: FID.Iyan **/
/*****/
function calculateContractStatus(contractStart, contractEnd) {
  if (!contractStart || !contractEnd) {
    return {
      contractStatus: 'NO_CONTRACT',
      isExpired: false,
      isExpiringSoon: false,
      remainingDays: null
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(contractStart);
  start.setHours(0, 0, 0, 0);

  const end = new Date(contractEnd);
  end.setHours(0, 0, 0, 0);

  let contractStatus = 'NO_CONTRACT';
  let isExpired = false;
  let isExpiringSoon = false;
  let remainingDays = null;

  if (end < today) {
    contractStatus = 'EXPIRED';
    isExpired = true;
  } else if (start <= today && end >= today) {
    contractStatus = 'ACTIVE';
  } else if (start > today) {
    contractStatus = 'UPCOMING';
  }

  if (end >= today) {
    const diffTime = end.getTime() - today.getTime();
    remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (remainingDays <= 30) {
      isExpiringSoon = true;
    }
  }

  return {
    contractStatus,
    isExpired,
    isExpiringSoon,
    remainingDays
  };
}
/*****/
/** Nama Function: getCurrentUserContract **/
/** Deskripsi Function: Mengambil kontrak aktif atau kontrak terakhir milik user login **/
/** Creator by: FID.Iyan **/
/*****/
async function getCurrentUserContract(prisma, userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      contracts: {
        orderBy: {
          endDate: 'desc'
        }
      }
    }
  });

  if (!user) return null;

  let activeContract = null;
  let upcomingContract = null;
  let expiredContract = null;

  if (user.contracts && user.contracts.length > 0) {
    const upcomingContracts = [];

    for (const contract of user.contracts) {
      const statusObj = calculateContractStatus(contract.startDate, contract.endDate);
      if (statusObj.contractStatus === 'ACTIVE') {
        if (!activeContract) activeContract = { ...contract, ...statusObj };
      } else if (statusObj.contractStatus === 'UPCOMING') {
        upcomingContracts.push({ ...contract, ...statusObj });
      } else if (statusObj.contractStatus === 'EXPIRED') {
        if (!expiredContract) expiredContract = { ...contract, ...statusObj };
      }
    }

    const selectedContract = activeContract ||
      (upcomingContracts.length > 0 ? upcomingContracts.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0] : null) ||
      expiredContract;

    if (selectedContract) {
      const balance = await getLeaveBalance(prisma, userId, selectedContract.id);
      return {
        contractId: selectedContract.id,
        contractNumber: selectedContract.contractNumber,
        vendor: selectedContract.vendor,
        contractStart: selectedContract.startDate,
        contractEnd: selectedContract.endDate,
        contractValue: selectedContract.contractValue,
        annualLeaveQuota: selectedContract.annualLeaveQuota ?? 12,
        leaveBalance: {
          entitlementDays: balance.entitlementDays,
          usedLeaveDays: balance.usedLeaveDays,
          remainingLeaveDays: balance.remainingLeaveDays
        },
        contractStatus: selectedContract.contractStatus,
        isExpired: selectedContract.isExpired,
        isExpiringSoon: selectedContract.isExpiringSoon,
        remainingDays: selectedContract.remainingDays
      };
    }
  }

  if (user.contractStart && user.contractEnd) {
    const statusObj = calculateContractStatus(user.contractStart, user.contractEnd);
    return {
      contractNumber: '-',
      vendor: '-',
      contractStart: user.contractStart,
      contractEnd: user.contractEnd,
      contractValue: null,
      annualLeaveQuota: 12,
      leaveBalance: null,
      ...statusObj
    };
  }

  return {
    contractStatus: 'NO_CONTRACT',
    contractStart: null,
    contractEnd: null,
    contractNumber: null,
    vendor: null,
    contractValue: null,
    annualLeaveQuota: 0,
    leaveBalance: null,
    isExpired: false,
    isExpiringSoon: false,
    remainingDays: null
  };
}

// Name Function : projectResources
// Author : Iyan.FID
// Description : API route for fetching project resource allocation

const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

module.exports = (prisma) => {
  const handleGetOrPost = async (req, res) => {
    try {
      const { projectManagerId, projectId, memberId, year, activeOnly, search, startMonth, endMonth } = {
        ...req.query,
        ...req.body
      };
      
      const andWhere = [];
      let filterStartDate = null;
      let filterEndDate = null;

      const jobRoleMasters = await prisma.systemMaster.findMany({
        where: {
          category: 'JOB_ROLE',
          isActive: true
        },
        select: {
          code: true,
          name: true
        }
      });

      const jobRoleMap = new Map(
        jobRoleMasters.map((item) => [item.code, item.name])
      );

      if (startMonth) {
        filterStartDate = new Date(`${startMonth}-01T00:00:00.000Z`);
      }
      if (endMonth) {
        const [y, m] = endMonth.split('-');
        filterEndDate = new Date(Date.UTC(parseInt(y), parseInt(m), 0, 23, 59, 59, 999));
      }
      
      if (activeOnly === 'true') {
        andWhere.push({ status: 'active' });
      }
      if (projectManagerId) {
        andWhere.push({ projectManagerId });
      }
      if (projectId) {
        andWhere.push({ id: projectId });
      }
      
      if (search) {
         const lowerSearch = search.toLowerCase();
         const matchedJobRoleCodes = jobRoleMasters
           .filter(r => r.name.toLowerCase().includes(lowerSearch) || r.code.toLowerCase().includes(lowerSearch))
           .map(r => r.code);

         const memberSearchOr = [
           { name: { contains: search, mode: 'insensitive' } },
           { jobRoleCode: { contains: search, mode: 'insensitive' } }
         ];

         if (matchedJobRoleCodes.length > 0) {
           memberSearchOr.push({ jobRoleCode: { in: matchedJobRoleCodes } });
         }

         andWhere.push({
           OR: [
             { name: { contains: search, mode: 'insensitive' } },
             { 
               members: {
                 some: {
                   user: { OR: memberSearchOr }
                 }
               }
             }
           ]
         });
      }

      if (memberId) {
         andWhere.push({
           members: {
             some: { userId: memberId }
           }
         });
      }
      
      if (year) {
         const yearStart = new Date(`${year}-01-01`);
         const yearEnd = new Date(`${year}-12-31T23:59:59.999Z`);
         andWhere.push({
            contractStart: { lte: yearEnd },
            contractEnd: { gte: yearStart }
         });
      }



      if (filterEndDate) {
        andWhere.push({ contractStart: { lte: filterEndDate } });
      }
      if (filterStartDate) {
        andWhere.push({ contractEnd: { gte: filterStartDate } });
      }

      const where = andWhere.length ? { AND: andWhere } : {};

      const projects = await prisma.project.findMany({
        where,
        include: {
          projectManager: {
            select: { id: true, name: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, jobRoleCode: true }
              }
            }
          }
        },
        orderBy: [
          { projectManagerId: 'asc' },
          { contractStart: 'asc' }
        ]
      });

      const pmMap = {};
      const unassignedPMId = 'unassigned';

      for (const p of projects) {
        const validMembers = [];
        for (const m of p.members) {
          const mStart = m.joinedAt || p.contractStart;
          const mEnd = m.leftAt || p.contractEnd;
          
          let isValid = true;
          if (filterStartDate && mEnd < filterStartDate) isValid = false;
          if (filterEndDate && mStart > filterEndDate) isValid = false;
          if (memberId && m.userId !== memberId) isValid = false;
          
          if (isValid) {
            const code = m.user.jobRoleCode || m.roleInProject || '';
            const mappedName = code ? jobRoleMap.get(code) || code : '-';
            
            validMembers.push({
                id: m.userId,
                name: m.user.name,
                jobRoleCode: code,
                jobRoleName: mappedName,
                roleInProject: m.roleInProject,
                role: m.roleInProject || m.user.jobRoleCode || 'Member',
                startDate: mStart,
                endDate: mEnd
            });
          }
        }

        if (validMembers.length === 0 && (filterStartDate || filterEndDate)) {
          continue;
        }

        let pmId = p.projectManager?.id || unassignedPMId;
        let pmName = p.projectManager?.name || 'Unassigned';

        if (!pmMap[pmId]) {
          pmMap[pmId] = {
            id: pmId,
            name: pmName,
            projects: []
          };
        }

        const projectData = {
          id: p.id,
          name: p.name,
          customerName: p.customerName || p.customer,
          woNumber: p.woNumber,
          contractStart: p.contractStart,
          contractEnd: p.contractEnd,
          members: validMembers
        };
        
        pmMap[pmId].projects.push(projectData);
      }
      
      const projectManagers = Object.values(pmMap);

      res.json({
        projectManagers
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  router.get('/', authenticateToken, authenticateAdmin, handleGetOrPost);
  router.post('/', authenticateToken, authenticateAdmin, handleGetOrPost);

  return router;
};

const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

module.exports = (prisma) => {
  router.use(authenticateToken);
  router.use(authenticateAdmin);

  // ─── ROLES ─────────────────────────────────────────────────────────────
  router.get('/roles', async (req, res) => {
    try {
      const roles = await prisma.roleMaster.findMany({
        orderBy: { id: 'asc' }
      });
      res.json({ success: true, data: roles });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data role' });
    }
  });

  router.post('/roles/search', async (req, res) => {
    try {
      const {
        pageNo: pageNoBody = 1,
        pageSize: pageSizeBody = 5,
        name,
        description,
        sortBy,
        sortOrder
      } = req.body || {};
      const pageNo = Math.max(parseInt(pageNoBody, 10) || 1, 1);
      const pageSize = Math.min(Math.max(parseInt(pageSizeBody, 10) || 5, 1), 50);
      const skip = (pageNo - 1) * pageSize;

      const where = {};
      if (name) where.name = { contains: name };
      if (description) where.description = { contains: description };

      const orderBy = {};
      if (sortBy) orderBy[sortBy] = sortOrder || 'asc';

      const [roles, totalRows] = await Promise.all([
        prisma.roleMaster.findMany({
          where,
          orderBy,
          skip,
          take: pageSize
        }),
        prisma.roleMaster.count({ where })
      ]);

      const totalPages = Math.ceil(totalRows / pageSize);
      res.json({ success: true, data: roles, totalRows, totalPages, pageNo, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data role' });
    }
  });

  router.post('/roles', async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ error: 'Nama role wajib diisi' });

      const maxItem = await prisma.roleMaster.findFirst({ orderBy: { id: 'desc' } });
      const nextId = maxItem ? maxItem.id + BigInt(1) : BigInt(1);

      const newRole = await prisma.roleMaster.create({
        data: {
          id: nextId,
          name,
          description,
          createdBy: req.user.email || req.user.name || 'system'
        }
      });
      res.json({ success: true, data: newRole });
    } catch (err) {
      console.error('Error creating role:', err);
      res.status(500).json({ error: 'Gagal membuat role' });
    }
  });

  router.put('/roles/:id', async (req, res) => {
    try {
      const id = BigInt(req.params.id);
      const { name, description, isActive } = req.body;

      const updated = await prisma.roleMaster.update({
        where: { id },
        data: {
          name,
          description,
          isActive,
          changedBy: req.user.email || req.user.name || 'system',
          changedAt: new Date()
        }
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal memperbarui role' });
    }
  });

  router.delete('/roles/:id', async (req, res) => {
    try {
      const id = BigInt(req.params.id);
      await prisma.roleDetail.deleteMany({ where: { roleId: id } });
      await prisma.userRole.deleteMany({ where: { roleId: id } });
      await prisma.roleMaster.delete({ where: { id } });
      res.json({ success: true, message: 'Role berhasil dihapus' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menghapus role' });
    }
  });

  // ─── ROLE PERMISSION MATRIX ──────────────────────────────────────────────
  router.get('/roles/:id/permissions', async (req, res) => {
    try {
      const roleId = BigInt(req.params.id);
      const [applications, functions, features, functionDetails, roleDetails] = await Promise.all([
        prisma.application.findMany(),
        prisma.functionMaster.findMany({ orderBy: { id: 'asc' } }),
        prisma.feature.findMany({ orderBy: { id: 'asc' } }),
        prisma.functionDetail.findMany(),
        prisma.roleDetail.findMany({ where: { roleId } })
      ]);

      const featMap = new Map(features.map(f => [Number(f.id), f]));
      const allowedFeatureIds = new Set(roleDetails.map(rd => Number(rd.featureId)));

      // Build 3-Level OVOID Tree
      const treeList = applications.map(app => {
        const appFuncs = functions.filter(fn => Number(fn.applicationId || 1) === Number(app.id));

        const funcList = appFuncs.map(fn => {
          const fds = functionDetails.filter(fd => Number(fd.functionId) === Number(fn.id));
          const featList = fds.map(fd => {
            const feat = featMap.get(Number(fd.featureId));
            const method = feat ? feat.apiMethod : fd.apiMethod || '*';
            const url = feat ? feat.apiUrl : fd.apiUrl || '';
            let actionName = 'Action';
            if (method === 'GET' && !url.includes('*')) actionName = 'List';
            else if (method === 'POST' && url.includes('search')) actionName = 'Search';
            else if (method === 'POST') actionName = 'Add';
            else if (method === 'GET') actionName = 'Detail';
            else if (method === 'PUT') actionName = 'Edit';
            else if (method === 'DELETE') actionName = 'Delete';
            else actionName = `${method} ${url}`;

            return {
              id: Number(fd.featureId),
              name: actionName,
              method,
              url
            };
          });

          return {
            id: Number(fn.id),
            name: fn.name,
            url: fn.url,
            features: featList
          };
        });

        return {
          id: Number(app.id),
          name: app.name,
          functions: funcList
        };
      });

      res.json({
        success: true,
        data: {
          rawList: treeList,
          selectedFeatureIds: Array.from(allowedFeatureIds)
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil matriks hak akses' });
    }
  });

  router.put('/roles/:id/permissions', async (req, res) => {
    try {
      const roleId = BigInt(req.params.id);
      const { featureIds, functionIds } = req.body;

      // Delete existing role details
      await prisma.roleDetail.deleteMany({ where: { roleId } });

      let selectedFeatIds = [];
      if (Array.isArray(featureIds)) {
        selectedFeatIds = featureIds.map(id => BigInt(id));
      } else if (Array.isArray(functionIds)) {
        const fds = await prisma.functionDetail.findMany({
          where: { functionId: { in: functionIds.map(id => BigInt(id)) } }
        });
        selectedFeatIds = fds.map(fd => fd.featureId);
      }

      for (const featId of selectedFeatIds) {
        const fds = await prisma.functionDetail.findMany({
          where: { featureId: featId }
        });

        if (fds.length > 0) {
          for (const fd of fds) {
            await prisma.roleDetail.create({
              data: {
                roleId,
                applicationId: fd.applicationId,
                functionId: fd.functionId,
                featureId: fd.featureId,
                createdBy: req.user?.email || req.user?.name || 'system'
              }
            });
          }
        } else {
          await prisma.roleDetail.create({
            data: {
              roleId,
              applicationId: BigInt(1),
              functionId: BigInt(1),
              featureId: featId,
              createdBy: req.user?.email || req.user?.name || 'system'
            }
          });
        }
      }

      res.json({ success: true, message: 'Hak akses role berhasil diperbarui' });
    } catch (err) {
      console.error('Error updating role permissions:', err);
      res.status(500).json({ error: 'Gagal memperbarui hak akses role' });
    }
  });

  // ─── MENUS ─────────────────────────────────────────────────────────────
  router.get('/menus', async (req, res) => {
    try {
      const menus = await prisma.menu.findMany({
        orderBy: { seq: 'asc' }
      });
      res.json({ success: true, data: menus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data menu' });
    }
  });

  router.post('/menus', async (req, res) => {
    try {
      const { displayText, parentId, functionId, icon, seq, isActive } = req.body;
      if (!displayText) return res.status(400).json({ error: 'Nama menu wajib diisi' });

      const maxItem = await prisma.menu.findFirst({ orderBy: { id: 'desc' } });
      const nextId = maxItem ? maxItem.id + BigInt(1) : BigInt(1);

      const newMenu = await prisma.menu.create({
        data: {
          id: nextId,
          displayText,
          parentId: parentId ? BigInt(parentId) : null,
          applicationId: BigInt(1),
          functionId: functionId ? BigInt(functionId) : null,
          icon: icon || 'FolderClosed',
          seq: seq ? parseInt(seq, 10) : 0,
          isActive: isActive !== undefined ? isActive : true,
          createdBy: req.user.email || req.user.name || 'system'
        }
      });
      res.json({ success: true, data: newMenu });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal membuat menu' });
    }
  });

  router.put('/menus/reorder', async (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'items harus berupa array' });
      }

      for (const item of items) {
        if (!item.id || item.id < 0) continue;
        await prisma.menu.update({
          where: { id: BigInt(item.id) },
          data: {
            parentId: item.parentId ? BigInt(item.parentId) : null,
            seq: parseInt(item.seq, 10) || 0,
            displayText: item.displayText,
            icon: item.icon,
            functionId: item.functionId ? BigInt(item.functionId) : null,
            isActive: item.isActive !== undefined ? item.isActive : true,
            changedBy: req.user.email || req.user.name || 'system',
            changedAt: new Date()
          }
        });
      }

      res.json({ success: true, message: 'Urutan menu berhasil diperbarui' });
    } catch (err) {
      console.error('Error reordering menus:', err);
      res.status(500).json({ error: 'Gagal memperbarui urutan menu' });
    }
  });

  router.put('/menus/:id', async (req, res) => {
    try {
      const id = BigInt(req.params.id);
      const { displayText, parentId, functionId, icon, seq, isActive } = req.body;

      const updated = await prisma.menu.update({
        where: { id },
        data: {
          displayText,
          parentId: parentId ? BigInt(parentId) : null,
          functionId: functionId ? BigInt(functionId) : null,
          icon,
          seq: seq ? parseInt(seq, 10) : 0,
          isActive,
          changedBy: req.user.email || req.user.name || 'system',
          changedAt: new Date()
        }
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal memperbarui menu' });
    }
  });

  router.delete('/menus/:id', async (req, res) => {
    try {
      const id = BigInt(req.params.id);
      await prisma.menu.delete({ where: { id } });
      res.json({ success: true, message: 'Menu berhasil dihapus' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menghapus menu' });
    }
  });

  // ─── FUNCTIONS & FEATURES ──────────────────────────────────────────────
  router.get('/functions', async (req, res) => {
    try {
      const functions = await prisma.functionMaster.findMany({
        orderBy: { id: 'asc' }
      });
      res.json({ success: true, data: functions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data function' });
    }
  });

  router.post('/functions', async (req, res) => {
    try {
      const { name, url, description } = req.body;
      if (!name || !url) return res.status(400).json({ error: 'Nama dan URL function wajib diisi' });

      const maxItem = await prisma.functionMaster.findFirst({ orderBy: { id: 'desc' } });
      const nextId = maxItem ? maxItem.id + BigInt(1) : BigInt(1);

      const fn = await prisma.functionMaster.create({
        data: {
          id: nextId,
          applicationId: BigInt(1),
          name,
          url,
          description,
          createdBy: req.user.email || req.user.name || 'system'
        }
      });
      res.json({ success: true, data: fn });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal membuat function' });
    }
  });

  router.get('/features', async (req, res) => {
    try {
      const features = await prisma.feature.findMany({
        orderBy: { id: 'asc' }
      });
      res.json({ success: true, data: features });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data feature API' });
    }
  });

  router.post('/features', async (req, res) => {
    try {
      const { apiMethod, apiUrl, functionId } = req.body;
      if (!apiMethod || !apiUrl) return res.status(400).json({ error: 'Method dan URL API wajib diisi' });

      const maxItem = await prisma.feature.findFirst({ orderBy: { id: 'desc' } });
      const nextId = maxItem ? maxItem.id + BigInt(1) : BigInt(1);

      const feature = await prisma.feature.create({
        data: {
          id: nextId,
          apiMethod: apiMethod.toUpperCase(),
          apiUrl,
          createdBy: req.user.email || req.user.name || 'system'
        }
      });

      if (functionId) {
        await prisma.functionDetail.create({
          data: {
            applicationId: BigInt(1),
            functionId: BigInt(functionId),
            featureId: feature.id,
            apiMethod: feature.apiMethod,
            apiUrl: feature.apiUrl,
            createdBy: req.user.email || req.user.name || 'system'
          }
        });
      }

      res.json({ success: true, data: feature });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal membuat feature API' });
    }
  });

  // ─── APPLICATIONS ──────────────────────────────────────────────────────
  router.get('/applications', async (req, res) => {
    try {
      const apps = await prisma.application.findMany();
      res.json({ success: true, data: apps });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data aplikasi' });
    }
  });

  return router;
};

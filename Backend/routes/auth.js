const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

module.exports = (prisma) => {
  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ error: 'Email atau password salah' });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(400).json({ error: 'Email atau password salah' });

      // Fetch user roles & permissions
      const userRoles = await prisma.userRole.findMany({
        where: {
          OR: [{ userName: user.email }, { userName: user.id }]
        }
      });
      let roleIds = userRoles.map(ur => ur.roleId);
      if (roleIds.length === 0) {
        // if (user.role === 'ADMIN' || user.role === 'System Administrator') {
        //   roleIds = [BigInt(1)];
        // } else {
        //   roleIds = [BigInt(4)];
        // }
        roleIds = [BigInt(4)];
      }

      const roleMasters = await prisma.roleMaster.findMany({
        where: { id: { in: roleIds } }
      });
      const rolesList = roleMasters.map(r => r.name);

      const roleDetails = await prisma.roleDetail.findMany({
        where: { roleId: { in: roleIds } }
      });
      const featureIds = roleDetails.map(rd => rd.featureId);
      const features = await prisma.feature.findMany({
        where: { id: { in: featureIds } }
      });
      const functions = await prisma.functionMaster.findMany({
        where: { id: { in: roleDetails.map(rd => rd.functionId) } }
      });
      const functionMap = new Map(functions.map(fn => [Number(fn.id), fn.url]));

      const permissions = roleDetails.map(rd => {
        const feat = features.find(f => Number(f.id) === Number(rd.featureId));
        return {
          functionId: Number(rd.functionId),
          menuUrl: functionMap.get(Number(rd.functionId)) || '',
          apiMethod: feat ? feat.apiMethod : '*',
          apiUrl: feat ? feat.apiUrl : ''
        };
      });

      const primaryRole = (rolesList && rolesList.length > 0) ? rolesList[0] : (user.role || 'MEMBER');

      const token = jwt.sign(
        { id: user.id, email: user.email, role: primaryRole, name: user.name, jobRoleCode: user.jobRoleCode, roles: rolesList },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: primaryRole,
          name: user.name,
          jobRoleCode: user.jobRoleCode,
          profilePhoto: user.profilePhoto,
          roles: rolesList,
          permissions
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get Current User (Check Auth)
  router.get('/me', authenticateToken, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, role: true, name: true, jobRoleCode: true, profilePhoto: true }
      });
      if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

      const userRoles = await prisma.userRole.findMany({
        where: {
          OR: [{ userName: user.email }, { userName: user.id }]
        }
      });
      let roleIds = userRoles.map(ur => ur.roleId);
      if (roleIds.length === 0) {
        // if (user.role === 'ADMIN' || user.role === 'System Administrator') {
        //   roleIds = [BigInt(1)];
        // } else {
        //   roleIds = [BigInt(4)];
        // }
        roleIds = [BigInt(4)];
      }

      const roleMasters = await prisma.roleMaster.findMany({
        where: { id: { in: roleIds } }
      });
      const rolesList = roleMasters.map(r => r.name);

      const roleDetails = await prisma.roleDetail.findMany({
        where: { roleId: { in: roleIds } }
      });
      const featureIds = roleDetails.map(rd => rd.featureId);
      const features = await prisma.feature.findMany({
        where: { id: { in: featureIds } }
      });
      const functions = await prisma.functionMaster.findMany({
        where: { id: { in: roleDetails.map(rd => rd.functionId) } }
      });
      const functionMap = new Map(functions.map(fn => [Number(fn.id), fn.url]));

      const permissions = roleDetails.map(rd => {
        const feat = features.find(f => Number(f.id) === Number(rd.featureId));
        return {
          functionId: Number(rd.functionId),
          menuUrl: functionMap.get(Number(rd.functionId)) || '',
          apiMethod: feat ? feat.apiMethod : '*',
          apiUrl: feat ? feat.apiUrl : ''
        };
      });

      const primaryRole = (rolesList && rolesList.length > 0) ? rolesList[0] : (user.role || 'MEMBER');

      res.json({ user: { ...user, role: primaryRole, roles: rolesList, permissions } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Dynamic Menus Endpoint
  router.get('/menus', authenticateToken, async (req, res) => {
    try {
      const userName = req.user.email || req.user.id;

      // Find user roles from tb_m_user_role
      const userRoles = await prisma.userRole.findMany({
        where: {
          OR: [{ userName: userName }, { userName: req.user.id }]
        }
      });

      let roleIds = userRoles.map(ur => ur.roleId);
      if (roleIds.length === 0) {
        // if (req.user.role === 'ADMIN' || req.user.role === 'System Administrator') {
        //   roleIds = [BigInt(1)];
        // } else {
        //   roleIds = [BigInt(4)];
        // }
        roleIds = [BigInt(4)];
      }

      // Get allowed function IDs strictly from tb_m_role_detail for user's assigned role(s)
      const roleDetails = await prisma.roleDetail.findMany({
        where: { roleId: { in: roleIds } },
        select: { functionId: true }
      });
      const allowedFunctionIds = new Set(roleDetails.map(rd => Number(rd.functionId)));

      // Query active menus
      const allMenus = await prisma.menu.findMany({
        where: { isActive: true },
        orderBy: { seq: 'asc' }
      });

      // Get functions lookup
      const functions = await prisma.functionMaster.findMany();
      const funcMap = new Map(functions.map(f => [Number(f.id), f.url]));

      // Filter menus allowed for user's assigned role permissions
      const filteredMenus = allMenus.filter(menu => {
        if (!menu.functionId) return true; // Parent menu header (will be cleaned if no children allowed)
        return allowedFunctionIds.has(Number(menu.functionId));
      });

      // Build hierarchy
      const parentMenus = filteredMenus.filter(m => !m.parentId);
      const childMenus = filteredMenus.filter(m => m.parentId);

      const result = parentMenus.map(parent => {
        if (parent.functionId && !allowedFunctionIds.has(Number(parent.functionId))) {
          return null;
        }

        const children = childMenus
          .filter(c => Number(c.parentId) === Number(parent.id) && allowedFunctionIds.has(Number(c.functionId)))
          .map(child => ({
            id: Number(child.id),
            label: child.displayText,
            icon: child.icon,
            to: child.functionId ? funcMap.get(Number(child.functionId)) || '' : '',
            seq: child.seq
          }));

        const toPath = parent.functionId ? funcMap.get(Number(parent.functionId)) || '' : null;

        return {
          id: Number(parent.id),
          label: parent.displayText,
          icon: parent.icon,
          to: toPath,
          subItems: children.length > 0 ? children : undefined,
          seq: parent.seq
        };
      }).filter(Boolean);

      // Filter out empty parent categories if all children were filtered out
      const cleanResult = result.filter(menu => {
        if (!menu.to && (!menu.subItems || menu.subItems.length === 0)) {
          return false;
        }
        return true;
      });

      res.json({ success: true, data: cleanResult });
    } catch (error) {
      console.error('Error fetching dynamic menus:', error);
      res.status(500).json({ error: 'Failed to fetch dynamic menus' });
    }
  });

  // Logout
  router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout berhasil' });
  });

  return router;
};


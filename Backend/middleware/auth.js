const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }
  if (!token) return res.status(401).json({ error: 'Token diperlukan' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Token tidak valid' });
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  // Delegate authorization to dynamic RBAC middleware (authorizeApiAccess)
  next();
};

const authorizeApiAccess = (prisma) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }

      const path = req.originalUrl ? req.originalUrl.split('?')[0] : req.path;
      const method = req.method.toUpperCase();

      // Common APIs that bypass role permission check as long as user is authenticated
      const bypassPrefixes = [
        '/api/auth',
        '/api/health',
        '/metrics',
        '/api/notifications',
      ];

      const isBypassed = bypassPrefixes.some(prefix => path.startsWith(prefix));
      if (isBypassed) {
        return next();
      }

      const userName = req.user.email || req.user.id;

      // Find user roles from tb_m_user_role
      const userRoles = await prisma.userRole.findMany({
        where: {
          OR: [
            { userName: userName },
            { userName: req.user.id }
          ]
        },
        select: { roleId: true }
      });

      if (!userRoles || userRoles.length === 0) {
        return res.status(401).json({ error: 'Unauthorized: Access to this API endpoint is restricted' });
      }

      const roleIds = userRoles.map(ur => ur.roleId);

      // Query allowed role details for these role IDs
      const roleDetails = await prisma.roleDetail.findMany({
        where: { roleId: { in: roleIds } }
      });

      if (!roleDetails || roleDetails.length === 0) {
        return res.status(401).json({ error: 'Unauthorized: Access to this API endpoint is restricted' });
      }

      const allowedFeatureIds = roleDetails.map(rd => rd.featureId);

      // Query allowed features
      const features = await prisma.feature.findMany({
        where: { id: { in: allowedFeatureIds } }
      });

      // Match request method and path against allowed features
      const hasPermission = features.some(feat => {
        const methodMatch = feat.apiMethod === '*' || feat.apiMethod.toUpperCase() === method;
        
        let urlPattern = feat.apiUrl.trim();
        if (urlPattern.endsWith('/*')) {
          urlPattern = urlPattern.slice(0, -2);
        }
        const pathMatch = path === urlPattern || path.startsWith(`${urlPattern}/`);
        return methodMatch && pathMatch;
      });


      if (!hasPermission) {
        return res.status(401).json({ error: 'Unauthorized: Access to this API endpoint is restricted' });
      }

      next();
    } catch (err) {
      console.error('Authorization middleware error:', err);
      return res.status(500).json({ error: 'Internal server error during authorization check' });
    }
  };
};

module.exports = { authenticateToken, authenticateAdmin, authorizeApiAccess };


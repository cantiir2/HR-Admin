const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const dotenv = require('dotenv');
const promClient = require('prom-client');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  console.log('\n--- Prisma Query Log ---');
  console.log('Query    : ' + e.query);
  console.log('Params   : ' + e.params);
  console.log('Duration : ' + e.duration + ' ms');
  console.log('------------------------\n');
});

// Handle Prisma BigInt serialization in JSON responses
BigInt.prototype.toJSON = function () {
  return Number(this);
};

const cookieParser = require('cookie-parser');
const { metricsMiddleware, metricsHandler } = require('./middleware/metrics');
const { authenticateToken, authorizeApiAccess } = require('./middleware/auth');

// Middleware
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));

app.use(metricsMiddleware);
app.get('/metrics', metricsHandler);

// Prometheus metrics setup
const register = promClient.register;
promClient.collectDefaultMetrics({ register });

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 1.5, 2, 5]
});

// Metrics middleware (must be registered before application routes)
app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    const route = (req.route && req.route.path) ? req.route.path : req.originalUrl || req.url;
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestsTotal.inc(labels);
    end(labels);
  });
  next();
});

// Auth Public & Common Routes
app.use('/api/auth', require('./routes/auth')(prisma));

// Protected API Routes (authenticated + dynamic role authorization)
app.use('/api', authenticateToken, authorizeApiAccess(prisma));

app.use('/api/users', require('./routes/users')(prisma));
app.use('/api/authorization', require('./routes/authorization')(prisma));
app.use('/api/system', require('./routes/system')(prisma));
app.use('/api/projects', require('./routes/projects')(prisma));
app.use('/api/project-resources', require('./routes/project-resources')(prisma));
app.use('/api/attendance', require('./routes/attendance')(prisma));
app.use('/api/attendance-requests', require('./routes/attendance-requests')(prisma));
app.use('/api/tasks', require('./routes/tasks')(prisma));
app.use('/api/notifications', require('./routes/notifications')(prisma));
app.use('/api/working-reports', require('./routes/working-reports')(prisma));
app.use('/api/leaves', require('./routes/leaves')(prisma));
app.use('/api/geofences', require('./routes/geofences')(prisma));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/{*path}', (req, res, next) => {
    // Jangan override API routes dan metrics
    if (req.path.startsWith('/api') || req.path === '/metrics') {
      return next();
    }
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Start cron jobs
  const { startContractNotificationJob } = require('./jobs/contractNotificationJob');
  startContractNotificationJob();
});

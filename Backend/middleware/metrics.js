const client = require('prom-client');

client.collectDefaultMetrics({ prefix: 'hr_admin_' });

const httpRequestsTotal = new client.Counter({
  name: 'hr_admin_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'hr_admin_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const metricsMiddleware = (req, res, next) => {
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    
    let route = req.path;
    if (req.route && req.route.path) {
      route = (req.baseUrl || '') + req.route.path;
    }

    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode,
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationInSeconds);
  });

  next();
};

const metricsHandler = async (req, res) => {
  const token = process.env.METRICS_TOKEN;
  
  if (token) {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.*)$/);
    if (!match || match[1] !== token) {
      return res.status(401).send('Unauthorized');
    }
  }

  try {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  metricsMiddleware,
  metricsHandler,
};

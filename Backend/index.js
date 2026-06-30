const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
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

const cookieParser = require('cookie-parser');

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));

// Routes
app.use('/api/auth', require('./routes/auth')(prisma));
app.use('/api/users', require('./routes/users')(prisma));
app.use('/api/system', require('./routes/system')(prisma));
app.use('/api/projects', require('./routes/projects')(prisma));
app.use('/api/attendance', require('./routes/attendance')(prisma));
app.use('/api/tasks', require('./routes/tasks')(prisma));
app.use('/api/notifications', require('./routes/notifications')(prisma));
app.use('/api/working-reports', require('./routes/working-reports')(prisma));
app.use('/api/leaves', require('./routes/leaves')(prisma));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

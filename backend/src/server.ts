import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load Environment variables
dotenv.config();

import apiRoutes from './routes/api';
import { checkDbConnection } from './db';
import { initializeRepositories } from './repositories';
import { initCronJobs } from './helpers/cronJobs';

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder (for receipt image/pdf access)
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url} - Request received`);
  next();
});

// Mounting Router
app.use('/api', apiRoutes);

// General Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Online',
    system: 'Tax Filing Automation Tool (TFAT) Backend Service API',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: err.message || 'An unexpected error occurred' });
});

// Bootstrapping Backend
async function startServer() {
  // 1. Verify PostgreSQL Database Connection
  await checkDbConnection();

  // 2. Initialize Repositories (Injecting Prisma or In-Memory)
  initializeRepositories();

  // 3. Start Background Schedulers
  initCronJobs();

  // 4. Start Listening
  const server = app.listen(PORT, () => {
    console.log(`[Server] TFAT Backend running on http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server Error] Port ${PORT} is currently in use by another process.`);
      console.error(`[Server Error] Freeing port ${PORT} or restart backend command.`);
    } else {
      console.error('[Server Error]', err);
    }
  });
}

startServer();

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { initSocket } from './lib/socket';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Setup Socket.io
initSocket(server, CLIENT_URL);

// Middleware - permissive CORS for frontend dev servers
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Serve UX4G Frontend statically if available
const frontendPath = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

server.listen(PORT, () => {
  console.log(`🚀 SahakarConnect API Server running on port ${PORT}`);
  console.log(`📡 Serving API at http://localhost:${PORT}/api`);
  console.log(`🏛️ Serving UX4G Web UI at http://localhost:${PORT}/`);
});

export { app, server };

import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';
import bookingRoutes from './routes/booking.routes';
import providerRoutes from './routes/provider.routes';
import adminRoutes from './routes/admin.routes';
import categoryRoutes from './routes/category.routes';
import { initSocketServer } from './services/socket.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

const httpServer = http.createServer(app);

// Initialize Socket.io real-time engine
initSocketServer(httpServer);

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`[SahakarConnect Server] HTTP & WebSockets listening on port ${PORT}`);
  });
}

export { app, httpServer };
export default app;

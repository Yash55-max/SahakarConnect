import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, AuthenticatedUser } from '../middleware/auth';
import { UserRole } from '@prisma/client';

let io: Server | null = null;

export interface SocketUser extends AuthenticatedUser {
  socketId: string;
}

/**
 * Initializes the Socket.io server instance with CORS and JWT authentication middleware
 */
export function initSocketServer(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io handshakes
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        (socket.handshake.query?.token as string);

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      socket.data.user = decoded;
      return next();
    } catch (err: any) {
      return next(new Error(`Authentication error: ${err.message}`));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as AuthenticatedUser;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    // 1. Join user-specific direct room for targeted alerts and OTP updates
    const userRoom = `user:${user.userId}`;
    socket.join(userRoom);

    // 2. Join cooperative society room if associated
    if (user.cooperativeId) {
      const coopRoom = `coop:${user.cooperativeId}`;
      socket.join(coopRoom);

      // 3. Join provider dispatch room if user is a provider
      if (user.role === UserRole.PROVIDER) {
        const providerRoom = `providers:${user.cooperativeId}`;
        socket.join(providerRoom);
      }
    }

    console.log(`[Socket] Connected: ${user.name} (${user.role}) joined rooms: ${Array.from(socket.rooms).join(', ')}`);

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${user.name} (${socket.id})`);
    });
  });

  return io;
}

/**
 * Returns active Socket.io instance
 */
export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocketServer first.');
  }
  return io;
}

/**
 * Emits an event to a specific user's room
 */
export function emitToUser(userId: string, event: string, data: any): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emits an event to all users connected under a specific cooperative society
 */
export function emitToCoop(cooperativeId: string, event: string, data: any): void {
  if (!io) return;
  io.to(`coop:${cooperativeId}`).emit(event, data);
}

/**
 * Emits an event to all available providers in a cooperative society
 */
export function emitToProviders(cooperativeId: string, event: string, data: any): void {
  if (!io) return;
  io.to(`providers:${cooperativeId}`).emit(event, data);
}

/**
 * Broadcasts booking status updates across consumer, provider, and coop admin rooms
 */
export function broadcastBookingStatus(booking: any): void {
  if (!io) return;

  const payload = {
    bookingId: booking.id,
    status: booking.status,
    grossAmount: booking.grossAmount,
    completionOtp: booking.completionOtp,
    consumerId: booking.consumerId,
    providerId: booking.providerId,
    cooperativeId: booking.cooperativeId,
    provider: booking.provider,
    updatedAt: new Date().toISOString(),
  };

  // Direct alert to consumer
  if (booking.consumerId) {
    io.to(`user:${booking.consumerId}`).emit('booking:statusChanged', payload);
  }

  // Direct alert to assigned provider's user account
  if (booking.provider?.userId) {
    io.to(`user:${booking.provider.userId}`).emit('booking:statusChanged', payload);
  }

  // Broadcast to coop admins for ledger updates
  if (booking.cooperativeId) {
    io.to(`coop:${booking.cooperativeId}`).emit('booking:statusChanged', payload);
  }
}

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HTTPServer, clientOrigin: string) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: clientOrigin || '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    // Join a room for a specific user
    socket.on('join:user', (userId: string) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join a room for a specific provider profile
    socket.on('join:provider', (providerId: string) => {
      if (providerId) {
        socket.join(`provider_${providerId}`);
      }
    });

    // Join a room for a specific cooperative society
    socket.on('join:coop', (coopId: string) => {
      if (coopId) {
        socket.join(`coop_${coopId}`);
      }
    });

    // Join a room for a specific booking live tracker
    socket.on('join:booking', (bookingId: string) => {
      if (bookingId) {
        socket.join(`booking_${bookingId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

// Emit real-time events helper functions
export const notifyBookingStatusChange = (bookingId: string, booking: any) => {
  if (!io) return;
  io.to(`booking_${bookingId}`).emit('booking:statusChanged', booking);
  if (booking.consumerId) {
    io.to(`user_${booking.consumerId}`).emit('booking:statusChanged', booking);
  }
  if (booking.providerId) {
    io.to(`provider_${booking.providerId}`).emit('booking:statusChanged', booking);
  }
  // Global event broadcast for responsive UI updates
  io.emit('booking:globalStatusUpdate', { bookingId, status: booking.status });
};

export const notifyNewBookingRequest = (providerId: string, booking: any) => {
  if (!io) return;
  io.to(`provider_${providerId}`).emit('booking:newRequest', booking);
  io.emit('booking:globalNewRequest', booking);
};

export const notifyPollUpdated = (coopId: string, poll: any) => {
  if (!io) return;
  io.to(`coop_${coopId}`).emit('poll:voteUpdate', poll);
  io.emit('poll:globalVoteUpdate', poll);
};

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface NotificationToast {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  title: string;
  message: string;
  timestamp: Date;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: NotificationToast[];
  dismissNotification: (id: string) => void;
  lastEvent: { eventName: string; payload: any } | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);
  const [lastEvent, setLastEvent] = useState<{ eventName: string; payload: any } | null>(null);

  const addNotification = (type: NotificationToast['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: NotificationToast = { id, type, title, message, timestamp: new Date() };
    setNotifications((prev) => [newToast, ...prev.slice(0, 4)]);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      dismissNotification(id);
    }, 6000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    s.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ Socket connected to SahakarConnect:', s.id);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time booking status listener
    s.on('booking:statusChanged', (booking) => {
      setLastEvent({ eventName: 'booking:statusChanged', payload: booking });
      addNotification(
        'INFO',
        'Live Job Status Updated',
        `Booking #${booking.id?.slice(0, 8)} status changed to ${booking.status}`
      );
    });

    // Real-time new booking request alert (for providers)
    s.on('booking:newRequest', (booking) => {
      setLastEvent({ eventName: 'booking:newRequest', payload: booking });
      addNotification(
        'ALERT',
        '⚡ New Job Request Received!',
        `New booking for ${booking.listing?.title || 'Service'} (₹${booking.totalAmount})`
      );
    });

    // Real-time poll update (democratic vote tally)
    s.on('poll:voteUpdate', (poll) => {
      setLastEvent({ eventName: 'poll:voteUpdate', payload: poll });
      addNotification(
        'SUCCESS',
        'Democratic Vote Recorded',
        'A cooperative member has cast a vote on the open referendum!'
      );
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Join user/provider/coop rooms whenever user context changes
  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    socket.emit('join:user', user.id);

    if (user.providerProfile?.id) {
      socket.emit('join:provider', user.providerProfile.id);
      if (user.providerProfile.cooperativeId) {
        socket.emit('join:coop', user.providerProfile.cooperativeId);
      }
    }
  }, [socket, isConnected, user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        dismissNotification,
        lastEvent,
      }}
    >
      {children}
      {/* Real-time Notification Toast Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border backdrop-blur-md transform transition-all duration-300 animate-slide-in flex items-start justify-between gap-3 ${
              n.type === 'ALERT'
                ? 'bg-amber-900/90 text-amber-100 border-amber-500'
                : n.type === 'SUCCESS'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500'
                : 'bg-slate-900/90 text-slate-100 border-slate-700'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-coop-400 animate-ping" />
                <h4 className="font-semibold text-sm">{n.title}</h4>
              </div>
              <p className="text-xs mt-1 text-slate-200">{n.message}</p>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="text-slate-400 hover:text-white text-sm"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

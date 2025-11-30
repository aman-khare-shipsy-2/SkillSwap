import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';
import { useAuthStore } from '../store/authStore';

let socket: Socket | null = null;

export const initializeSocket = (): Socket | null => {
  const token = useAuthStore.getState().token;

  if (!token) {
    console.warn('No token available for socket connection');
    return null;
  }

  // If socket exists and is connected, return it
  if (socket?.connected) {
    console.log('Reusing existing socket connection:', socket.id);
    return socket;
  }

  // If socket exists but not connected, disconnect and create new one
  if (socket) {
    console.log('Disconnecting existing socket');
    socket.disconnect();
    socket = null;
  }

  console.log('Initializing new socket connection to:', SOCKET_URL);
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('🔄 Socket reconnection attempt', attemptNumber);
  });

  socket.on('reconnect_error', (error) => {
    console.error('❌ Socket reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ Socket reconnection failed after all attempts');
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  if (!socket || !socket.connected) {
    return initializeSocket();
  }
  return socket;
};

export default socket;


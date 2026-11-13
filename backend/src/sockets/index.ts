import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/token.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

let ioInstance: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded: any = verifyAccessToken(token);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid or expired socket authentication token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (user?.sub) {
      socket.join(`user:${user.sub}`);
      logger.info(`Socket connected: User ${user.sub} (${user.email})`);
    }

    if (user?.organizationId) {
      socket.join(`org:${user.organizationId}`);
    }

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: User ${user?.sub}`);
    });
  });

  ioInstance = io;
  return io;
}

export function getSocketServer(): Server | null {
  return ioInstance;
}


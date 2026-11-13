import { prisma } from '../config/prisma.js';
import { getSocketServer } from '../sockets/index.js';
import { logger } from '../utils/logger.js';

export interface CreateNotificationDTO {
  userId: string;
  title: string;
  message: string;
  type?: string;
  relatedEntityId?: string;
}

export class NotificationService {
  async createNotification(data: CreateNotificationDTO) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type || 'INFO',
          relatedEntityId: data.relatedEntityId,
        },
      });

      // Emit real-time notification over Socket.IO if user is connected
      const io = getSocketServer();
      if (io) {
        io.to(`user:${data.userId}`).emit('notification', notification);
      }

      return notification;
    } catch (err: any) {
      logger.error('Failed to create notification:', err.message || err);
      return null;
    }
  }

  async getUserNotifications(userId: string, limit = 50) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    return await prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }
}

export const notificationService = new NotificationService();


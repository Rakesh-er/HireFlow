import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user!.id);
      return sendSuccess(res, notifications, 'Notifications retrieved');
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.user!.id, req.params.id);
      return sendSuccess(res, null, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.deleteNotification(req.user!.id, req.params.id);
      return sendSuccess(res, null, 'Notification deleted');
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();


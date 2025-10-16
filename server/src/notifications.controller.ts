import { Request, Response, NextFunction } from "express";
import * as NotificationService from './notifications.service';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as any).user.id;
        const notifications = await NotificationService.findUnreadByUserId(userId);
        res.json(notifications);
    } catch (e) {
        next(e);
    }
}

export async function markNotificationAsRead(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as any).user.id;
        const notificationId = Number(req.params.id);
        await NotificationService.markAsRead(notificationId, userId);
        res.status(204).send();
    } catch (e) {
        next(e);
    }
}
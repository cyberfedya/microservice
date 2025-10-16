import { Express, Router } from "express";
import * as controller from './notifications.controller';

export function registerNotificationRoutes(app: Express) {
    const router = Router();

    router.get('/', controller.getNotifications);
    router.post('/:id/read', controller.markNotificationAsRead);

    app.use('/api/notifications', router);
}
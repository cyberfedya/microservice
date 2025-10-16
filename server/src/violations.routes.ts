import { Express, Router } from "express";
import * as controller from './violations.controller';

export function registerViolationRoutes(app: Express) {
    const router = Router();

    router.get('/', controller.getViolations);
    router.post('/', controller.createViolation);

    app.use('/api/violations', router);
}
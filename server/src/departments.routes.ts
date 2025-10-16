import { Express, Router } from "express";
import * as controller from './departments.controller';

export function registerDepartmentRoutes(app: Express) {
    const router = Router();

    router.get('/', controller.getDepartments);

    app.use('/api/departments', router);
}
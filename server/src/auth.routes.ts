// C:\...\server\src\auth.routes.ts

import { Express, Router } from "express";
import * as controller from './auth.controller';

export function registerAuthRoutes(app: Express) {
    const router = Router();

    // Этот роут не будет защищен middleware'ом
    router.post('/login', controller.login);

    app.use('/auth', router);
}
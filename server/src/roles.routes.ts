import { Express, Router } from "express";
import * as controller from './roles.controller';

export function registerRoleRoutes(app: Express) {
    const router = Router();

    router.get('/', controller.getRoles);
    router.post('/', controller.createRole);
    router.put('/:id', controller.updateRole);
    router.delete('/:id', controller.deleteRole);

    app.use('/api/roles', router);
}
import { Express, Router } from "express";
import * as controller from './users.controller';

export function registerUserRoutes(app: Express) {
    const router = Router();

    router.get('/', controller.getUsers);
    router.post('/', controller.createUser);
    router.put('/:id', controller.updateUser);
    router.delete('/:id', controller.deleteUser);

    app.use('/api/users', router);
}
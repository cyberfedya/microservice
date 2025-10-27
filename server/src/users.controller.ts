import { Request, Response, NextFunction } from "express";
import * as UserService from './users.service';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await UserService.findUsers();
        res.json(users);
    } catch (e) {
        next(e);
    }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password, role, department, departmentId } = req.body;
        // Проверяем наличие обязательных полей. Департамент может быть передан либо как ID, либо как имя
        if (!name || !email || !password || !role || (!department && !departmentId)) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const newUser = await UserService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (e: any) {
        next(e);
    }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = Number(req.params.id);
        const updatedUser = await UserService.updateUser(userId, req.body);
        res.json(updatedUser);
    } catch (e: any) {
        next(e);
    }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = Number(req.params.id);
        await UserService.deleteUser(userId);
        res.status(204).send();
    } catch (e) {
        next(e);
    }
}
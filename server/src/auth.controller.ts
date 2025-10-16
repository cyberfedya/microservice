// C:\...\server\src\auth.controller.ts

import { Request, Response, NextFunction } from "express";
import * as AuthService from './auth.service';

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email va parol talab qilinadi" });
        }
        const result = await AuthService.loginUser(email, password);
        res.json(result);
    } catch (e: any) {
        // Отправляем ошибку с более понятным статусом
        res.status(401).json({ error: e.message });
    }
}
// server/src/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    console.log(`\n--- New Request: ${req.method} ${req.path} ---`); // ЛОГ: Начало запроса
    // 1. Извлечение токена
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Проверка наличия токена
    if (token == null) {
        console.log("Middleware Error: No token provided."); // ЛОГ
        return res.sendStatus(401); // No token -> Unauthorized
    }
    console.log("Middleware: Token found."); // ЛОГ

    // 3. Верификация токена
    jwt.verify(token, JWT_SECRET, async (err: any, payload: any) => {
        // 4. Проверка на ошибку верификации
        if (err) {
            console.error("Middleware Error: JWT Verification failed.", err.message); // ЛОГ ОШИБКИ JWT
            return res.sendStatus(403); // Invalid/Expired token -> Forbidden
        }
        console.log("Middleware: JWT Verification successful. Payload:", payload); // ЛОГ PAYLOAD

        // --- Добавлена проверка payload ---
        if (!payload || !payload.userId) {
            console.error("Middleware Error: Missing userId in JWT payload.", payload); // ЛОГ ОШИБКИ PAYLOAD
            return res.sendStatus(403); // Malformed token -> Forbidden
        }
        // --- Конец добавленной проверки ---

        try {
            // 5. Поиск пользователя в базе данных по ID из payload
            const userIdFromPayload = Number(payload.userId); // Убедимся, что это число
             if (isNaN(userIdFromPayload)) {
                 console.error("Middleware Error: userId in payload is not a valid number.", payload.userId);
                 return res.sendStatus(403); // Invalid userId format
             }
            console.log(`Middleware: Attempting to find user with ID: ${userIdFromPayload}`); // ЛОГ ПОИСКА
            const user = await prisma.user.findUnique({
                where: { id: userIdFromPayload },
                include: { role: true, department: true },
            });

            // 6. Проверка, найден ли пользователь
            if (!user) {
                console.error(`Middleware Error: User not found in DB for ID: ${userIdFromPayload}`); // ЛОГ: Пользователь не найден
                return res.sendStatus(403); // Valid token, but user doesn't exist -> Forbidden
            }
            console.log(`Middleware: User found in DB: ${user.email}`); // ЛОГ: Пользователь найден

            // 7. Прикрепляем пользователя к запросу
            const userToLog = { ...user, password: '***' };
            console.log('Middleware: Attaching user to request:', JSON.stringify(userToLog, null, 2));
            (req as any).user = user;

            // 8. Продолжаем выполнение запроса
            console.log(`--- Request Allowed: ${req.method} ${req.path} ---`); // ЛОГ: Успех
            next();
        } catch (dbError) {
            console.error("Middleware Error: Database error during user lookup:", dbError); // ЛОГ ОШИБКИ БД
            return res.status(500).json({ error: "Database error during authentication." }); // DB Error -> Internal Server Error
        }
    });
};
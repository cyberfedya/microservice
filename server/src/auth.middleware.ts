import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Извлечение токена из заголовка Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Проверка наличия токена
    if (token == null) {
        // 401 Unauthorized - отсутствует токен
        return res.sendStatus(401);
    }

    // 3. Верификация токена
    jwt.verify(token, JWT_SECRET, async (err: any, payload: any) => {
        // 4. Проверка на ошибку верификации (истек, недействителен и т.д.)
        if (err) {
            // 403 Forbidden - недействительный токен
            return res.sendStatus(403);
        }

        try {
            // 5. Поиск пользователя в базе данных по ID из payload
            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
                // Обязательно включаем role и department, так как они используются в контроллерах
                include: { role: true, department: true }, 
            });

            // 6. Проверка, найден ли пользователь
            if (!user) {
                // 403 Forbidden - токен действителен, но пользователь не существует
                return res.sendStatus(403);
            }

            // ЛОГ: Проверяем, что attach'ится к req.user
            // Удаляем конфиденциальные поля (например, пароль) перед логированием
            const userToLog = { ...user, password: '***' }; 
            console.log('Attaching user to request:', JSON.stringify(userToLog, null, 2));

            // 7. Прикрепляем полный объект пользователя к объекту запроса
            (req as any).user = user; 
            
            // 8. Продолжаем выполнение запроса
            next();
        } catch (dbError) {
            // Лог ошибки базы данных
            console.error("Database error during authentication:", dbError); 
            // 500 Internal Server Error - ошибка при работе с БД
            return res.status(500).json({ error: "Database error during authentication." });
        }
    });
};
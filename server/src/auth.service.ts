// C:\...\server\src\auth.service.ts

import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true, department: true }
    });

    if (!user) {
        throw new Error("Foydalanuvchi topilmadi");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Email yoki parol noto'g'ri");
    }

    const token = jwt.sign({ userId: user.id, role: user.role.name }, JWT_SECRET, {
        expiresIn: '24h'
    });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
}
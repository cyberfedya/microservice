// C:\...\server\src\auth.service.ts

import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export async function loginUser(email: string, password: string) {
    console.log(`🔐 Login attempt for email: ${email}`);
    
    const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true, department: true }
    });

    if (!user) {
        console.log(`❌ User not found: ${email}`);
        throw new Error("Foydalanuvchi topilmadi");
    }
    
    console.log(`✅ User found: ${user.name} (${user.email})`);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        console.log(`❌ Invalid password for user: ${email}`);
        throw new Error("Email yoki parol noto'g'ri");
    }
    
    console.log(`✅ Password valid, generating token...`);

    const token = jwt.sign({ userId: user.id, role: user.role.name }, JWT_SECRET, {
        expiresIn: '24h'
    });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
}
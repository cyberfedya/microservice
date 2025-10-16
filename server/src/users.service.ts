import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function findUsers() {
    const users = await prisma.user.findMany({
        include: { role: true, department: true },
        orderBy: { id: 'asc' }
    });

    // Format users to avoid sending password hashes to the client
    return users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.name,
        department: u.department.name,
        managerId: u.managerId
    }));
}

export async function createUser(data: any) {
    const { name, email, password, role, department } = data;

    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    const departmentRecord = await prisma.department.findUnique({ where: { name: department } });

    if (!roleRecord || !departmentRecord) {
        throw new Error("Invalid role or department");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            roleId: roleRecord.id,
            departmentId: departmentRecord.id
        },
    });
}

export async function updateUser(id: number, data: any) {
    const { name, email, role, department } = data;
    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    const departmentRecord = await prisma.department.findUnique({ where: { name: department } });

    if (!roleRecord || !departmentRecord) {
        throw new Error("Invalid role or department");
    }

    return prisma.user.update({
        where: { id },
        data: { name, email, roleId: roleRecord.id, departmentId: departmentRecord.id },
    });
}

export async function deleteUser(id: number) {
    return prisma.user.delete({ where: { id } });
}
import { prisma } from "./prisma";


export async function findRoles() {
    return prisma.role.findMany({
        orderBy: { id: 'asc' }
    });
}

export async function createRole(data: { name: string, description: string }) {
    return prisma.role.create({
        data,
    });
}

export async function updateRole(id: number, data: { description: string }) {
    return prisma.role.update({
        where: { id },
        data,
    });
}

export async function deleteRole(id: number) {
    const usersWithRole = await prisma.user.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
        // This specific error message can be caught by the controller
        throw new Error("Cannot delete role. It is currently assigned to one or more users.");
    }
    return prisma.role.delete({ where: { id } });
}
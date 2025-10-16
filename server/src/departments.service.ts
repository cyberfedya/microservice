import { prisma } from "./prisma";

export async function findDepartments() {
    return prisma.department.findMany({
        orderBy: { id: 'asc' }
    });
}
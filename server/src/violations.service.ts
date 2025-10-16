import { prisma } from "./prisma";


export async function findViolations() {
    return prisma.violation.findMany({
        orderBy: { date: 'desc' },
        include: {
            user: { select: { id: true, name: true } },
            correspondence: { select: { id: true, title: true } }
        }
    });
}

export async function createViolation(data: any) {
    const { userId, reason, type, date, correspondenceId } = data;

    const dataToCreate: any = {
        reason,
        type,
        date: new Date(date),
        userId: Number(userId),
    };

    if (correspondenceId) {
        dataToCreate.correspondenceId = Number(correspondenceId);
    }

    return prisma.violation.create({ data: dataToCreate });
}
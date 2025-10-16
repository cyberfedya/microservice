import { prisma } from "./prisma";


export async function findUnreadByUserId(userId: number) {
    return prisma.notification.findMany({
        where: {
            userId,
            isRead: false,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

export async function markAsRead(notificationId: number, userId: number) {
    // The userId ensures a user can only mark their own notifications as read
    return prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
    });
}
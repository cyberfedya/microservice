// C:\Users\aliak\Desktop\Док-оборот\docmanageapp_xs-main\server\src\documents.service.ts

import { Prisma, User } from "@prisma/client";
import { prisma } from "./prisma";


export const documentInclude = {
    author: { select: { id: true, name: true } },
    mainExecutor: { select: { id: true, name: true, department: { select: { name: true } } } },
    internalAssignee: { select: { id: true, name: true } },
    coExecutors: {
        select: { user: { select: { id: true, name: true } } }
    },
    contributors: {
        select: { user: { select: { id: true, name: true } } }
    },
    reviewers: {
        orderBy: { updatedAt: 'desc' },
        select: {
            status: true,
            comment: true,
            updatedAt: true,
            user: { select: { id: true, name: true } }
        }
    },
    // <<< ИСПРАВЛЕНО ЗДЕСЬ: auditLog -> auditLogs >>>
    auditLogs: {
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true } } }
    },
} satisfies Prisma.DocumentInclude;


export async function findDocumentsForUser(user: User & { role: { name: string }, department: { name: string } | null }) {
    let whereClause: Prisma.DocumentWhereInput = {};
    const reviewCondition: Prisma.DocumentWhereInput = { reviewers: { some: { userId: user.id, status: 'PENDING' } } };

    switch (user.role.name) {
        case 'Admin':
        case 'Bank apparati':
            whereClause = {}; // See everything
            break;
        case 'Boshqaruv':
            whereClause = { OR: [{ stage: { in: ['ASSIGNMENT', 'SIGNATURE', 'RESOLUTION'] } }, reviewCondition] };
            break;
        case 'Yordamchi':
            whereClause = { OR: [{ stage: 'RESOLUTION' }, reviewCondition] };
            break;
        case 'Tarmoq':
            whereClause = { OR: [{ mainExecutor: { departmentId: user.departmentId } }, reviewCondition] };
            break;
        case 'Reviewer':
            whereClause = { OR: [{ internalAssigneeId: user.id }, reviewCondition] };
            break;
        default:
            whereClause = reviewCondition;
            break;
    }

    return prisma.document.findMany({
        where: whereClause,
        include: documentInclude,
        orderBy: { createdAt: 'desc' }
    });
}

export async function findDocumentById(id: number) {
    return prisma.document.findUnique({
        where: { id },
        include: documentInclude,
    });
}

export async function createIncoming(data: { title: string, content: string, source: string, kartoteka: string }, authorId: number) {
    const newDocument = await prisma.document.create({
        data: {
            ...data,
            authorId,
            type: 'Kiruvchi',
            stage: 'PENDING_REGISTRATION',
        }
    });
    await createAuditLog(newDocument.id, 'Hujjat yaratildi', authorId, `Turi: Kiruvchi. Manba: ${data.source}`);
    return newDocument;
}

// <<< ИСПРАВЛЕНО ЗДЕСЬ: documentAuditLog -> auditLog >>>
async function createAuditLog(documentId: number, action: string, userId: number, details?: string) {
    await prisma.auditLog.create({
        data: {
            documentId,
            userId,
            action,
            details
        }
    });
}

export async function createOutgoing(data: { title: string, content: string, kartoteka: string }, authorId: number) {
    const newDoc = await prisma.document.create({
        data: {
            ...data,
            authorId,
            type: 'Chiquvchi',
            stage: 'DRAFTING',
            source: 'Bank ichki tizimi'
        }
    });
    await createAuditLog(newDoc.id, 'Chiquvchi hujjat yaratildi', authorId);
    return newDoc;
}

export async function submitForReview(documentId: number, userId: number) {
    const requiredReviewers = await prisma.user.findMany({
        where: {
            OR: [
                { role: { name: 'Bank apparati' } },
                { department: { name: 'Yuridik Departament' } },
                { department: { name: 'Komplayens nazorat' } },
            ]
        }
    });

    if (requiredReviewers.length === 0) {
        throw new Error("Required reviewers not found. Please seed the database.");
    }

    await prisma.$transaction([
        prisma.documentReviewer.createMany({
            data: requiredReviewers.map(reviewer => ({
                documentId: documentId,
                userId: reviewer.id,
                status: 'PENDING'
            })),
            skipDuplicates: true
        }),
        prisma.document.update({
            where: { id: documentId },
            data: { stage: 'FINAL_REVIEW' }
        })
    ]);
    await createAuditLog(documentId, 'Kelishuvga yuborildi', userId);

    return findDocumentById(documentId);
}

async function createNotification(userId: number, message: string, documentId: number) {
    await prisma.notification.create({
        data: {
            userId,
            message,
            link: `/correspondence/${documentId}`
        }
    });
}

export async function approveReview(documentId: number, userId: number) {
    await prisma.documentReviewer.update({
        where: { documentId_userId: { documentId, userId } },
        data: { status: 'APPROVED' }
    });
    await createAuditLog(documentId, 'Kelishuv tasdiqlandi', userId);

    const pendingReviews = await prisma.documentReviewer.count({
        where: { documentId, status: 'PENDING' }
    });

    if (pendingReviews === 0) {
        await prisma.document.update({
            where: { id: documentId },
            data: { stage: 'SIGNATURE' }
        });
        await createAuditLog(documentId, 'Barcha kelishuvlar tasdiqlandi, imzolashga o\'tkazildi', userId);
    }

    return findDocumentById(documentId);
}

export async function rejectReview(documentId: number, userId: number, comment: string) {
    await prisma.$transaction([
        prisma.documentReviewer.update({
            where: { documentId_userId: { documentId, userId } },
            data: { status: 'REJECTED', comment: comment || 'Без коментаря' }
        }),
        prisma.document.update({
            where: { id: documentId },
            data: { stage: 'REVISION_REQUESTED' }
        })
    ]);
    await createAuditLog(documentId, 'Kelishuv rad etildi', userId, `Sabab: ${comment}`);

    return findDocumentById(documentId);
}

export async function sign(documentId: number, userId: number) {
    const signedDoc = await prisma.document.update({
        where: { id: documentId },
        data: { stage: 'DISPATCH' },
        include: documentInclude,
    });
    await createAuditLog(documentId, 'Hujjat imzolandi', userId);
    return signedDoc;
}

export async function dispatch(documentId: number, userId: number) {
    const dispatchedDoc = await prisma.document.update({
        where: { id: documentId },
        data: { stage: 'COMPLETED' },
        include: documentInclude,
    });
    await createAuditLog(documentId, 'Hujjat yakunlandi', userId);
    return dispatchedDoc;
}

export async function updateExecutors(documentId: number, payload: { mainExecutorId?: number, coExecutorIds?: number[], contributorIds?: number[] }, doerId: number) {
    const { mainExecutorId, coExecutorIds, contributorIds } = payload;

    const document = await prisma.document.findUnique({ where: { id: documentId }, select: { title: true } });
    if (!document) throw new Error("Document not found");

    return prisma.$transaction(async (tx) => {
        if (mainExecutorId) {
            await tx.document.update({
                where: { id: documentId },
                data: { mainExecutorId: Number(mainExecutorId) }
            });
            const mainExecutor = await tx.user.findUnique({ where: { id: Number(mainExecutorId) } });
            await createAuditLog(
                documentId, 'Asosiy ijrochi tayinlandi',
                doerId,
                `Ijrochi: ${mainExecutor?.name}`);
            await createNotification(
                Number(mainExecutorId),
                `Sizga yangi hujjat tayinlandi: "${document.title}"`,
                documentId
            );
        }

        if (Array.isArray(coExecutorIds)) {
            await tx.documentCoExecutor.deleteMany({ where: { documentId } });
            if (coExecutorIds.length > 0) {
                await tx.documentCoExecutor.createMany({
                    data: coExecutorIds.map((userId: number) => ({ documentId, userId }))
                });
                for (const userId of coExecutorIds) {
                    await createNotification(
                        userId,
                        `Siz hujjatga qo'shimcha ijrochi sifatida tayinlandingiz: "${document.title}"`,
                        documentId
                    );
                }
            }
        }

        if (Array.isArray(contributorIds)) {
            await tx.documentContributor.deleteMany({ where: { documentId } });
            if (contributorIds.length > 0) {
                await tx.documentContributor.createMany({
                    data: contributorIds.map((userId: number) => ({ documentId, userId }))
                });
                for (const userId of contributorIds) {
                    await createNotification(
                        userId,
                        `Siz hujjatga ishtirokchi sifatida qo'shildingiz: "${document.title}"`,
                        documentId
                    );
                }
            }
        }

        return tx.document.findUnique({
            where: { id: documentId },
            include: documentInclude,
        });
    });
}

export async function updateDeadline(documentId: number, deadlines: { deadline?: string, stageDeadline?: string }) {
    const dataToUpdate: any = {};
    if (deadlines.deadline) dataToUpdate.deadline = new Date(deadlines.deadline);
    if (deadlines.stageDeadline) dataToUpdate.stageDeadline = new Date(deadlines.stageDeadline);

    return prisma.document.update({
        where: { id: documentId },
        data: dataToUpdate,
        include: documentInclude,
    });
}

export async function changeStage(documentId: number, stage: any, userId: number) {
    const updatedDoc = await prisma.document.update({
        where: { id: documentId },
        data: { stage },
        include: documentInclude,
    });
    await createAuditLog(documentId, `Status o'zgartirildi: ${stage}`, userId);
    return updatedDoc;
}
import { Prisma, User, DocumentStage } from "@prisma/client";
import { prisma } from "./prisma";

// --- Вспомогательная функция для создания записи в аудит лог ---
async function createAuditLog(documentId: number, action: string, userId?: number, details?: string) {
    try {
        await prisma.auditLog.create({
            data: {
                documentId,
                userId,
                action,
                details
                // timestamp установится автоматически через @default(now())
            }
        });
    } catch (error) {
        console.error(`Failed to create audit log for document ${documentId}:`, error);
    }
}

// --- Вспомогательная функция для создания уведомлений ---
async function createNotification(userId: number, message: string, documentId: number) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                message,
                link: `/correspondence/${documentId}`
            }
        });
     } catch (error) {
         console.error(`Failed to create notification for user ${userId} regarding document ${documentId}:`, error);
     }
}


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
    auditLogs: { // Имя связи правильное (множественное число)
        // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
        orderBy: { timestamp: 'desc' }, // ИЗМЕНЕНО: createdAt -> timestamp
        include: { user: { select: { name: true } } }
    },
} satisfies Prisma.DocumentInclude;


export async function findDocumentsForUser(user: User & { role: { name: string }, department: { name: string } | null }) {
    console.log("Finding documents for user:", user.email, "Role:", user.role.name); // ЛОГ 1
    let whereClause: Prisma.DocumentWhereInput = {};
    const reviewCondition: Prisma.DocumentWhereInput = { reviewers: { some: { userId: user.id, status: 'PENDING' } } };

    // Используем константы для имен ролей
    const UserRoleNames = {
        Admin: 'Admin',
        BankApparati: 'Bank apparati',
        Boshqaruv: 'Boshqaruv',
        Yordamchi: 'Yordamchi',
        Tarmoq: 'Tarmoq',
        Reviewer: 'Reviewer',
        Resepshn: 'Resepshn',
        BankKengashiKotibi: 'Bank Kengashi kotibi',
        KollegialOrganKotibi: 'Kollegial organ kotibi',
    };


    switch (user.role.name) {
        case UserRoleNames.Admin:
        case UserRoleNames.BankApparati:
            whereClause = {}; // Видят все
            break;
        case UserRoleNames.Boshqaruv:
            whereClause = { OR: [{ stage: { in: ['ASSIGNMENT', 'SIGNATURE', 'RESOLUTION'] } }, reviewCondition] };
            break;
        case UserRoleNames.Yordamchi:
            whereClause = { OR: [{ stage: 'RESOLUTION' }, reviewCondition] };
            break;
        case UserRoleNames.Tarmoq:
            if (user.departmentId) {
                whereClause = { OR: [{ mainExecutor: { departmentId: user.departmentId } }, reviewCondition] };
            } else {
                 whereClause = reviewCondition;
            }
            break;
        case UserRoleNames.Reviewer:
            whereClause = { OR: [{ internalAssigneeId: user.id }, reviewCondition] };
            break;
         case UserRoleNames.Resepshn:
         case UserRoleNames.BankKengashiKotibi:
         case UserRoleNames.KollegialOrganKotibi:
             whereClause = { id: -1 };
             console.log(`Role ${user.role.name} should not see the main document list.`); // ЛОГ 2
             break;
        default:
            whereClause = reviewCondition;
            break;
    }
    console.log("Generated whereClause:", JSON.stringify(whereClause)); // ЛОГ 3

    try {
        const documents = await prisma.document.findMany({
            where: whereClause,
            include: documentInclude, // Теперь include правильный
            orderBy: { createdAt: 'desc' }
        });
        console.log(`Found ${documents.length} documents for user ${user.email}`); // ЛОГ 4
        return documents;
    } catch (error) {
        console.error(`Error fetching documents for user ${user.email}:`, error); // ЛОГ 5
        throw error;
    }
}

// ... остальной код файла documents.service.ts остается без изменений ...
// (findDocumentById, createIncoming, createOutgoing, submitForReview, ...)
// ... до конца файла ...

export async function findDocumentById(id: number) {
    return prisma.document.findUnique({
        where: { id },
        include: documentInclude, // Здесь тоже используется правильный include
    });
}

export async function createIncoming(data: { title: string, content: string, source: string, kartoteka: string }, authorId: number) {
    const newDocument = await prisma.document.create({
        data: {
            ...data,
            authorId,
            type: 'Kiruvchi',
            stage: 'PENDING_REGISTRATION',
            status: 'YANGI',
        }
    });
    await createAuditLog(newDocument.id, 'Hujjat yaratildi', authorId, `Turi: Kiruvchi. Manba: ${data.source}`);
    return newDocument;
}

export async function createOutgoing(data: { title: string, content?: string, kartoteka: string }, authorId: number) {
    const newDocument = await prisma.document.create({
        data: {
            title: data.title,
            content: data.content ?? '',
            kartoteka: data.kartoteka,
            authorId,
            type: 'Chiquvchi',
            stage: 'DRAFTING',
            status: 'YANGI',
            source: 'Bank ichki tizimi'
        }
    });
    await createAuditLog(newDocument.id, 'Hujjat yaratildi', authorId, `Turi: Chiquvchi. Kartoteka: ${data.kartoteka}`);
    return newDocument;
}

export async function submitForReview(documentId: number, submitterId: number) {
    const requiredReviewers = await prisma.user.findMany({
        where: {
            OR: [
                { role: { name: 'Bank apparati' } },
                { department: { name: 'Yuridik Departament' } },
                { department: { name: 'Komplayens nazorat' } },
            ]
        },
        select: { id: true, name: true }
    });

    if (requiredReviewers.length === 0) {
        throw new Error("Required reviewers not found. Please seed the database.");
    }

    const document = await prisma.document.findUnique({ where: {id: documentId }, select: { title: true }});
    if (!document) throw new Error("Document not found");

    const submitter = await prisma.user.findUnique({ where: { id: submitterId }, select: { name: true }});

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
    await createAuditLog(documentId, 'Kelishuvga yuborildi', submitterId, `Kim tomonidan: ${submitter?.name}`);

    for(const reviewer of requiredReviewers) {
        await createNotification(reviewer.id, `Sizdan hujjatni kelishish so'ralmoqda: "${document.title}"`, documentId);
    }

    return findDocumentById(documentId);
}

export async function approveReview(documentId: number, userId: number) {
    const reviewer = await prisma.user.findUnique({ where: {id: userId }, select: { name: true }});
    const document = await prisma.document.findUnique({ where: {id: documentId }, select: { title: true, authorId: true }});
    if (!document) throw new Error("Document not found");

    await prisma.documentReviewer.update({
        where: { documentId_userId: { documentId, userId } },
        data: { status: 'APPROVED' }
    });

    await createAuditLog(documentId, 'Kelishuv tasdiqlandi', userId, `Kelishuvchi: ${reviewer?.name}`);

    const pendingReviews = await prisma.documentReviewer.count({
        where: { documentId, status: 'PENDING' }
    });

    if (pendingReviews === 0) {
        await prisma.document.update({
            where: { id: documentId },
            data: { stage: 'SIGNATURE' }
        });
        await createAuditLog(documentId, 'Barcha kelishuvlar olindi, imzolashga o\'tkazildi');
        const boshqaruvUsers = await prisma.user.findMany({ where: { role: { name: 'Boshqaruv'}}, select: { id: true }});
        for(const user of boshqaruvUsers) {
            await createNotification(user.id, `Hujjat imzolash uchun tayyor: "${document.title}"`, documentId);
        }
        if (document.authorId) {
             await createNotification(document.authorId, `Sizning hujjatingiz kelishildi va imzolashga yuborildi: "${document.title}"`, documentId);
        }
    }

    return findDocumentById(documentId);
}

export async function rejectReview(documentId: number, userId: number, comment: string) {
    const reviewer = await prisma.user.findUnique({ where: {id: userId }, select: { name: true }});
    const document = await prisma.document.findUnique({ where: {id: documentId }, select: { title: true, authorId: true }});
     if (!document) throw new Error("Document not found");

    await prisma.$transaction([
        prisma.documentReviewer.update({
            where: { documentId_userId: { documentId, userId } },
            data: { status: 'REJECTED', comment: comment || 'Sabab ko\'rsatilmagan' }
        }),
        prisma.document.update({
            where: { id: documentId },
            data: { stage: 'REVISION_REQUESTED' }
        }),
        prisma.documentReviewer.updateMany({
            where: { documentId: documentId, NOT: { userId: userId } },
            data: { status: 'PENDING', comment: null }
        })
    ]);
    await createAuditLog(documentId, 'Kelishuv rad etildi', userId, `Kelishuvchi: ${reviewer?.name}. Sabab: ${comment || 'Sabab ko\'rsatilmagan'}`);

    if (document.authorId) {
        await createNotification(document.authorId, `Sizning hujjatingiz rad etildi va qayta ishlashga yuborildi: "${document.title}". Sabab: ${comment || 'Sabab ko\'rsatilmagan'}`, documentId);
    }

    return findDocumentById(documentId);
}

export async function sign(documentId: number, userId: number) {
    const user = await prisma.user.findUnique({ where: {id: userId }, select: { name: true }});
    const document = await prisma.document.findUnique({ where: {id: documentId }, select: { title: true, authorId: true }});
     if (!document) throw new Error("Document not found");

    const signedDoc = await prisma.document.update({
        where: { id: documentId },
        data: { stage: 'DISPATCH' },
        include: documentInclude,
    });
    await createAuditLog(documentId, 'Hujjat imzolandi', userId, `Imzolovchi: ${user?.name}`);

    const bankApparatiUsers = await prisma.user.findMany({ where: { role: { name: 'Bank apparati'}}, select: { id: true }});
    for(const baUser of bankApparatiUsers) {
        await createNotification(baUser.id, `Hujjat jo'natish/yakunlash uchun tayyor: "${document.title}"`, documentId);
    }
     if (document.authorId) {
          await createNotification(document.authorId, `Sizning hujjatingiz imzolandi: "${document.title}"`, documentId);
     }

    return signedDoc;
}

export async function dispatch(documentId: number, userId: number) {
    const user = await prisma.user.findUnique({ where: {id: userId }, select: { name: true }});
    const document = await prisma.document.findUnique({ where: {id: documentId }, select: { title: true, authorId: true }});
     if (!document) throw new Error("Document not found");

    const dispatchedDoc = await prisma.document.update({
        where: { id: documentId },
        data: { stage: 'COMPLETED', status: 'BAJARILGAN' },
        include: documentInclude,
    });
    await createAuditLog(documentId, 'Hujjat jo\'natildi / Yakunlandi', userId, `Mas'ul: ${user?.name}`);

     if (document.authorId) {
          await createNotification(document.authorId, `Sizning hujjatingiz yakunlandi: "${document.title}"`, documentId);
     }

    return dispatchedDoc;
}


export async function updateExecutors(documentId: number, payload: { mainExecutorId?: number, coExecutorIds?: number[], contributorIds?: number[] }, doerId: number) {
    const { mainExecutorId, coExecutorIds, contributorIds } = payload;

    const document = await prisma.document.findUnique({ where: { id: documentId }, select: { title: true } });
    if (!document) throw new Error("Document not found");

    const doer = await prisma.user.findUnique({ where: { id: doerId }, select: { name: true }});

    return prisma.$transaction(async (tx) => {
        let mainExecutorName = 'Noma\'lum';
        if (mainExecutorId) {
            await tx.document.update({
                where: { id: documentId },
                data: { mainExecutorId: Number(mainExecutorId) }
            });
            const mainExecutor = await tx.user.findUnique({ where: { id: Number(mainExecutorId) }, select: { name: true }});
            mainExecutorName = mainExecutor?.name ?? 'Noma\'lum';
            await createAuditLog(
                documentId, 'Asosiy ijrochi tayinlandi/o\'zgartirildi',
                doerId,
                `Kim tomonidan: ${doer?.name}. Yangi ijrochi: ${mainExecutorName}`);
            await createNotification(
                Number(mainExecutorId),
                `Sizga yangi hujjat asosiy ijrochi sifatida tayinlandi: "${document.title}"`,
                documentId
            );
        }

        if (Array.isArray(coExecutorIds)) {
            const currentCoExecutors = await tx.documentCoExecutor.findMany({ where: { documentId }, select: { userId: true }});
            const currentIds = currentCoExecutors.map(c => c.userId);
            const idsToAdd = coExecutorIds.filter(id => !currentIds.includes(id));
            const idsToRemove = currentIds.filter(id => !coExecutorIds.includes(id));

            if (idsToRemove.length > 0) {
                 await tx.documentCoExecutor.deleteMany({ where: { documentId, userId: { in: idsToRemove } } });
            }
            if (idsToAdd.length > 0) {
                await tx.documentCoExecutor.createMany({
                    data: idsToAdd.map((userId: number) => ({ documentId, userId }))
                });
                for (const userId of idsToAdd) {
                    await createNotification(
                        userId,
                        `Siz hujjatga qo'shimcha ijrochi sifatida tayinlandingiz: "${document.title}"`,
                        documentId
                    );
                }
            }
             if (idsToAdd.length > 0 || idsToRemove.length > 0) {
                 const coExecutorUsers = await tx.user.findMany({ where: { id: { in: coExecutorIds }}, select: { name: true }});
                 const coExecutorNames = coExecutorUsers.map(u => u.name).join(', ');
                 await createAuditLog(documentId, 'Qo\'shimcha ijrochilar ro\'yxati o\'zgartirildi', doerId, `Kim tomonidan: ${doer?.name}. Yangi ro'yxat: ${coExecutorNames || 'Bo\'sh'}`);
             }
        }

        if (Array.isArray(contributorIds)) {
             const currentContributors = await tx.documentContributor.findMany({ where: { documentId }, select: { userId: true }});
             const currentIds = currentContributors.map(c => c.userId);
             const idsToAdd = contributorIds.filter(id => !currentIds.includes(id));
             const idsToRemove = currentIds.filter(id => !contributorIds.includes(id));

            if (idsToRemove.length > 0) {
                await tx.documentContributor.deleteMany({ where: { documentId, userId: { in: idsToRemove } } });
            }
            if (idsToAdd.length > 0) {
                await tx.documentContributor.createMany({
                    data: idsToAdd.map((userId: number) => ({ documentId, userId }))
                });
                for (const userId of idsToAdd) {
                    await createNotification(
                        userId,
                        `Siz hujjatga ishtirokchi sifatida qo'shildingiz: "${document.title}"`,
                        documentId
                    );
                }
            }
            if (idsToAdd.length > 0 || idsToRemove.length > 0) {
                 const contributorUsers = await tx.user.findMany({ where: { id: { in: contributorIds }}, select: { name: true }});
                 const contributorNames = contributorUsers.map(u => u.name).join(', ');
                 await createAuditLog(documentId, 'Ishtirokchilar ro\'yxati o\'zgartirildi', doerId, `Kim tomonidan: ${doer?.name}. Yangi ro'yxat: ${contributorNames || 'Bo\'sh'}`);
            }
        }

        if(mainExecutorId) {
            const currentDoc = await tx.document.findUnique({ where: { id: documentId }, select: { stage: true }});
            const stagesEligibleForExecution = ['PENDING_REGISTRATION', 'REGISTRATION', 'RESOLUTION', 'ASSIGNMENT', 'DRAFTING', 'REVISION_REQUESTED'];
            if(currentDoc?.stage && stagesEligibleForExecution.includes(currentDoc.stage)) {
                 await tx.document.update({
                     where: { id: documentId },
                     data: { stage: 'EXECUTION', status: 'IJROGA_YUBORILDI' }
                 });
                 await createAuditLog(documentId, 'Hujjat ijroga o\'tkazildi', doerId, `Asosiy ijrochi tayinlandi: ${mainExecutorName}`);
            }
        }


        return tx.document.findUnique({
            where: { id: documentId },
            include: documentInclude,
        });
    });
}


export async function updateDeadline(documentId: number, deadlines: { deadline?: string }, doerId: number) {
    const dataToUpdate: any = {};
    if (deadlines.deadline) {
        dataToUpdate.deadline = new Date(deadlines.deadline);
    } else {
        dataToUpdate.deadline = null;
    }

    const doer = await prisma.user.findUnique({ where: { id: doerId }, select: { name: true }});

    const updatedDoc = await prisma.document.update({
        where: { id: documentId },
        data: dataToUpdate,
        include: documentInclude,
    });

    await createAuditLog(documentId, 'Ijro muddati o\'zgartirildi', doerId, `Kim tomonidan: ${doer?.name}. Yangi muddat: ${deadlines.deadline ? new Date(deadlines.deadline).toLocaleDateString() : 'Muddatsiz'}`);

    return updatedDoc;
}


async function changeStageAndLog(documentId: number, newStage: DocumentStage, userId: number, details?: string) {
     const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true }});
     const stageChangeResult = await prisma.document.update({
         where: { id: documentId },
         data: { stage: newStage },
         include: documentInclude,
     });
     await createAuditLog(documentId, `Bosqich o'zgartirildi: ${newStage}`, userId, `Kim tomonidan: ${user?.name}. ${details || ''}`);
     return stageChangeResult;
}

export async function holdCorrespondence(documentId: number, userId: number) {
    return changeStageAndLog(documentId, DocumentStage.ON_HOLD, userId, 'Hujjat ijrosi to\'xtatildi');
}

export async function cancelCorrespondence(documentId: number, userId: number, reason: string) {
     const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true }});
     const stageChangeResult = await prisma.document.update({
         where: { id: documentId },
         data: { stage: DocumentStage.CANCELLED, status: 'BAJARILGAN' }, // Или другой конечный статус
         include: documentInclude,
     });
     await createAuditLog(documentId, `Bosqich o'zgartirildi: ${DocumentStage.CANCELLED}`, userId, `Kim tomonidan: ${user?.name}. Sabab: ${reason}`);
     return stageChangeResult;
}

export async function assignInternalEmployee(documentId: number, internalAssigneeId: number, assignerId: number) {
     const document = await prisma.document.findUnique({ where: { id: documentId }, select: { title: true } });
     if (!document) throw new Error("Document not found");

     const assigner = await prisma.user.findUnique({ where: { id: assignerId }, select: { name: true }});
     const assignee = await prisma.user.findUnique({ where: { id: internalAssigneeId }, select: { name: true }});


     const updatedDoc = await prisma.document.update({
         where: { id: documentId },
         data: { internalAssigneeId },
         include: documentInclude,
     });

     await createAuditLog(documentId, 'Ichki ijrochi tayinlandi', assignerId, `Kim tomonidan: ${assigner?.name}. Ichki ijrochi: ${assignee?.name}`);

     await createNotification(
         internalAssigneeId,
         `Sizga ichki ijrochi sifatida hujjat tayinlandi: "${document.title}"`,
         documentId
     );

     return updatedDoc;
}
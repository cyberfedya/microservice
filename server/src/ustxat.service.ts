import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Ustxat система (Резолюция)
 * Регламент, Раздел III, пункт 9
 * 
 * Полная система резолюций с:
 * - Asosiy ijrochi (основной исполнитель)
 * - Teng ijrochi (равный исполнитель)
 * - Ham ijrochi (соисполнитель)
 * - Yordamchi workflow (помощник)
 */

export interface ResolutionData {
  documentId: number;
  text: string;
  deadline?: Date;
  assignedBy: number;
  mainExecutorId?: number;
  equalExecutors?: number[];
  coExecutors?: number[];
  assistantId?: number;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
}

/**
 * Создать резолюцию (ustxat)
 */
export async function createResolution(data: ResolutionData) {
  const {
    documentId,
    text,
    deadline,
    assignedBy,
    mainExecutorId,
    equalExecutors = [],
    coExecutors = [],
    assistantId,
    priority = 'MEDIUM',
    notes
  } = data;

  // Обновить документ с основным исполнителем
  const document = await prisma.document.update({
    where: { id: documentId },
    data: {
      mainExecutorId,
      deadline,
      stage: 'ASSIGNMENT'
    }
  });

  // Добавить равных исполнителей (teng ijrochi)
  if (equalExecutors.length > 0) {
    await prisma.documentReviewer.createMany({
      data: equalExecutors.map(userId => ({
        documentId,
        userId,
        role: 'TENG_IJROCHI'
      }))
    });
  }

  // Добавить соисполнителей (ham ijrochi)
  if (coExecutors.length > 0) {
    await prisma.documentCoExecutor.createMany({
      data: coExecutors.map(userId => ({
        documentId,
        userId
      }))
    });
  }

  // Добавить помощника
  if (assistantId) {
    await prisma.documentContributor.create({
      data: {
        documentId,
        userId: assistantId,
        role: 'YORDAMCHI'
      }
    });
  }

  // Создать уведомления всем исполнителям
  const allExecutors = [
    mainExecutorId,
    ...equalExecutors,
    ...coExecutors,
    assistantId
  ].filter(Boolean) as number[];

  await prisma.notification.createMany({
    data: allExecutors.map(userId => ({
      userId,
      message: `Sizga yangi ustxat berildi: ${text}`,
      link: `/documents/${documentId}`
    }))
  });

  // Создать audit log
  await prisma.auditLog.create({
    data: {
      userId: assignedBy,
      action: 'RESOLUTION_CREATED',
      details: `Ustxat yaratildi: ${text}. Asosiy ijrochi: ${mainExecutorId || 'yo\'q'}`
    }
  });

  return {
    document,
    resolution: {
      text,
      deadline,
      mainExecutorId,
      equalExecutors,
      coExecutors,
      assistantId,
      priority,
      notes
    }
  };
}

/**
 * Получить резолюции документа
 */
export async function getDocumentResolutions(documentId: number) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      mainExecutor: {
        include: {
          role: true,
          department: true
        }
      },
      reviewers: {
        include: {
          user: {
            include: {
              role: true,
              department: true
            }
          }
        }
      },
      coExecutors: {
        include: {
          user: {
            include: {
              role: true,
              department: true
            }
          }
        }
      },
      contributors: {
        include: {
          user: {
            include: {
              role: true,
              department: true
            }
          }
        }
      }
    }
  });

  if (!document) {
    throw new Error('Hujjat topilmadi');
  }

  return {
    document,
    mainExecutor: document.mainExecutor,
    equalExecutors: document.reviewers.filter(r => r.role === 'TENG_IJROCHI'),
    coExecutors: document.coExecutors,
    assistant: document.contributors.find(c => c.role === 'YORDAMCHI')
  };
}

/**
 * Переназначить исполнителя
 */
export async function reassignExecutor(data: {
  documentId: number;
  newExecutorId: number;
  reassignedBy: number;
  reason: string;
}) {
  const { documentId, newExecutorId, reassignedBy, reason } = data;

  const document = await prisma.document.update({
    where: { id: documentId },
    data: {
      mainExecutorId: newExecutorId
    },
    include: {
      mainExecutor: true
    }
  });

  // Уведомить нового исполнителя
  await prisma.notification.create({
    data: {
      userId: newExecutorId,
      message: `Sizga hujjat qayta tayinlandi. Sabab: ${reason}`,
      link: `/documents/${documentId}`
    }
  });

  // Создать audit log
  await prisma.auditLog.create({
    data: {
      userId: reassignedBy,
      action: 'EXECUTOR_REASSIGNED',
      details: `Ijrochi o'zgartirildi. Yangi ijrochi: ${newExecutorId}. Sabab: ${reason}`
    }
  });

  return document;
}

/**
 * Добавить комментарий к резолюции
 */
export async function addResolutionComment(data: {
  documentId: number;
  userId: number;
  comment: string;
}) {
  const { documentId, userId, comment } = data;

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'RESOLUTION_COMMENT',
      details: comment
    }
  });

  // Уведомить всех исполнителей
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      mainExecutor: true,
      coExecutors: true,
      reviewers: true
    }
  });

  if (document) {
    const executorIds = [
      document.mainExecutorId,
      ...document.coExecutors.map(ce => ce.userId),
      ...document.reviewers.map(r => r.userId)
    ].filter(Boolean) as number[];

    await prisma.notification.createMany({
      data: executorIds.map(execId => ({
        userId: execId,
        message: `Yangi izoh: ${comment}`,
        link: `/documents/${documentId}`
      }))
    });
  }

  return { success: true };
}

/**
 * Получить статистику по резолюциям
 */
export async function getResolutionStatistics(userId?: number) {
  const where: any = {};
  if (userId) {
    where.OR = [
      { mainExecutorId: userId },
      { coExecutors: { some: { userId } } },
      { reviewers: { some: { userId } } }
    ];
  }

  const [
    totalAssigned,
    inProgress,
    completed,
    overdue
  ] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.count({
      where: {
        ...where,
        stage: {
          in: ['ASSIGNMENT', 'EXECUTION', 'DRAFTING']
        }
      }
    }),
    prisma.document.count({
      where: {
        ...where,
        stage: 'COMPLETED'
      }
    }),
    prisma.document.count({
      where: {
        ...where,
        deadline: {
          lt: new Date()
        },
        stage: {
          notIn: ['COMPLETED', 'ARCHIVED', 'CANCELLED']
        }
      }
    })
  ]);

  return {
    totalAssigned,
    inProgress,
    completed,
    overdue,
    completionRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0
  };
}

/**
 * Получить документы пользователя по роли
 */
export async function getUserDocumentsByRole(userId: number, role: 'MAIN' | 'EQUAL' | 'CO' | 'ASSISTANT') {
  let documents;

  switch (role) {
    case 'MAIN':
      documents = await prisma.document.findMany({
        where: { mainExecutorId: userId },
        include: {
          author: true,
          mainExecutor: true
        },
        orderBy: { deadline: 'asc' }
      });
      break;

    case 'EQUAL':
      const reviewers = await prisma.documentReviewer.findMany({
        where: {
          userId,
          role: 'TENG_IJROCHI'
        },
        include: {
          document: {
            include: {
              author: true,
              mainExecutor: true
            }
          }
        }
      });
      documents = reviewers.map(r => r.document);
      break;

    case 'CO':
      const coExecutors = await prisma.documentCoExecutor.findMany({
        where: { userId },
        include: {
          document: {
            include: {
              author: true,
              mainExecutor: true
            }
          }
        }
      });
      documents = coExecutors.map(ce => ce.document);
      break;

    case 'ASSISTANT':
      const contributors = await prisma.documentContributor.findMany({
        where: {
          userId,
          role: 'YORDAMCHI'
        },
        include: {
          document: {
            include: {
              author: true,
              mainExecutor: true
            }
          }
        }
      });
      documents = contributors.map(c => c.document);
      break;

    default:
      documents = [];
  }

  return documents;
}

/**
 * Завершить выполнение резолюции
 */
export async function completeResolution(data: {
  documentId: number;
  userId: number;
  completionNotes: string;
}) {
  const { documentId, userId, completionNotes } = data;

  const document = await prisma.document.update({
    where: { id: documentId },
    data: {
      stage: 'COMPLETED',
      status: 'BAJARILDI'
    }
  });

  // Создать audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'RESOLUTION_COMPLETED',
      details: `Ustxat bajarildi: ${completionNotes}`
    }
  });

  // Уведомить автора документа
  await prisma.notification.create({
    data: {
      userId: document.authorId,
      message: `Hujjat bajarildi: ${completionNotes}`,
      link: `/documents/${documentId}`
    }
  });

  return document;
}

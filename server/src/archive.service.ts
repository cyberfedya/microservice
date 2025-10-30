import { PrismaClient, DocumentValue, ArchiveStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Сервис архивной системы
 * Регламент, Раздел VI, пункты 50-52
 */

// Сроки хранения в годах
const STORAGE_YEARS: Record<DocumentValue, number | null> = {
  PERMANENT: null,
  TEMPORARY_75_YEARS: 75,
  TEMPORARY_50_YEARS: 50,
  TEMPORARY_25_YEARS: 25,
  TEMPORARY_10_YEARS: 10,
  TEMPORARY_5_YEARS: 5,
  TEMPORARY_3_YEARS: 3,
  NO_VALUE: 0
};

// ============================================
// MARKAZIY EKSPERT KOMISSIYASI
// ============================================

export async function createExpertCommission(data: {
  name: string;
  chairmanId: number;
  secretaryId?: number;
}) {
  return await prisma.expertCommission.create({
    data,
    include: {
      chairman: true,
      secretary: true
    }
  });
}

export async function addCommissionMember(data: {
  commissionId: number;
  userId: number;
  role?: string;
}) {
  return await prisma.commissionMember.create({
    data,
    include: {
      user: {
        include: {
          role: true,
          department: true
        }
      }
    }
  });
}

export async function createCommissionMeeting(data: {
  commissionId: number;
  date: Date;
  location?: string;
  agenda: string;
  decisions?: string;
  protocolNumber?: string;
}) {
  return await prisma.commissionMeeting.create({
    data
  });
}

// ============================================
// EKSPERTIZA (Экспертиза ценности)
// ============================================

export async function createDocumentExpertise(data: {
  documentId: number;
  commissionId: number;
  documentValue: DocumentValue;
  decision: string;
  decidedBy: number;
  notes?: string;
}) {
  const storageYears = STORAGE_YEARS[data.documentValue];
  const destroyDate = storageYears
    ? new Date(Date.now() + storageYears * 365 * 24 * 60 * 60 * 1000)
    : null;

  const expertise = await prisma.documentExpertise.create({
    data: {
      ...data,
      storageYears,
      destroyDate
    },
    include: {
      document: true,
      commission: true,
      decidedByUser: true
    }
  });

  // Обновить статус документа
  if (data.documentValue !== 'NO_VALUE') {
    await prisma.document.update({
      where: { id: data.documentId },
      data: {
        stage: 'ARCHIVED'
      }
    });
  }

  return expertise;
}

export async function getDocumentExpertises(documentId: number) {
  return await prisma.documentExpertise.findMany({
    where: { documentId },
    include: {
      commission: true,
      decidedByUser: true
    },
    orderBy: { expertiseDate: 'desc' }
  });
}

// Получить документы, требующие экспертизы
export async function getDocumentsNeedingExpertise() {
  // Документы старше 3 лет без экспертизы
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  const documents = await prisma.document.findMany({
    where: {
      createdAt: {
        lt: threeYearsAgo
      },
      stage: {
        in: ['COMPLETED', 'ARCHIVED']
      },
      expertise: {
        none: {}
      }
    },
    include: {
      author: true,
      mainExecutor: true
    },
    take: 100
  });

  return documents;
}

// ============================================
// ARXIV XRANILISHCHA (Архивное хранилище)
// ============================================

export async function archiveDocument(data: {
  documentId: number;
  archiveNumber: string;
  shelfLocation?: string;
  boxNumber?: string;
  archivedBy: number;
  notes?: string;
}) {
  // Проверить, что документ прошел экспертизу
  const expertise = await prisma.documentExpertise.findFirst({
    where: {
      documentId: data.documentId,
      documentValue: {
        not: 'NO_VALUE'
      }
    }
  });

  if (!expertise) {
    throw new Error('Hujjat ekspertizadan o\'tmagan');
  }

  const archive = await prisma.archiveStorage.create({
    data,
    include: {
      document: true,
      archivedByUser: true
    }
  });

  // Обновить статус документа
  await prisma.document.update({
    where: { id: data.documentId },
    data: {
      stage: 'ARCHIVED'
    }
  });

  return archive;
}

export async function retrieveDocumentFromArchive(data: {
  documentId: number;
  retrievedBy: number;
}) {
  const archive = await prisma.archiveStorage.findUnique({
    where: { documentId: data.documentId }
  });

  if (!archive) {
    throw new Error('Hujjat arxivda topilmadi');
  }

  return await prisma.archiveStorage.update({
    where: { documentId: data.documentId },
    data: {
      retrievedAt: new Date(),
      retrievedBy: data.retrievedBy,
      archiveStatus: 'ACTIVE'
    },
    include: {
      document: true,
      retrievedByUser: true
    }
  });
}

export async function moveDocumentInArchive(data: {
  documentId: number;
  fromLocation?: string;
  toLocation: string;
  movedBy: number;
  reason?: string;
}) {
  // Создать запись о перемещении
  const movement = await prisma.archiveMovement.create({
    data,
    include: {
      movedByUser: true
    }
  });

  // Обновить местоположение в архиве
  await prisma.archiveStorage.updateMany({
    where: { documentId: data.documentId },
    data: {
      shelfLocation: data.toLocation
    }
  });

  return movement;
}

// ============================================
// SO'ROVLAR (Запросы на выдачу)
// ============================================

export async function createArchiveRequest(data: {
  documentId: number;
  requestedBy: number;
  reason: string;
}) {
  return await prisma.archiveRequest.create({
    data,
    include: {
      requestedByUser: true
    }
  });
}

export async function approveArchiveRequest(data: {
  requestId: number;
  approvedBy: number;
}) {
  return await prisma.archiveRequest.update({
    where: { id: data.requestId },
    data: {
      status: 'APPROVED',
      approvedBy: data.approvedBy,
      approvedAt: new Date()
    },
    include: {
      requestedByUser: true,
      approvedByUser: true
    }
  });
}

export async function rejectArchiveRequest(data: {
  requestId: number;
  approvedBy: number;
  notes?: string;
}) {
  return await prisma.archiveRequest.update({
    where: { id: data.requestId },
    data: {
      status: 'REJECTED',
      approvedBy: data.approvedBy,
      approvedAt: new Date(),
      notes: data.notes
    }
  });
}

export async function returnDocumentToArchive(data: {
  requestId: number;
  returnDate: Date;
}) {
  const request = await prisma.archiveRequest.update({
    where: { id: data.requestId },
    data: {
      status: 'RETURNED',
      returnDate: data.returnDate
    }
  });

  // Вернуть документ в архив
  await prisma.archiveStorage.updateMany({
    where: { documentId: request.documentId },
    data: {
      archiveStatus: 'IN_ARCHIVE'
    }
  });

  return request;
}

export async function getArchiveRequests(filters?: {
  status?: string;
  requestedBy?: number;
}) {
  const where: any = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.requestedBy) where.requestedBy = filters.requestedBy;

  return await prisma.archiveRequest.findMany({
    where,
    include: {
      requestedByUser: true,
      approvedByUser: true
    },
    orderBy: { requestDate: 'desc' }
  });
}

// ============================================
// STATISTIKA (Статистика)
// ============================================

export async function getArchiveStatistics() {
  const [
    totalArchived,
    permanentStorage,
    temporaryStorage,
    pendingExpertise,
    activeRequests,
    documentsToDestroy
  ] = await Promise.all([
    prisma.archiveStorage.count(),
    prisma.archiveStorage.count({
      where: { archiveStatus: 'PERMANENT_STORAGE' }
    }),
    prisma.archiveStorage.count({
      where: { archiveStatus: 'IN_ARCHIVE' }
    }),
    prisma.document.count({
      where: {
        stage: 'COMPLETED',
        expertise: { none: {} }
      }
    }),
    prisma.archiveRequest.count({
      where: { status: 'PENDING' }
    }),
    prisma.documentExpertise.count({
      where: {
        destroyDate: {
          lte: new Date()
        }
      }
    })
  ]);

  // Статистика по ценности документов
  const byValue = await prisma.documentExpertise.groupBy({
    by: ['documentValue'],
    _count: true
  });

  return {
    totalArchived,
    permanentStorage,
    temporaryStorage,
    pendingExpertise,
    activeRequests,
    documentsToDestroy,
    byValue: byValue.reduce((acc, item) => {
      acc[item.documentValue] = item._count;
      return acc;
    }, {} as Record<string, number>)
  };
}

// Получить документы для уничтожения
export async function getDocumentsForDestruction() {
  const expertises = await prisma.documentExpertise.findMany({
    where: {
      destroyDate: {
        lte: new Date()
      },
      documentValue: {
        not: 'PERMANENT'
      }
    },
    include: {
      document: {
        include: {
          author: true,
          archiveStorage: true
        }
      },
      commission: true
    },
    orderBy: { destroyDate: 'asc' }
  });

  return expertises;
}

// Уничтожить документ
export async function destroyDocument(data: {
  documentId: number;
  destroyedBy: number;
  notes?: string;
}) {
  // Обновить статус в архиве
  await prisma.archiveStorage.updateMany({
    where: { documentId: data.documentId },
    data: {
      archiveStatus: 'DESTROYED'
    }
  });

  // Обновить статус документа
  await prisma.document.update({
    where: { id: data.documentId },
    data: {
      stage: 'CANCELLED'
    }
  });

  // Создать запись в audit log
  await prisma.auditLog.create({
    data: {
      userId: data.destroyedBy,
      action: 'DOCUMENT_DESTROYED',
      details: `Hujjat yo'q qilindi. ${data.notes || ''}`
    }
  });

  return { success: true };
}

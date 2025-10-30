import { PrismaClient, DocumentStage } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Сервис для работы с этапами обработки документов
 * Реализует 8 этапов из Регламента (1-ilova)
 */

// Временные лимиты для каждого этапа (в минутах)
const STAGE_TIME_LIMITS: Record<DocumentStage, number> = {
  PENDING_REGISTRATION: 120,  // 2 часа - Post office
  REGISTRATION: 120,           // 2 часа - Yordamchi (ustxat)
  RESOLUTION: 180,             // 3 часа - Boshqaruv
  ASSIGNMENT: 120,             // 2 часа - Tarmoq (распределение)
  EXECUTION: 0,                // В срок ijro muddati
  DRAFTING: 0,                 // В срок
  REVISION_REQUESTED: 120,     // 2 часа - пересмотр
  SIGNATURE: 120,              // 2 часа
  DISPATCH: 120,               // 2 часа - Bank apparati
  FINAL_REVIEW: 0,             // В срок
  COMPLETED: 0,
  REJECTED: 0,
  ON_HOLD: 0,
  CANCELLED: 0,
  ARCHIVED: 0
};

interface StageTransitionInput {
  documentId: number;
  newStage: DocumentStage;
  performedBy: number;
  notes?: string;
}

/**
 * Переход документа на новый этап
 */
export async function transitionDocumentStage(input: StageTransitionInput) {
  const { documentId, newStage, performedBy, notes } = input;

  // Получить текущий этап документа
  const document = await prisma.document.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    throw new Error('Документ не найден');
  }

  const currentStage = document.stage;

  // Закрыть предыдущий этап
  if (currentStage) {
    const lastHistory = await prisma.documentStageHistory.findFirst({
      where: {
        documentId,
        stage: currentStage,
        exitedAt: null
      },
      orderBy: { enteredAt: 'desc' }
    });

    if (lastHistory) {
      const duration = Math.floor(
        (new Date().getTime() - lastHistory.enteredAt.getTime()) / 60000
      );

      await prisma.documentStageHistory.update({
        where: { id: lastHistory.id },
        data: {
          exitedAt: new Date(),
          duration
        }
      });

      // Проверка превышения времени
      const timeLimit = STAGE_TIME_LIMITS[currentStage];
      if (timeLimit > 0 && duration > timeLimit) {
        // Создать нарушение за превышение времени
        await createStageViolation({
          documentId,
          stage: currentStage,
          performedBy: lastHistory.performedBy || performedBy,
          expectedMinutes: timeLimit,
          actualMinutes: duration
        });
      }
    }
  }

  // Создать новую запись этапа
  await prisma.documentStageHistory.create({
    data: {
      documentId,
      stage: newStage,
      performedBy,
      notes,
      enteredAt: new Date()
    }
  });

  // Обновить этап документа
  await prisma.document.update({
    where: { id: documentId },
    data: { stage: newStage }
  });

  return {
    success: true,
    previousStage: currentStage,
    newStage
  };
}

/**
 * Создать нарушение за превышение времени на этапе
 */
async function createStageViolation(data: {
  documentId: number;
  stage: DocumentStage;
  performedBy: number;
  expectedMinutes: number;
  actualMinutes: number;
}) {
  const { documentId, stage, performedBy, expectedMinutes, actualMinutes } = data;
  const overdue = actualMinutes - expectedMinutes;

  await prisma.violation.create({
    data: {
      userId: performedBy,
      correspondenceId: documentId,
      date: new Date(),
      type: 'Bosqich muddatini buzish',
      reason: `Hujjat ${stage} bosqichida ${expectedMinutes} daqiqa o'rniga ${actualMinutes} daqiqa sarflandi. Kechikish: ${overdue} daqiqa`
    }
  });
}

/**
 * Получить историю этапов документа
 */
export async function getDocumentStageHistory(documentId: number) {
  const history = await prisma.documentStageHistory.findMany({
    where: { documentId },
    orderBy: { enteredAt: 'asc' }
  });

  return history.map(h => ({
    ...h,
    timeLimit: STAGE_TIME_LIMITS[h.stage],
    isOverdue: h.duration ? h.duration > STAGE_TIME_LIMITS[h.stage] : false
  }));
}

/**
 * Получить документы, застрявшие на этапе
 */
export async function getStuckDocuments(stage: DocumentStage) {
  const timeLimit = STAGE_TIME_LIMITS[stage];
  if (timeLimit === 0) return [];

  const cutoffTime = new Date(Date.now() - timeLimit * 60000);

  const stuckHistories = await prisma.documentStageHistory.findMany({
    where: {
      stage,
      exitedAt: null,
      enteredAt: {
        lt: cutoffTime
      }
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

  return stuckHistories.map(h => ({
    documentId: h.documentId,
    document: h.document,
    stage: h.stage,
    enteredAt: h.enteredAt,
    minutesStuck: Math.floor((Date.now() - h.enteredAt.getTime()) / 60000),
    timeLimit,
    performedBy: h.performedBy
  }));
}

/**
 * Статистика по этапам
 */
export async function getStageStatistics(startDate?: Date, endDate?: Date) {
  const where: any = {};
  
  if (startDate || endDate) {
    where.enteredAt = {};
    if (startDate) where.enteredAt.gte = startDate;
    if (endDate) where.enteredAt.lte = endDate;
  }

  const histories = await prisma.documentStageHistory.findMany({
    where,
    include: {
      document: true
    }
  });

  const stats: Record<string, any> = {};

  for (const stage of Object.keys(STAGE_TIME_LIMITS)) {
    const stageHistories = histories.filter(h => h.stage === stage);
    const completed = stageHistories.filter(h => h.exitedAt !== null);
    const durations = completed
      .map(h => h.duration)
      .filter((d): d is number => d !== null);

    const timeLimit = STAGE_TIME_LIMITS[stage as DocumentStage];
    const overdue = completed.filter(h => 
      h.duration && timeLimit > 0 && h.duration > timeLimit
    );

    stats[stage] = {
      total: stageHistories.length,
      completed: completed.length,
      inProgress: stageHistories.length - completed.length,
      averageDuration: durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0,
      timeLimit,
      overdueCount: overdue.length,
      overduePercentage: completed.length > 0
        ? Math.round((overdue.length / completed.length) * 100)
        : 0
    };
  }

  return stats;
}

/**
 * Получить документы для мониторинга (близкие к превышению)
 */
export async function getDocumentsNearingDeadline(stage: DocumentStage, warningThreshold = 0.8) {
  const timeLimit = STAGE_TIME_LIMITS[stage];
  if (timeLimit === 0) return [];

  const warningTime = timeLimit * warningThreshold;
  const cutoffTime = new Date(Date.now() - warningTime * 60000);

  const nearingHistories = await prisma.documentStageHistory.findMany({
    where: {
      stage,
      exitedAt: null,
      enteredAt: {
        lt: cutoffTime
      }
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

  return nearingHistories.map(h => ({
    documentId: h.documentId,
    document: h.document,
    stage: h.stage,
    enteredAt: h.enteredAt,
    minutesElapsed: Math.floor((Date.now() - h.enteredAt.getTime()) / 60000),
    timeLimit,
    minutesRemaining: timeLimit - Math.floor((Date.now() - h.enteredAt.getTime()) / 60000),
    performedBy: h.performedBy
  }));
}

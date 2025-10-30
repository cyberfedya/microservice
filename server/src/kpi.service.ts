import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Расчет KPI для пользователя за период
 */
export async function calculateUserKPI(userId: number, period: Date) {
  const periodStart = new Date(period.getFullYear(), period.getMonth(), 1);
  const periodEnd = new Date(period.getFullYear(), period.getMonth() + 1, 0, 23, 59, 59);

  // Получаем документы пользователя за период
  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { mainExecutorId: userId },
        { internalAssigneeId: userId }
      ],
      createdAt: {
        gte: periodStart,
        lte: periodEnd
      }
    },
    include: {
      violations: true
    }
  });

  const documentsCompleted = documents.filter(d => d.status === 'BAJARILGAN').length;
  const documentsOnTime = documents.filter(d => {
    if (d.status !== 'BAJARILGAN' || !d.deadline) return false;
    return new Date(d.updatedAt) <= new Date(d.deadline);
  }).length;
  const documentsLate = documentsCompleted - documentsOnTime;

  // Получаем посещенные заседания
  const meetingsAttended = await prisma.meetingAttendee.count({
    where: {
      userId,
      attended: true,
      meeting: {
        scheduledDate: {
          gte: periodStart,
          lte: periodEnd
        }
      }
    }
  });

  // Получаем проведенные приемы
  const receptionsConducted = await prisma.receptionSchedule.count({
    where: {
      receiverId: userId,
      date: {
        gte: periodStart,
        lte: periodEnd
      }
    }
  });

  // Расчет баллов
  let score = 0;
  score += documentsOnTime * 5; // 5 баллов за каждый документ вовремя
  score -= documentsLate * 3; // -3 балла за каждый просроченный
  score += meetingsAttended * 2; // 2 балла за каждое заседание
  score += receptionsConducted * 3; // 3 балла за каждый прием

  // Ограничиваем баллы от 0 до 100
  score = Math.max(0, Math.min(100, score));

  // Расчет премии/штрафа
  let bonus = 0;
  let penalty = 0;

  if (score >= 90) {
    bonus = 500000; // 500k сум за отличную работу
  } else if (score >= 75) {
    bonus = 300000; // 300k сум за хорошую работу
  } else if (score >= 60) {
    bonus = 100000; // 100k сум за удовлетворительную работу
  }

  if (documentsLate > 5) {
    penalty = documentsLate * 50000; // 50k сум за каждый просроченный документ
  }

  // Сохраняем или обновляем KPI
  const kpi = await prisma.kPIMetric.upsert({
    where: {
      userId_period: {
        userId,
        period: periodStart
      }
    },
    update: {
      documentsCompleted,
      documentsOnTime,
      documentsLate,
      meetingsAttended,
      receptionsConducted,
      score,
      bonus,
      penalty
    },
    create: {
      userId,
      period: periodStart,
      documentsCompleted,
      documentsOnTime,
      documentsLate,
      meetingsAttended,
      receptionsConducted,
      score,
      bonus,
      penalty
    }
  });

  return kpi;
}

/**
 * Получение KPI пользователя
 */
export async function getUserKPI(userId: number, period?: Date) {
  const targetPeriod = period || new Date();
  const periodStart = new Date(targetPeriod.getFullYear(), targetPeriod.getMonth(), 1);

  let kpi = await prisma.kPIMetric.findUnique({
    where: {
      userId_period: {
        userId,
        period: periodStart
      }
    }
  });

  // Если KPI не найден, рассчитываем его
  if (!kpi) {
    kpi = await calculateUserKPI(userId, targetPeriod);
  }

  return kpi;
}

/**
 * Получение истории KPI пользователя
 */
export async function getUserKPIHistory(userId: number, months: number = 6) {
  const history = await prisma.kPIMetric.findMany({
    where: {
      userId
    },
    orderBy: {
      period: 'desc'
    },
    take: months
  });

  return history;
}

/**
 * Получение статистики по документам пользователя
 */
export async function getUserDocumentStats(userId: number) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { mainExecutorId: userId },
        { internalAssigneeId: userId }
      ],
      createdAt: {
        gte: monthStart
      }
    }
  });

  const completed = documents.filter(d => d.status === 'BAJARILGAN').length;
  const onTime = documents.filter(d => {
    if (d.status !== 'BAJARILGAN' || !d.deadline) return false;
    return new Date(d.updatedAt) <= new Date(d.deadline);
  }).length;
  const late = completed - onTime;

  // Получаем нарушения
  const violations = await prisma.violation.count({
    where: {
      userId
    }
  });

  return {
    total: documents.length,
    completed,
    onTime,
    late,
    violations
  };
}

/**
 * Пересчет KPI для всех пользователей
 */
export async function recalculateAllKPI(period?: Date) {
  const users = await prisma.user.findMany({
    select: { id: true }
  });

  const results = [];
  for (const user of users) {
    const kpi = await calculateUserKPI(user.id, period || new Date());
    results.push(kpi);
  }

  return results;
}

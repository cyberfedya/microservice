import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Дисциплинарная система (5 уровней наказаний)
 * Регламент, Раздел III, пункт 12
 */

// 5 уровней наказаний
export enum DisciplinaryLevel {
  OGOHLANTIRISH = 'OGOHLANTIRISH',      // 1. Предупреждение
  HAYFSAN = 'HAYFSAN',                   // 2. Выговор
  JARIMA_30 = 'JARIMA_30',               // 3. Штраф 30% от зарплаты
  JARIMA_50 = 'JARIMA_50',               // 4. Штраф 50% от зарплаты
  ISHDAN_BO_SHATISH = 'ISHDAN_BO_SHATISH' // 5. Увольнение
}

interface DisciplinaryAction {
  userId: number;
  violationType: string;
  reason: string;
  documentId?: number;
  performedBy: number;
}

/**
 * Получить количество нарушений пользователя за последние 12 месяцев
 */
async function getUserViolationCount(userId: number): Promise<number> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const count = await prisma.violation.count({
    where: {
      userId,
      date: {
        gte: oneYearAgo
      }
    }
  });

  return count;
}

/**
 * Определить уровень наказания на основе количества нарушений
 */
function determineDisciplinaryLevel(violationCount: number): DisciplinaryLevel {
  if (violationCount === 0) return DisciplinaryLevel.OGOHLANTIRISH;
  if (violationCount === 1) return DisciplinaryLevel.HAYFSAN;
  if (violationCount === 2) return DisciplinaryLevel.JARIMA_30;
  if (violationCount === 3) return DisciplinaryLevel.JARIMA_50;
  return DisciplinaryLevel.ISHDAN_BO_SHATISH;
}

/**
 * Применить дисциплинарное взыскание
 */
export async function applyDisciplinaryAction(action: DisciplinaryAction) {
  const { userId, violationType, reason, documentId, performedBy } = action;

  // Получить количество предыдущих нарушений
  const violationCount = await getUserViolationCount(userId);
  
  // Определить уровень наказания
  const level = determineDisciplinaryLevel(violationCount);

  // Создать запись о нарушении
  const violation = await prisma.violation.create({
    data: {
      userId,
      type: `${level} - ${violationType}`,
      reason,
      correspondenceId: documentId,
      date: new Date()
    }
  });

  // Получить информацию о пользователе
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, department: true }
  });

  if (!user) {
    throw new Error('Foydalanuvchi topilmadi');
  }

  // Создать уведомление пользователю
  await prisma.notification.create({
    data: {
      userId,
      message: `Sizga intizomiy jazo qo'llanildi: ${level}. Sabab: ${reason}`,
      link: documentId ? `/documents/${documentId}` : undefined
    }
  });

  // Создать уведомление руководителю
  if (user.managerId) {
    await prisma.notification.create({
      data: {
        userId: user.managerId,
        message: `${user.name} xodimiga intizomiy jazo qo'llanildi: ${level}`,
        link: `/violations`
      }
    });
  }

  // Обновить KPI пользователя (если есть)
  const currentPeriod = new Date();
  currentPeriod.setDate(1); // Первый день месяца

  const kpi = await prisma.kPIMetric.findFirst({
    where: {
      userId,
      period: currentPeriod
    }
  });

  if (kpi) {
    let penalty = 0;
    
    // Рассчитать штраф в зависимости от уровня
    switch (level) {
      case DisciplinaryLevel.OGOHLANTIRISH:
        penalty = 0;
        break;
      case DisciplinaryLevel.HAYFSAN:
        penalty = 5; // 5% от премии
        break;
      case DisciplinaryLevel.JARIMA_30:
        penalty = 30;
        break;
      case DisciplinaryLevel.JARIMA_50:
        penalty = 50;
        break;
      case DisciplinaryLevel.ISHDAN_BO_SHATISH:
        penalty = 100; // Полное лишение премии
        break;
    }

    await prisma.kPIMetric.update({
      where: { id: kpi.id },
      data: {
        penalty: kpi.penalty + penalty,
        score: Math.max(0, kpi.score - penalty)
      }
    });
  }

  return {
    violation,
    level,
    violationCount: violationCount + 1,
    message: getDisciplinaryMessage(level)
  };
}

/**
 * Получить сообщение для уровня наказания
 */
function getDisciplinaryMessage(level: DisciplinaryLevel): string {
  const messages: Record<DisciplinaryLevel, string> = {
    [DisciplinaryLevel.OGOHLANTIRISH]: 'Birinchi marta - ogohlantirish',
    [DisciplinaryLevel.HAYFSAN]: 'Ikkinchi marta - hayfsan',
    [DisciplinaryLevel.JARIMA_30]: "Uchinchi marta - o'rtacha oylik ish haqining 30% miqdorda jarima",
    [DisciplinaryLevel.JARIMA_50]: "To'rtinchi marta - o'rtacha oylik ish haqining 50% miqdorda jarima",
    [DisciplinaryLevel.ISHDAN_BO_SHATISH]: "Beshinchi marta - mehnat shartnomasini bekor qilish"
  };

  return messages[level];
}

/**
 * Получить статистику по дисциплинарным взысканиям
 */
export async function getDisciplinaryStatistics(startDate?: Date, endDate?: Date) {
  const where: any = {};
  
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const violations = await prisma.violation.findMany({
    where,
    include: {
      user: {
        include: {
          role: true,
          department: true
        }
      }
    }
  });

  // Группировка по уровням
  const byLevel: Record<string, number> = {
    [DisciplinaryLevel.OGOHLANTIRISH]: 0,
    [DisciplinaryLevel.HAYFSAN]: 0,
    [DisciplinaryLevel.JARIMA_30]: 0,
    [DisciplinaryLevel.JARIMA_50]: 0,
    [DisciplinaryLevel.ISHDAN_BO_SHATISH]: 0
  };

  violations.forEach(v => {
    Object.keys(byLevel).forEach(level => {
      if (v.type.includes(level)) {
        byLevel[level]++;
      }
    });
  });

  // Группировка по департаментам
  const byDepartment: Record<string, number> = {};
  violations.forEach(v => {
    const deptName = v.user.department.name;
    byDepartment[deptName] = (byDepartment[deptName] || 0) + 1;
  });

  // Топ нарушителей
  const userViolationCounts: Record<number, { user: any; count: number }> = {};
  violations.forEach(v => {
    if (!userViolationCounts[v.userId]) {
      userViolationCounts[v.userId] = { user: v.user, count: 0 };
    }
    userViolationCounts[v.userId].count++;
  });

  const topViolators = Object.values(userViolationCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    total: violations.length,
    byLevel,
    byDepartment,
    topViolators
  };
}

/**
 * Получить историю дисциплинарных взысканий пользователя
 */
export async function getUserDisciplinaryHistory(userId: number) {
  const violations = await prisma.violation.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    include: {
      correspondence: true
    }
  });

  return violations.map((v, index) => ({
    ...v,
    violationNumber: violations.length - index,
    level: determineDisciplinaryLevel(violations.length - index - 1)
  }));
}

/**
 * Сбросить дисциплинарные взыскания (например, по истечении года)
 */
export async function resetDisciplinaryRecord(userId: number, performedBy: number) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Удалить старые нарушения (старше 1 года)
  await prisma.violation.deleteMany({
    where: {
      userId,
      date: {
        lt: oneYearAgo
      }
    }
  });

  // Создать уведомление
  await prisma.notification.create({
    data: {
      userId,
      message: 'Sizning intizomiy jazolaringiz tarixi tozalandi (1 yildan eski)',
      link: '/profile'
    }
  });

  return {
    success: true,
    message: 'Intizomiy jazolar tarixi tozalandi'
  };
}

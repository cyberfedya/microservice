import { prisma } from "./prisma";

/**
 * Сервис для контроля исполнительской дисциплины согласно регламенту
 * Реализует пункты 11-16 регламента
 */

// Типы нарушений согласно п.12 регламента
export enum ViolationType {
  WARNING = "Ogohlantirish",           // 1-е нарушение
  REPRIMAND = "Hayfsan",               // 2-е нарушение
  FINE_30 = "30% jarima",              // 3-е нарушение
  FINE_50 = "50% jarima",              // 4-е нарушение
  TERMINATION = "Mehnat shartnomasini bekor qilish" // 5-е нарушение
}

/**
 * Проверка просроченных документов и автоматическое создание нарушений
 * Запускается по расписанию (cron job)
 */
export async function checkOverdueDocuments() {
  const now = new Date();
  
  // Находим все документы с истекшим сроком, которые не завершены
  const overdueDocuments = await prisma.document.findMany({
    where: {
      deadline: {
        lt: now
      },
      stage: {
        notIn: ['COMPLETED', 'CANCELLED', 'ARCHIVED']
      },
      mainExecutorId: {
        not: null
      }
    },
    include: {
      mainExecutor: true,
      coExecutors: {
        include: {
          user: true
        }
      },
      contributors: {
        include: {
          user: true
        }
      }
    }
  });

  const results = [];

  for (const doc of overdueDocuments) {
    // Проверяем нарушение для основного исполнителя
    if (doc.mainExecutorId) {
      const violation = await createViolationForUser(
        doc.mainExecutorId,
        doc.id,
        `Hujjat muddatida bajarilmadi: "${doc.title}"`
      );
      results.push(violation);
    }

    // Проверяем нарушения для соисполнителей
    for (const coExec of doc.coExecutors) {
      const violation = await createViolationForUser(
        coExec.userId,
        doc.id,
        `Qo'shimcha ijrochi sifatida hujjat muddatida bajarilmadi: "${doc.title}"`
      );
      results.push(violation);
    }
  }

  return results;
}

/**
 * Создание нарушения для пользователя с автоматическим определением типа наказания
 * Согласно п.12 регламента
 */
export async function createViolationForUser(
  userId: number,
  documentId: number,
  reason: string
) {
  // Подсчитываем количество предыдущих нарушений пользователя
  const previousViolationsCount = await prisma.violation.count({
    where: {
      userId: userId
    }
  });

  // Определяем тип наказания согласно регламенту
  let violationType: string;
  switch (previousViolationsCount) {
    case 0:
      violationType = ViolationType.WARNING;
      break;
    case 1:
      violationType = ViolationType.REPRIMAND;
      break;
    case 2:
      violationType = ViolationType.FINE_30;
      break;
    case 3:
      violationType = ViolationType.FINE_50;
      break;
    default:
      violationType = ViolationType.TERMINATION;
      break;
  }

  // Создаем нарушение
  const violation = await prisma.violation.create({
    data: {
      userId: userId,
      correspondenceId: documentId,
      date: new Date(),
      reason: reason,
      type: violationType
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: {
            select: {
              name: true
            }
          }
        }
      },
      correspondence: {
        select: {
          id: true,
          title: true,
          deadline: true
        }
      }
    }
  });

  // Создаем уведомление для пользователя
  await prisma.notification.create({
    data: {
      userId: userId,
      message: `Sizga intizomiy jazo qo'llanildi: ${violationType}. Sabab: ${reason}`,
      link: `/correspondence/${documentId}`
    }
  });

  // Уведомляем руководителя пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { managerId: true }
  });

  if (user?.managerId) {
    await prisma.notification.create({
      data: {
        userId: user.managerId,
        message: `Sizning xodimingizga intizomiy jazo qo'llanildi: ${violationType}`,
        link: `/violations/${violation.id}`
      }
    });
  }

  return violation;
}

/**
 * Получение статистики нарушений по пользователю
 */
export async function getUserViolationStats(userId: number) {
  const violations = await prisma.violation.findMany({
    where: {
      userId: userId
    },
    orderBy: {
      date: 'desc'
    },
    include: {
      correspondence: {
        select: {
          id: true,
          title: true,
          deadline: true
        }
      }
    }
  });

  const stats = {
    total: violations.length,
    byType: {
      warning: violations.filter(v => v.type === ViolationType.WARNING).length,
      reprimand: violations.filter(v => v.type === ViolationType.REPRIMAND).length,
      fine30: violations.filter(v => v.type === ViolationType.FINE_30).length,
      fine50: violations.filter(v => v.type === ViolationType.FINE_50).length,
      termination: violations.filter(v => v.type === ViolationType.TERMINATION).length
    },
    recent: violations.slice(0, 5)
  };

  return stats;
}

/**
 * Получение статистики нарушений по отделу
 */
export async function getDepartmentViolationStats(departmentId: number) {
  const users = await prisma.user.findMany({
    where: {
      departmentId: departmentId
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  const userIds = users.map(u => u.id);

  const violations = await prisma.violation.findMany({
    where: {
      userId: {
        in: userIds
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      correspondence: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  const stats = {
    totalViolations: violations.length,
    userCount: users.length,
    byUser: users.map(user => ({
      user: user,
      violationCount: violations.filter(v => v.userId === user.id).length
    })),
    recentViolations: violations.slice(0, 10)
  };

  return stats;
}

/**
 * Мониторинг документов близких к дедлайну
 * Согласно п.14 регламента - уведомление за 1 день до срока
 */
export async function checkUpcomingDeadlines() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Находим документы со сроком завтра
  const upcomingDocuments = await prisma.document.findMany({
    where: {
      deadline: {
        gte: today,
        lte: tomorrow
      },
      stage: {
        notIn: ['COMPLETED', 'CANCELLED', 'ARCHIVED']
      }
    },
    include: {
      mainExecutor: true,
      coExecutors: {
        include: {
          user: true
        }
      },
      contributors: {
        include: {
          user: true
        }
      }
    }
  });

  const notifications = [];

  for (const doc of upcomingDocuments) {
    // Уведомляем основного исполнителя
    if (doc.mainExecutorId) {
      const notification = await prisma.notification.create({
        data: {
          userId: doc.mainExecutorId,
          message: `Hujjat ijro muddati tugaydi: "${doc.title}". Muddat: ${doc.deadline?.toLocaleDateString()}`,
          link: `/correspondence/${doc.id}`
        }
      });
      notifications.push(notification);
    }

    // Уведомляем соисполнителей
    for (const coExec of doc.coExecutors) {
      const notification = await prisma.notification.create({
        data: {
          userId: coExec.userId,
          message: `Hujjat ijro muddati tugaydi: "${doc.title}". Muddat: ${doc.deadline?.toLocaleDateString()}`,
          link: `/correspondence/${doc.id}`
        }
      });
      notifications.push(notification);
    }
  }

  return notifications;
}

/**
 * Получение отчета по исполнительской дисциплине
 * Для Bank apparati и руководства
 */
export async function getDisciplineReport(filters?: {
  startDate?: Date;
  endDate?: Date;
  departmentId?: number;
  userId?: number;
}) {
  const whereClause: any = {};

  if (filters?.startDate || filters?.endDate) {
    whereClause.date = {};
    if (filters.startDate) whereClause.date.gte = filters.startDate;
    if (filters.endDate) whereClause.date.lte = filters.endDate;
  }

  if (filters?.userId) {
    whereClause.userId = filters.userId;
  } else if (filters?.departmentId) {
    whereClause.user = {
      departmentId: filters.departmentId
    };
  }

  const violations = await prisma.violation.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: {
            select: {
              name: true
            }
          }
        }
      },
      correspondence: {
        select: {
          id: true,
          title: true,
          deadline: true,
          kartoteka: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  // Группируем по типам нарушений
  const byType = {
    [ViolationType.WARNING]: violations.filter(v => v.type === ViolationType.WARNING),
    [ViolationType.REPRIMAND]: violations.filter(v => v.type === ViolationType.REPRIMAND),
    [ViolationType.FINE_30]: violations.filter(v => v.type === ViolationType.FINE_30),
    [ViolationType.FINE_50]: violations.filter(v => v.type === ViolationType.FINE_50),
    [ViolationType.TERMINATION]: violations.filter(v => v.type === ViolationType.TERMINATION)
  };

  // Группируем по отделам
  const byDepartment: { [key: string]: any[] } = {};
  violations.forEach(v => {
    const deptName = v.user.department?.name || 'Noma\'lum';
    if (!byDepartment[deptName]) {
      byDepartment[deptName] = [];
    }
    byDepartment[deptName].push(v);
  });

  return {
    total: violations.length,
    byType: {
      [ViolationType.WARNING]: byType[ViolationType.WARNING].length,
      [ViolationType.REPRIMAND]: byType[ViolationType.REPRIMAND].length,
      [ViolationType.FINE_30]: byType[ViolationType.FINE_30].length,
      [ViolationType.FINE_50]: byType[ViolationType.FINE_50].length,
      [ViolationType.TERMINATION]: byType[ViolationType.TERMINATION].length
    },
    byDepartment: Object.keys(byDepartment).map(deptName => ({
      department: deptName,
      count: byDepartment[deptName].length
    })),
    violations: violations
  };
}

/**
 * Получение статистики по документам для мониторинга
 */
export async function getDocumentMonitoringStats() {
  const now = new Date();

  // Общее количество активных документов
  const activeDocuments = await prisma.document.count({
    where: {
      stage: {
        notIn: ['COMPLETED', 'CANCELLED', 'ARCHIVED']
      }
    }
  });

  // Просроченные документы
  const overdueDocuments = await prisma.document.count({
    where: {
      deadline: {
        lt: now
      },
      stage: {
        notIn: ['COMPLETED', 'CANCELLED', 'ARCHIVED']
      }
    }
  });

  // Документы со сроком в ближайшие 3 дня
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const upcomingDocuments = await prisma.document.count({
    where: {
      deadline: {
        gte: now,
        lte: threeDaysFromNow
      },
      stage: {
        notIn: ['COMPLETED', 'CANCELLED', 'ARCHIVED']
      }
    }
  });

  // Документы по этапам
  const byStage = await prisma.document.groupBy({
    by: ['stage'],
    _count: true,
    where: {
      stage: {
        notIn: ['COMPLETED', 'CANCELLED', 'ARCHIVED']
      }
    }
  });

  // Документы по картотекам
  const byKartoteka = await prisma.document.groupBy({
    by: ['kartoteka'],
    _count: true,
    where: {
      stage: {
        notIn: ['COMPLETED', 'CANCELLED', 'ARCHIVED']
      }
    }
  });

  return {
    activeDocuments,
    overdueDocuments,
    upcomingDocuments,
    byStage: byStage.map(s => ({
      stage: s.stage,
      count: s._count
    })),
    byKartoteka: byKartoteka.map(k => ({
      kartoteka: k.kartoteka || 'Noma\'lum',
      count: k._count
    }))
  };
}

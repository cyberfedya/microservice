import { PrismaClient, ReportType, ReportStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Сервис системы отчетности
 * Регламент, Раздел V, пункт 49
 * Oylik, choraklik, yillik hisobotlar
 */

// ============================================
// ОБЩИЕ ОТЧЕТЫ
// ============================================

export async function createReport(data: {
  title: string;
  reportType: ReportType;
  year: number;
  quarter?: number;
  month?: number;
  departmentId?: number;
  content: string;
  createdBy: number;
}) {
  return await prisma.report.create({
    data,
    include: {
      createdByUser: {
        include: {
          role: true,
          department: true
        }
      },
      department: true
    }
  });
}

export async function addReportMetric(data: {
  reportId: number;
  metricName: string;
  metricValue: number;
  targetValue?: number;
  unit?: string;
  description?: string;
}) {
  return await prisma.reportMetric.create({
    data
  });
}

export async function submitReport(reportId: number) {
  return await prisma.report.update({
    where: { id: reportId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date()
    }
  });
}

export async function approveReport(data: {
  reportId: number;
  approvedBy: number;
}) {
  return await prisma.report.update({
    where: { id: data.reportId },
    data: {
      status: 'APPROVED',
      approvedBy: data.approvedBy,
      approvedAt: new Date()
    },
    include: {
      createdByUser: true,
      approvedByUser: true
    }
  });
}

export async function rejectReport(data: {
  reportId: number;
  approvedBy: number;
  rejectionReason: string;
}) {
  return await prisma.report.update({
    where: { id: data.reportId },
    data: {
      status: 'REJECTED',
      approvedBy: data.approvedBy,
      approvedAt: new Date(),
      rejectionReason: data.rejectionReason
    }
  });
}

export async function getReports(filters?: {
  reportType?: ReportType;
  year?: number;
  quarter?: number;
  month?: number;
  departmentId?: number;
  status?: ReportStatus;
  createdBy?: number;
}) {
  const where: any = {};
  if (filters?.reportType) where.reportType = filters.reportType;
  if (filters?.year) where.year = filters.year;
  if (filters?.quarter) where.quarter = filters.quarter;
  if (filters?.month) where.month = filters.month;
  if (filters?.departmentId) where.departmentId = filters.departmentId;
  if (filters?.status) where.status = filters.status;
  if (filters?.createdBy) where.createdBy = filters.createdBy;

  return await prisma.report.findMany({
    where,
    include: {
      createdByUser: {
        include: {
          role: true,
          department: true
        }
      },
      approvedByUser: true,
      department: true,
      metrics: true
    },
    orderBy: [
      { year: 'desc' },
      { quarter: 'desc' },
      { month: 'desc' }
    ]
  });
}

// ============================================
// ОТЧЕТ ПО ИСПОЛНИТЕЛЬСКОЙ ДИСЦИПЛИНЕ
// ============================================

export async function generateDisciplineReport(data: {
  reportType: ReportType;
  year: number;
  quarter?: number;
  month?: number;
  departmentId?: number;
  createdBy: number;
}) {
  // Определить период
  const startDate = new Date(data.year, 0, 1);
  const endDate = new Date(data.year + 1, 0, 1);

  if (data.reportType === 'CHORAKLIK' && data.quarter) {
    startDate.setMonth((data.quarter - 1) * 3);
    endDate.setMonth(data.quarter * 3);
  } else if (data.reportType === 'OYLIK' && data.month) {
    startDate.setMonth(data.month - 1);
    endDate.setMonth(data.month);
  }

  // Получить статистику по документам
  const where: any = {
    createdAt: {
      gte: startDate,
      lt: endDate
    }
  };

  if (data.departmentId) {
    where.author = {
      departmentId: data.departmentId
    };
  }

  const [
    totalDocuments,
    completedOnTime,
    completedLate,
    inProgress,
    overdue
  ] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.count({
      where: {
        ...where,
        stage: 'COMPLETED',
        violations: { none: {} }
      }
    }),
    prisma.document.count({
      where: {
        ...where,
        stage: 'COMPLETED',
        violations: { some: {} }
      }
    }),
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
        deadline: {
          lt: new Date()
        },
        stage: {
          notIn: ['COMPLETED', 'ARCHIVED', 'CANCELLED']
        }
      }
    })
  ]);

  // Получить статистику по нарушениям
  const violationsWhere: any = {
    date: {
      gte: startDate,
      lt: endDate
    }
  };

  if (data.departmentId) {
    violationsWhere.user = {
      departmentId: data.departmentId
    };
  }

  const [
    totalViolations,
    minorViolations,
    majorViolations
  ] = await Promise.all([
    prisma.violation.count({ where: violationsWhere }),
    prisma.violation.count({
      where: {
        ...violationsWhere,
        type: {
          in: ['Ogohlantirish', 'Hayfsan']
        }
      }
    }),
    prisma.violation.count({
      where: {
        ...violationsWhere,
        type: {
          in: ['Jarima 30%', 'Jarima 50%', 'Ishdan bo\'shatish']
        }
      }
    })
  ]);

  // Получить статистику по дисциплинарным мерам
  const [
    warnings,
    reprimands,
    fines30,
    fines50,
    dismissals
  ] = await Promise.all([
    prisma.violation.count({
      where: { ...violationsWhere, type: 'Ogohlantirish' }
    }),
    prisma.violation.count({
      where: { ...violationsWhere, type: 'Hayfsan' }
    }),
    prisma.violation.count({
      where: { ...violationsWhere, type: 'Jarima 30%' }
    }),
    prisma.violation.count({
      where: { ...violationsWhere, type: 'Jarima 50%' }
    }),
    prisma.violation.count({
      where: { ...violationsWhere, type: 'Ishdan bo\'shatish' }
    })
  ]);

  // Создать отчет
  return await prisma.disciplineReport.create({
    data: {
      reportType: data.reportType,
      year: data.year,
      quarter: data.quarter,
      month: data.month,
      departmentId: data.departmentId,
      totalDocuments,
      completedOnTime,
      completedLate,
      inProgress,
      overdue,
      totalViolations,
      minorViolations,
      majorViolations,
      warnings,
      reprimands,
      fines30,
      fines50,
      dismissals,
      createdBy: data.createdBy
    },
    include: {
      createdByUser: {
        include: {
          role: true,
          department: true
        }
      },
      department: true
    }
  });
}

export async function getDisciplineReports(filters?: {
  reportType?: ReportType;
  year?: number;
  quarter?: number;
  month?: number;
  departmentId?: number;
}) {
  const where: any = {};
  if (filters?.reportType) where.reportType = filters.reportType;
  if (filters?.year) where.year = filters.year;
  if (filters?.quarter) where.quarter = filters.quarter;
  if (filters?.month) where.month = filters.month;
  if (filters?.departmentId) where.departmentId = filters.departmentId;

  return await prisma.disciplineReport.findMany({
    where,
    include: {
      createdByUser: true,
      department: true
    },
    orderBy: [
      { year: 'desc' },
      { quarter: 'desc' },
      { month: 'desc' }
    ]
  });
}

// ============================================
// ОТЧЕТ ПО ДОКУМЕНТООБОРОТУ
// ============================================

export async function generateDocumentFlowReport(data: {
  reportType: ReportType;
  year: number;
  quarter?: number;
  month?: number;
  createdBy: number;
}) {
  // Определить период
  const startDate = new Date(data.year, 0, 1);
  const endDate = new Date(data.year + 1, 0, 1);

  if (data.reportType === 'CHORAKLIK' && data.quarter) {
    startDate.setMonth((data.quarter - 1) * 3);
    endDate.setMonth(data.quarter * 3);
  } else if (data.reportType === 'OYLIK' && data.month) {
    startDate.setMonth(data.month - 1);
    endDate.setMonth(data.month);
  }

  const where = {
    createdAt: {
      gte: startDate,
      lt: endDate
    }
  };

  // Входящие документы
  const incomingTotal = await prisma.document.count({
    where: {
      ...where,
      type: 'Kiruvchi'
    }
  });

  const incomingByType = await prisma.document.groupBy({
    by: ['kartoteka'],
    where: {
      ...where,
      type: 'Kiruvchi'
    },
    _count: true
  });

  // Исходящие документы
  const outgoingTotal = await prisma.document.count({
    where: {
      ...where,
      type: 'Chiquvchi'
    }
  });

  const outgoingByType = await prisma.document.groupBy({
    by: ['kartoteka'],
    where: {
      ...where,
      type: 'Chiquvchi'
    },
    _count: true
  });

  // По этапам
  const byStage = await prisma.document.groupBy({
    by: ['stage'],
    where,
    _count: true
  });

  // Средний срок обработки
  const completedDocs = await prisma.document.findMany({
    where: {
      ...where,
      stage: 'COMPLETED'
    },
    select: {
      createdAt: true,
      updatedAt: true
    }
  });

  const avgProcessTime = completedDocs.length > 0
    ? completedDocs.reduce((sum, doc) => {
        const diff = doc.updatedAt.getTime() - doc.createdAt.getTime();
        return sum + diff / (1000 * 60 * 60 * 24); // В днях
      }, 0) / completedDocs.length
    : null;

  // Создать отчет
  return await prisma.documentFlowReport.create({
    data: {
      reportType: data.reportType,
      year: data.year,
      quarter: data.quarter,
      month: data.month,
      incomingTotal,
      incomingByType: incomingByType.reduce((acc, item) => {
        acc[item.kartoteka || 'null'] = item._count;
        return acc;
      }, {} as Record<string, number>),
      outgoingTotal,
      outgoingByType: outgoingByType.reduce((acc, item) => {
        acc[item.kartoteka || 'null'] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStage: byStage.reduce((acc, item) => {
        acc[item.stage] = item._count;
        return acc;
      }, {} as Record<string, number>),
      avgProcessTime,
      createdBy: data.createdBy
    },
    include: {
      createdByUser: true
    }
  });
}

export async function getDocumentFlowReports(filters?: {
  reportType?: ReportType;
  year?: number;
  quarter?: number;
  month?: number;
}) {
  const where: any = {};
  if (filters?.reportType) where.reportType = filters.reportType;
  if (filters?.year) where.year = filters.year;
  if (filters?.quarter) where.quarter = filters.quarter;
  if (filters?.month) where.month = filters.month;

  return await prisma.documentFlowReport.findMany({
    where,
    include: {
      createdByUser: true
    },
    orderBy: [
      { year: 'desc' },
      { quarter: 'desc' },
      { month: 'desc' }
    ]
  });
}

// ============================================
// СТАТИСТИКА
// ============================================

export async function getReportingStatistics() {
  const currentYear = new Date().getFullYear();

  const [
    totalReports,
    draftReports,
    submittedReports,
    approvedReports,
    rejectedReports,
    disciplineReportsCount,
    docFlowReportsCount
  ] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { status: 'DRAFT' } }),
    prisma.report.count({ where: { status: 'SUBMITTED' } }),
    prisma.report.count({ where: { status: 'APPROVED' } }),
    prisma.report.count({ where: { status: 'REJECTED' } }),
    prisma.disciplineReport.count({ where: { year: currentYear } }),
    prisma.documentFlowReport.count({ where: { year: currentYear } })
  ]);

  // Отчеты по типам
  const byType = await prisma.report.groupBy({
    by: ['reportType'],
    _count: true
  });

  return {
    totalReports,
    draftReports,
    submittedReports,
    approvedReports,
    rejectedReports,
    disciplineReportsCount,
    docFlowReportsCount,
    byType: byType.reduce((acc, item) => {
      acc[item.reportType] = item._count;
      return acc;
    }, {} as Record<string, number>)
  };
}

/**
 * Получить общую статистику для страницы отчетов
 */
export async function getGeneralStats(startDate: Date, endDate: Date) {
  // Документы
  const [totalDocuments, completedDocuments, overdueDocuments] = await Promise.all([
    prisma.document.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    prisma.document.count({
      where: {
        status: 'BAJARILGAN',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    prisma.document.count({
      where: {
        status: 'MUDDATI_OTGAN',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })
  ]);

  // Заседания
  const totalMeetings = await prisma.meeting.count({
    where: {
      scheduledDate: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Приемы
  const totalReceptions = await prisma.receptionSchedule.count({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Средний срок выполнения (в днях)
  const completedDocs = await prisma.document.findMany({
    where: {
      status: 'BAJARILGAN',
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      createdAt: true,
      updatedAt: true
    }
  });

  let avgCompletionTime = 0;
  if (completedDocs.length > 0) {
    const totalDays = completedDocs.reduce((sum, doc) => {
      const days = Math.ceil((new Date(doc.updatedAt).getTime() - new Date(doc.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    avgCompletionTime = Math.round(totalDays / completedDocs.length);
  }

  return {
    totalDocuments,
    completedDocuments,
    overdueDocuments,
    totalMeetings,
    totalReceptions,
    avgCompletionTime
  };
}

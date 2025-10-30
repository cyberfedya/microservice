import { PrismaClient, CollegialBodyType, CollegialMeetingStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Сервис для работы с коллегиальными органами
 * Регламент, Раздел V, пункты 43-49
 */

// Создать коллегиальный орган
export async function createCollegialBody(data: {
  type: CollegialBodyType;
  name: string;
  description?: string;
  chairmanId?: number;
  secretaryId?: number;
}) {
  return await prisma.collegialBody.create({
    data,
    include: {
      chairman: true,
      secretary: true
    }
  });
}

// Получить все коллегиальные органы
export async function getAllCollegialBodies() {
  return await prisma.collegialBody.findMany({
    where: { isActive: true },
    include: {
      chairman: true,
      secretary: true,
      members: {
        include: {
          user: {
            include: {
              role: true,
              department: true
            }
          }
        },
        where: { leftAt: null }
      },
      _count: {
        select: {
          meetings: true,
          workPlans: true
        }
      }
    }
  });
}

// Получить коллегиальный орган по типу
export async function getCollegialBodyByType(type: CollegialBodyType) {
  return await prisma.collegialBody.findUnique({
    where: { type },
    include: {
      chairman: true,
      secretary: true,
      members: {
        include: {
          user: {
            include: {
              role: true,
              department: true
            }
          }
        },
        where: { leftAt: null }
      }
    }
  });
}

// Добавить члена в коллегиальный орган
export async function addCollegialMember(data: {
  bodyId: number;
  userId: number;
  role?: string;
  isVotingMember?: boolean;
}) {
  return await prisma.collegialMember.create({
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

// Удалить члена из коллегиального органа
export async function removeCollegialMember(bodyId: number, userId: number) {
  return await prisma.collegialMember.updateMany({
    where: {
      bodyId,
      userId,
      leftAt: null
    },
    data: {
      leftAt: new Date()
    }
  });
}

// Создать заседание коллегиального органа
export async function createCollegialMeeting(data: {
  bodyId: number;
  title: string;
  scheduledDate: Date;
  location?: string;
  isOnline?: boolean;
  quorumRequired?: number;
  createdById: number;
  agenda?: Array<{
    orderNumber: number;
    topic: string;
    description?: string;
    presenterId?: number;
    duration?: number;
    documentId?: number;
  }>;
}) {
  const { agenda, ...meetingData } = data;

  const meeting = await prisma.collegialMeeting.create({
    data: {
      ...meetingData,
      agenda: agenda ? {
        create: agenda
      } : undefined
    },
    include: {
      body: true,
      agenda: {
        include: {
          presenter: true
        },
        orderBy: { orderNumber: 'asc' }
      }
    }
  });

  // Автоматически добавить всех членов органа как участников
  const members = await prisma.collegialMember.findMany({
    where: {
      bodyId: data.bodyId,
      leftAt: null
    }
  });

  await prisma.collegialAttendee.createMany({
    data: members.map(m => ({
      meetingId: meeting.id,
      userId: m.userId
    }))
  });

  return meeting;
}

// Получить заседания коллегиального органа
export async function getCollegialMeetings(bodyId: number, filters?: {
  status?: CollegialMeetingStatus;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = { bodyId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    where.scheduledDate = {};
    if (filters.startDate) where.scheduledDate.gte = filters.startDate;
    if (filters.endDate) where.scheduledDate.lte = filters.endDate;
  }

  return await prisma.collegialMeeting.findMany({
    where,
    include: {
      body: true,
      createdBy: true,
      agenda: {
        include: {
          presenter: true
        },
        orderBy: { orderNumber: 'asc' }
      },
      decisions: true,
      attendees: {
        include: {
          user: {
            include: {
              role: true,
              department: true
            }
          }
        }
      },
      protocol: true
    },
    orderBy: { scheduledDate: 'desc' }
  });
}

// Отметить посещаемость
export async function markAttendance(meetingId: number, userId: number, attended: boolean) {
  return await prisma.collegialAttendee.updateMany({
    where: {
      meetingId,
      userId
    },
    data: {
      attended
    }
  });
}

// Проверить и обновить кворум
export async function checkAndUpdateQuorum(meetingId: number) {
  const meeting = await prisma.collegialMeeting.findUnique({
    where: { id: meetingId },
    include: {
      attendees: true
    }
  });

  if (!meeting) {
    throw new Error('Yig\'ilish topilmadi');
  }

  const totalMembers = meeting.attendees.length;
  const attendedMembers = meeting.attendees.filter(a => a.attended).length;
  const attendancePercentage = (attendedMembers / totalMembers) * 100;

  const quorumAchieved = attendancePercentage >= meeting.quorumRequired;

  await prisma.collegialMeeting.update({
    where: { id: meetingId },
    data: { quorumAchieved }
  });

  return {
    totalMembers,
    attendedMembers,
    attendancePercentage: Math.round(attendancePercentage),
    quorumRequired: meeting.quorumRequired,
    quorumAchieved
  };
}

// Добавить решение
export async function addCollegialDecision(data: {
  meetingId: number;
  decision: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  responsible?: string;
  deadline?: Date;
}) {
  return await prisma.collegialDecision.create({
    data
  });
}

// Создать протокол
export async function createCollegialProtocol(data: {
  meetingId: number;
  protocolNumber: string;
  content: string;
  approvedBy?: string;
  approvedAt?: Date;
}) {
  return await prisma.collegialProtocol.create({
    data
  });
}

// Создать рабочий план
export async function createWorkPlan(data: {
  bodyId: number;
  year: number;
  quarter?: number;
  month?: number;
  description: string;
  tasks: any[];
}) {
  return await prisma.collegialWorkPlan.create({
    data: {
      ...data,
      tasks: JSON.stringify(data.tasks)
    }
  });
}

// Получить рабочие планы
export async function getWorkPlans(bodyId: number, year?: number) {
  const where: any = { bodyId };
  if (year) where.year = year;

  const plans = await prisma.collegialWorkPlan.findMany({
    where,
    orderBy: [
      { year: 'desc' },
      { quarter: 'asc' },
      { month: 'asc' }
    ]
  });

  return plans.map(p => ({
    ...p,
    tasks: JSON.parse(p.tasks)
  }));
}

// Создать отчет
export async function createCollegialReport(data: {
  bodyId: number;
  year: number;
  quarter?: number;
  month?: number;
  reportType: 'OYLIK' | 'CHORAKLIK' | 'YILLIK';
  content: string;
  meetingsHeld: number;
  decisionsTotal: number;
  tasksCompleted: number;
  submittedBy: number;
}) {
  return await prisma.collegialReport.create({
    data
  });
}

// Получить отчеты
export async function getCollegialReports(bodyId: number, filters?: {
  year?: number;
  reportType?: string;
}) {
  const where: any = { bodyId };
  if (filters?.year) where.year = filters.year;
  if (filters?.reportType) where.reportType = filters.reportType;

  return await prisma.collegialReport.findMany({
    where,
    orderBy: [
      { year: 'desc' },
      { quarter: 'desc' },
      { month: 'desc' }
    ]
  });
}

// Статистика коллегиального органа
export async function getCollegialBodyStatistics(bodyId: number, year?: number) {
  const where: any = { bodyId };
  if (year) {
    where.scheduledDate = {
      gte: new Date(year, 0, 1),
      lte: new Date(year, 11, 31)
    };
  }

  const [
    totalMeetings,
    completedMeetings,
    totalDecisions,
    members,
    workPlans
  ] = await Promise.all([
    prisma.collegialMeeting.count({ where }),
    prisma.collegialMeeting.count({
      where: { ...where, status: 'COMPLETED' }
    }),
    prisma.collegialDecision.count({
      where: {
        meeting: { bodyId }
      }
    }),
    prisma.collegialMember.count({
      where: { bodyId, leftAt: null }
    }),
    prisma.collegialWorkPlan.count({
      where: { bodyId, year: year || new Date().getFullYear() }
    })
  ]);

  return {
    totalMeetings,
    completedMeetings,
    totalDecisions,
    activeMembers: members,
    workPlans
  };
}

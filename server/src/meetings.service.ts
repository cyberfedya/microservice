import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Создание заседания
 */
export async function createMeeting(data: {
  type: string;
  title: string;
  scheduledDate: Date;
  location?: string;
  isOnline: boolean;
  createdById: number;
}) {
  const meeting = await prisma.meeting.create({
    data: {
      type: data.type as any,
      title: data.title,
      scheduledDate: data.scheduledDate,
      location: data.location,
      isOnline: data.isOnline,
      createdById: data.createdById,
      status: 'PLANNED'
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return meeting;
}

/**
 * Получение всех заседаний
 */
export async function getAllMeetings(filters?: {
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {};

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    where.scheduledDate = {};
    if (filters.startDate) {
      where.scheduledDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.scheduledDate.lte = filters.endDate;
    }
  }

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          attendees: true,
          agenda: true,
          decisions: true
        }
      }
    },
    orderBy: {
      scheduledDate: 'asc'
    }
  });

  return meetings;
}

/**
 * Получение заседания по ID
 */
export async function getMeetingById(id: number) {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      attendees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      agenda: {
        include: {
          presenter: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          orderNumber: 'asc'
        }
      },
      decisions: true
    }
  });

  return meeting;
}

/**
 * Обновление заседания
 */
export async function updateMeeting(id: number, data: any) {
  const meeting = await prisma.meeting.update({
    where: { id },
    data,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return meeting;
}

/**
 * Удаление заседания
 */
export async function deleteMeeting(id: number) {
  await prisma.meeting.delete({
    where: { id }
  });

  return { success: true };
}

/**
 * Добавление участника заседания
 */
export async function addAttendee(meetingId: number, userId: number, role?: string, isRequired: boolean = true) {
  const attendee = await prisma.meetingAttendee.create({
    data: {
      meetingId,
      userId,
      role,
      isRequired
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return attendee;
}

/**
 * Отметка присутствия участника
 */
export async function markAttendance(attendeeId: number, attended: boolean) {
  const attendee = await prisma.meetingAttendee.update({
    where: { id: attendeeId },
    data: { attended },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return attendee;
}

/**
 * Добавление пункта повестки дня
 */
export async function addAgendaItem(meetingId: number, data: {
  topic: string;
  description?: string;
  duration?: number;
  presenterId?: number;
  orderNumber?: number;
}) {
  // Получаем максимальный orderNumber если не указан
  let orderNumber = data.orderNumber;
  if (!orderNumber) {
    const maxOrder = await prisma.meetingAgenda.findFirst({
      where: { meetingId },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true }
    });
    orderNumber = (maxOrder?.orderNumber || 0) + 1;
  }

  const agendaItem = await prisma.meetingAgenda.create({
    data: {
      meetingId,
      topic: data.topic,
      description: data.description,
      duration: data.duration,
      presenterId: data.presenterId,
      orderNumber
    },
    include: {
      presenter: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return agendaItem;
}

/**
 * Добавление решения
 */
export async function addDecision(meetingId: number, data: {
  decision: string;
  votesFor?: number;
  votesAgainst?: number;
  votesAbstain?: number;
}) {
  const meetingDecision = await prisma.meetingDecision.create({
    data: {
      meetingId,
      decision: data.decision,
      votesFor: data.votesFor,
      votesAgainst: data.votesAgainst,
      votesAbstain: data.votesAbstain
    }
  });

  return meetingDecision;
}

/**
 * Изменение статуса заседания
 */
export async function updateMeetingStatus(id: number, status: string) {
  const meeting = await prisma.meeting.update({
    where: { id },
    data: { status: status as any },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return meeting;
}

/**
 * Статистика заседаний
 */
export async function getMeetingStats() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [total, planned, inProgress, completed, cancelled, todayMeetings, onlineMeetings] = await Promise.all([
    prisma.meeting.count(),
    prisma.meeting.count({ where: { status: 'PLANNED' } }),
    prisma.meeting.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.meeting.count({ where: { status: 'COMPLETED' } }),
    prisma.meeting.count({ where: { status: 'CANCELLED' } }),
    prisma.meeting.count({
      where: {
        scheduledDate: {
          gte: today,
          lt: tomorrow
        }
      }
    }),
    prisma.meeting.count({ where: { isOnline: true } })
  ]);

  return {
    total,
    planned,
    inProgress,
    completed,
    cancelled,
    todayMeetings,
    onlineMeetings,
    offlineMeetings: total - onlineMeetings
  };
}

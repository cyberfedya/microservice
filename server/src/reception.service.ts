import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Создание графика приема
 */
export async function createReceptionSchedule(data: {
  receiverId: number;
  type: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  maxSlots: number;
  slotDuration: number;
}) {
  const schedule = await prisma.receptionSchedule.create({
    data: {
      receiverId: data.receiverId,
      type: data.type as any,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      maxSlots: data.maxSlots,
      slotDuration: data.slotDuration,
      isActive: true
    },
    include: {
      receiver: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return schedule;
}

/**
 * Получение всех графиков приема
 */
export async function getAllSchedules(filters?: {
  type?: string;
  receiverId?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}) {
  const where: any = {};

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.receiverId) {
    where.receiverId = filters.receiverId;
  }

  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.date.lte = filters.endDate;
    }
  }

  const schedules = await prisma.receptionSchedule.findMany({
    where,
    include: {
      receiver: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          appointments: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  });

  return schedules;
}

/**
 * Создание записи на прием
 */
export async function createAppointment(data: {
  scheduleId: number;
  citizenName: string;
  citizenPhone: string;
  citizenEmail?: string;
  citizenAddress?: string;
  topic: string;
  description?: string;
  timeSlot: string;
}) {
  const appointment = await prisma.receptionAppointment.create({
    data: {
      scheduleId: data.scheduleId,
      citizenName: data.citizenName,
      citizenPhone: data.citizenPhone,
      citizenEmail: data.citizenEmail,
      citizenAddress: data.citizenAddress,
      topic: data.topic,
      description: data.description,
      timeSlot: data.timeSlot,
      status: 'SCHEDULED'
    },
    include: {
      schedule: {
        include: {
          receiver: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  return appointment;
}

/**
 * Получение записей на прием
 */
export async function getAppointments(filters?: {
  scheduleId?: number;
  status?: string;
  citizenPhone?: string;
}) {
  const where: any = {};

  if (filters?.scheduleId) {
    where.scheduleId = filters.scheduleId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.citizenPhone) {
    where.citizenPhone = filters.citizenPhone;
  }

  const appointments = await prisma.receptionAppointment.findMany({
    where,
    include: {
      schedule: {
        include: {
          receiver: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return appointments;
}

/**
 * Обновление статуса записи
 */
export async function updateAppointmentStatus(id: number, status: string, notes?: string) {
  const appointment = await prisma.receptionAppointment.update({
    where: { id },
    data: {
      status: status as any,
      notes
    }
  });

  return appointment;
}

/**
 * Удаление графика приема
 */
export async function deleteSchedule(id: number) {
  await prisma.receptionSchedule.delete({
    where: { id }
  });

  return { success: true };
}

/**
 * Статистика приема граждан
 */
export async function getReceptionStats() {
  const [totalSchedules, activeSchedules, totalAppointments, scheduledAppointments, completedAppointments] = await Promise.all([
    prisma.receptionSchedule.count(),
    prisma.receptionSchedule.count({ where: { isActive: true } }),
    prisma.receptionAppointment.count(),
    prisma.receptionAppointment.count({ where: { status: 'SCHEDULED' } }),
    prisma.receptionAppointment.count({ where: { status: 'COMPLETED' } })
  ]);

  // Статистика по типам приема
  const schedulesByType = await prisma.receptionSchedule.groupBy({
    by: ['type'],
    _count: true
  });

  const byType: any = {};
  schedulesByType.forEach(item => {
    byType[item.type] = item._count;
  });

  return {
    totalSchedules,
    activeSchedules,
    totalAppointments,
    scheduledAppointments,
    completedAppointments,
    byType
  };
}

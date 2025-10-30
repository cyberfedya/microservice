import express from 'express';
import { authenticateToken } from './auth.middleware';
import * as receptionService from './reception.service';

const router = express.Router();

/**
 * Получение всех графиков приема
 */
router.get('/schedules', authenticateToken, async (req, res) => {
  try {
    const { type, receiverId, startDate, endDate, isActive } = req.query;
    
    const filters: any = {};
    if (type) filters.type = type as string;
    if (receiverId) filters.receiverId = parseInt(receiverId as string);
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (isActive) filters.isActive = isActive === 'true';

    const schedules = await receptionService.getAllSchedules(filters);
    res.json(schedules);
  } catch (error: any) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение статистики приема
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await receptionService.getReceptionStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching reception stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создание графика приема
 */
router.post('/schedules', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { type, date, startTime, endTime, location, maxSlots, slotDuration } = req.body;

    if (!type || !date || !startTime || !endTime || !location) {
      return res.status(400).json({ error: 'type, date, startTime, endTime va location majburiy' });
    }

    const schedule = await receptionService.createReceptionSchedule({
      receiverId: user.id,
      type,
      date: new Date(date),
      startTime,
      endTime,
      location,
      maxSlots: maxSlots || 10,
      slotDuration: slotDuration || 15
    });

    res.status(201).json(schedule);
  } catch (error: any) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Удаление графика приема
 */
router.delete('/schedules/:id', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const id = parseInt(req.params.id);

    // Только Admin и Bank apparati могут удалять
    const allowedRoles = ['Admin', 'Bank apparati'];
    if (!allowedRoles.includes(user.role.name)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    await receptionService.deleteSchedule(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение записей на прием
 */
router.get('/appointments', authenticateToken, async (req, res) => {
  try {
    const { scheduleId, status, citizenPhone } = req.query;
    
    const filters: any = {};
    if (scheduleId) filters.scheduleId = parseInt(scheduleId as string);
    if (status) filters.status = status as string;
    if (citizenPhone) filters.citizenPhone = citizenPhone as string;

    const appointments = await receptionService.getAppointments(filters);
    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создание записи на прием
 */
router.post('/appointments', async (req, res) => {
  try {
    const { scheduleId, citizenName, citizenPhone, citizenEmail, citizenAddress, topic, description, timeSlot } = req.body;

    if (!scheduleId || !citizenName || !citizenPhone || !topic || !timeSlot) {
      return res.status(400).json({ error: 'scheduleId, citizenName, citizenPhone, topic va timeSlot majburiy' });
    }

    const appointment = await receptionService.createAppointment({
      scheduleId,
      citizenName,
      citizenPhone,
      citizenEmail,
      citizenAddress,
      topic,
      description,
      timeSlot
    });

    res.status(201).json(appointment);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Обновление статуса записи
 */
router.patch('/appointments/:id/status', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status majburiy' });
    }

    const appointment = await receptionService.updateAppointmentStatus(id, status, notes);
    res.json(appointment);
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

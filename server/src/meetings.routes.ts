import express from 'express';
import { authenticateToken } from './auth.middleware';
import * as meetingsService from './meetings.service';

const router = express.Router();

/**
 * Получение всех заседаний
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    
    const filters: any = {};
    if (type) filters.type = type as string;
    if (status) filters.status = status as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const meetings = await meetingsService.getAllMeetings(filters);
    res.json(meetings);
  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение статистики заседаний
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await meetingsService.getMeetingStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching meeting stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение заседания по ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const meeting = await meetingsService.getMeetingById(id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Yig\'ilish topilmadi' });
    }
    
    res.json(meeting);
  } catch (error: any) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создание заседания
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { type, title, scheduledDate, location, isOnline } = req.body;

    if (!type || !title || !scheduledDate) {
      return res.status(400).json({ error: 'type, title va scheduledDate majburiy' });
    }

    const meeting = await meetingsService.createMeeting({
      type,
      title,
      scheduledDate: new Date(scheduledDate),
      location,
      isOnline: isOnline || false,
      createdById: user.id
    });

    res.status(201).json(meeting);
  } catch (error: any) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Обновление заседания
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;

    const meeting = await meetingsService.updateMeeting(id, updates);
    res.json(meeting);
  } catch (error: any) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Удаление заседания
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const id = parseInt(req.params.id);

    // Только Admin и Bank apparati могут удалять
    const allowedRoles = ['Admin', 'Bank apparati'];
    if (!allowedRoles.includes(user.role.name)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    await meetingsService.deleteMeeting(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Добавление участника
 */
router.post('/:id/attendees', authenticateToken, async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);
    const { userId, role, isRequired } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId majburiy' });
    }

    const attendee = await meetingsService.addAttendee(meetingId, userId, role, isRequired);
    res.status(201).json(attendee);
  } catch (error: any) {
    console.error('Error adding attendee:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Отметка присутствия участника
 */
router.patch('/:id/attendees/:attendeeId/attendance', authenticateToken, async (req, res) => {
  try {
    const attendeeId = parseInt(req.params.attendeeId);
    const { attended } = req.body;

    const attendee = await meetingsService.markAttendance(attendeeId, attended);
    res.json(attendee);
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Добавление пункта повестки дня
 */
router.post('/:id/agenda', authenticateToken, async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);
    const { topic, description, duration, presenterId, orderNumber } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'topic majburiy' });
    }

    const agendaItem = await meetingsService.addAgendaItem(meetingId, {
      topic,
      description,
      duration,
      presenterId,
      orderNumber
    });
    res.status(201).json(agendaItem);
  } catch (error: any) {
    console.error('Error adding agenda item:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Добавление решения
 */
router.post('/:id/decisions', authenticateToken, async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);
    const { decision, votesFor, votesAgainst, votesAbstain } = req.body;

    if (!decision) {
      return res.status(400).json({ error: 'decision majburiy' });
    }

    const meetingDecision = await meetingsService.addDecision(meetingId, {
      decision,
      votesFor,
      votesAgainst,
      votesAbstain
    });
    res.status(201).json(meetingDecision);
  } catch (error: any) {
    console.error('Error adding decision:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Изменение статуса заседания
 */
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status majburiy' });
    }

    const meeting = await meetingsService.updateMeetingStatus(id, status);
    res.json(meeting);
  } catch (error: any) {
    console.error('Error updating meeting status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

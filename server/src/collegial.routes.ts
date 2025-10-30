import { Router, Request, Response } from 'express';
import { authenticateToken } from './auth.middleware';
import * as collegialService from './collegial.service';

const router = Router();

/**
 * Получить все коллегиальные органы
 * GET /api/collegial/bodies
 */
router.get('/bodies', authenticateToken, async (req: Request, res: Response) => {
  try {
    const bodies = await collegialService.getAllCollegialBodies();
    res.json(bodies);
  } catch (error: any) {
    console.error('Error getting collegial bodies:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить коллегиальный орган по типу
 * GET /api/collegial/bodies/:type
 */
router.get('/bodies/:type', authenticateToken, async (req: Request, res: Response) => {
  try {
    const type = req.params.type as any;
    const body = await collegialService.getCollegialBodyByType(type);
    
    if (!body) {
      return res.status(404).json({ error: 'Kollegial organ topilmadi' });
    }
    
    res.json(body);
  } catch (error: any) {
    console.error('Error getting collegial body:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создать коллегиальный орган
 * POST /api/collegial/bodies
 * Только для Admin
 */
router.post('/bodies', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const { type, name, description, chairmanId, secretaryId } = req.body;

    if (!type || !name) {
      return res.status(400).json({ error: 'type va name majburiy' });
    }

    const body = await collegialService.createCollegialBody({
      type,
      name,
      description,
      chairmanId,
      secretaryId
    });

    res.json(body);
  } catch (error: any) {
    console.error('Error creating collegial body:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Добавить члена в коллегиальный орган
 * POST /api/collegial/bodies/:bodyId/members
 */
router.post('/bodies/:bodyId/members', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Только Admin и Bank apparati могут добавлять членов
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const bodyId = parseInt(req.params.bodyId);
    const { userId, role, isVotingMember } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId majburiy' });
    }

    const member = await collegialService.addCollegialMember({
      bodyId,
      userId,
      role,
      isVotingMember
    });

    res.json(member);
  } catch (error: any) {
    console.error('Error adding collegial member:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Удалить члена из коллегиального органа
 * DELETE /api/collegial/bodies/:bodyId/members/:userId
 */
router.delete('/bodies/:bodyId/members/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const bodyId = parseInt(req.params.bodyId);
    const userId = parseInt(req.params.userId);

    await collegialService.removeCollegialMember(bodyId, userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error removing collegial member:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создать заседание коллегиального органа
 * POST /api/collegial/bodies/:bodyId/meetings
 */
router.post('/bodies/:bodyId/meetings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const bodyId = parseInt(req.params.bodyId);
    const { title, scheduledDate, location, isOnline, quorumRequired, agenda } = req.body;

    if (!title || !scheduledDate) {
      return res.status(400).json({ error: 'title va scheduledDate majburiy' });
    }

    const meeting = await collegialService.createCollegialMeeting({
      bodyId,
      title,
      scheduledDate: new Date(scheduledDate),
      location,
      isOnline,
      quorumRequired,
      createdById: user.id,
      agenda
    });

    res.json(meeting);
  } catch (error: any) {
    console.error('Error creating collegial meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить заседания коллегиального органа
 * GET /api/collegial/bodies/:bodyId/meetings
 */
router.get('/bodies/:bodyId/meetings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const bodyId = parseInt(req.params.bodyId);
    const status = req.query.status as any;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const meetings = await collegialService.getCollegialMeetings(bodyId, {
      status,
      startDate,
      endDate
    });

    res.json(meetings);
  } catch (error: any) {
    console.error('Error getting collegial meetings:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Отметить посещаемость
 * POST /api/collegial/meetings/:meetingId/attendance
 */
router.post('/meetings/:meetingId/attendance', authenticateToken, async (req: Request, res: Response) => {
  try {
    const meetingId = parseInt(req.params.meetingId);
    const { userId, attended } = req.body;

    if (userId === undefined || attended === undefined) {
      return res.status(400).json({ error: 'userId va attended majburiy' });
    }

    await collegialService.markAttendance(meetingId, userId, attended);
    
    // Проверить кворум
    const quorumInfo = await collegialService.checkAndUpdateQuorum(meetingId);
    
    res.json(quorumInfo);
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Добавить решение
 * POST /api/collegial/meetings/:meetingId/decisions
 */
router.post('/meetings/:meetingId/decisions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const meetingId = parseInt(req.params.meetingId);
    const { decision, votesFor, votesAgainst, votesAbstain, responsible, deadline } = req.body;

    if (!decision) {
      return res.status(400).json({ error: 'decision majburiy' });
    }

    const decisionRecord = await collegialService.addCollegialDecision({
      meetingId,
      decision,
      votesFor: votesFor || 0,
      votesAgainst: votesAgainst || 0,
      votesAbstain: votesAbstain || 0,
      responsible,
      deadline: deadline ? new Date(deadline) : undefined
    });

    res.json(decisionRecord);
  } catch (error: any) {
    console.error('Error adding decision:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создать протокол
 * POST /api/collegial/meetings/:meetingId/protocol
 */
router.post('/meetings/:meetingId/protocol', authenticateToken, async (req: Request, res: Response) => {
  try {
    const meetingId = parseInt(req.params.meetingId);
    const { protocolNumber, content, approvedBy, approvedAt } = req.body;

    if (!protocolNumber || !content) {
      return res.status(400).json({ error: 'protocolNumber va content majburiy' });
    }

    const protocol = await collegialService.createCollegialProtocol({
      meetingId,
      protocolNumber,
      content,
      approvedBy,
      approvedAt: approvedAt ? new Date(approvedAt) : undefined
    });

    res.json(protocol);
  } catch (error: any) {
    console.error('Error creating protocol:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создать рабочий план
 * POST /api/collegial/bodies/:bodyId/work-plans
 */
router.post('/bodies/:bodyId/work-plans', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const bodyId = parseInt(req.params.bodyId);
    const { year, quarter, month, description, tasks } = req.body;

    if (!year || !description || !tasks) {
      return res.status(400).json({ error: 'year, description va tasks majburiy' });
    }

    const workPlan = await collegialService.createWorkPlan({
      bodyId,
      year,
      quarter,
      month,
      description,
      tasks
    });

    res.json(workPlan);
  } catch (error: any) {
    console.error('Error creating work plan:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить рабочие планы
 * GET /api/collegial/bodies/:bodyId/work-plans
 */
router.get('/bodies/:bodyId/work-plans', authenticateToken, async (req: Request, res: Response) => {
  try {
    const bodyId = parseInt(req.params.bodyId);
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const workPlans = await collegialService.getWorkPlans(bodyId, year);
    res.json(workPlans);
  } catch (error: any) {
    console.error('Error getting work plans:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создать отчет
 * POST /api/collegial/bodies/:bodyId/reports
 */
router.post('/bodies/:bodyId/reports', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const bodyId = parseInt(req.params.bodyId);
    const { year, quarter, month, reportType, content, meetingsHeld, decisionsTotal, tasksCompleted } = req.body;

    if (!year || !reportType || !content) {
      return res.status(400).json({ error: 'year, reportType va content majburiy' });
    }

    const report = await collegialService.createCollegialReport({
      bodyId,
      year,
      quarter,
      month,
      reportType,
      content,
      meetingsHeld: meetingsHeld || 0,
      decisionsTotal: decisionsTotal || 0,
      tasksCompleted: tasksCompleted || 0,
      submittedBy: user.id
    });

    res.json(report);
  } catch (error: any) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить отчеты
 * GET /api/collegial/bodies/:bodyId/reports
 */
router.get('/bodies/:bodyId/reports', authenticateToken, async (req: Request, res: Response) => {
  try {
    const bodyId = parseInt(req.params.bodyId);
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const reportType = req.query.reportType as string;

    const reports = await collegialService.getCollegialReports(bodyId, {
      year,
      reportType
    });

    res.json(reports);
  } catch (error: any) {
    console.error('Error getting reports:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить статистику коллегиального органа
 * GET /api/collegial/bodies/:bodyId/statistics
 */
router.get('/bodies/:bodyId/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const bodyId = parseInt(req.params.bodyId);
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const stats = await collegialService.getCollegialBodyStatistics(bodyId, year);
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

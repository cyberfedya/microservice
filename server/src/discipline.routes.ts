import { Router } from 'express';
import { authenticateToken } from './auth.middleware';
import * as disciplineService from './discipline.service';

const router = Router();

/**
 * Проверка просроченных документов (для cron или ручного запуска)
 * Доступно только для Bank apparati и Admin
 */
router.post('/check-overdue', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Проверка прав доступа
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const violations = await disciplineService.checkOverdueDocuments();
    res.json({
      message: 'Tekshiruv yakunlandi',
      violationsCreated: violations.length,
      violations
    });
  } catch (error: any) {
    console.error('Error checking overdue documents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Проверка приближающихся дедлайнов
 * Доступно только для Bank apparati и Admin
 */
router.post('/check-upcoming', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const notifications = await disciplineService.checkUpcomingDeadlines();
    res.json({
      message: 'Xabarnomalar yuborildi',
      notificationsSent: notifications.length
    });
  } catch (error: any) {
    console.error('Error checking upcoming deadlines:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создание нарушения вручную
 * Доступно для Bank apparati, Admin и Boshqaruv
 */
router.post('/violations', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId, documentId, reason } = req.body;

    // Проверка прав доступа
    const allowedRoles = ['Admin', 'Bank apparati', 'Boshqaruv'];
    if (!allowedRoles.includes(user.role.name)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    if (!userId || !documentId || !reason) {
      return res.status(400).json({ error: 'userId, documentId va reason majburiy' });
    }

    const violation = await disciplineService.createViolationForUser(
      parseInt(userId),
      parseInt(documentId),
      reason
    );

    res.json(violation);
  } catch (error: any) {
    console.error('Error creating violation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение статистики нарушений пользователя
 */
router.get('/violations/user/:userId', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const targetUserId = parseInt(req.params.userId);

    // Пользователь может видеть только свои нарушения, кроме руководителей
    const allowedRoles = ['Admin', 'Bank apparati', 'Boshqaruv'];
    if (user.id !== targetUserId && !allowedRoles.includes(user.role.name)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const stats = await disciplineService.getUserViolationStats(targetUserId);
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting user violation stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение статистики нарушений по отделу
 */
router.get('/violations/department/:departmentId', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const departmentId = parseInt(req.params.departmentId);

    // Проверка прав доступа
    const allowedRoles = ['Admin', 'Bank apparati', 'Boshqaruv', 'Tarmoq'];
    if (!allowedRoles.includes(user.role.name)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    // Tarmoq может видеть только свой отдел
    if (user.role.name === 'Tarmoq' && user.departmentId !== departmentId) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const stats = await disciplineService.getDepartmentViolationStats(departmentId);
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting department violation stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение отчета по исполнительской дисциплине
 */
router.get('/report', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    // Проверка прав доступа
    const allowedRoles = ['Admin', 'Bank apparati', 'Boshqaruv'];
    if (!allowedRoles.includes(user.role.name)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const filters: any = {};

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    if (req.query.departmentId) {
      filters.departmentId = parseInt(req.query.departmentId as string);
    }
    if (req.query.userId) {
      filters.userId = parseInt(req.query.userId as string);
    }

    const report = await disciplineService.getDisciplineReport(filters);
    res.json(report);
  } catch (error: any) {
    console.error('Error getting discipline report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение статистики мониторинга документов
 */
router.get('/monitoring', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    // Проверка прав доступа
    const allowedRoles = ['Admin', 'Bank apparati', 'Boshqaruv'];
    if (!allowedRoles.includes(user.role.name)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const stats = await disciplineService.getDocumentMonitoringStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting monitoring stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

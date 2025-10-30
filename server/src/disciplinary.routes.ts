import { Router, Request, Response } from 'express';
import { authenticateToken } from './auth.middleware';
import * as disciplinaryService from './disciplinary.service';

const router = Router();

/**
 * Применить дисциплинарное взыскание
 * POST /api/disciplinary/apply
 * Только для Admin и Bank apparati
 */
router.post('/apply', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Проверка прав доступа
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const { userId, violationType, reason, documentId } = req.body;

    if (!userId || !violationType || !reason) {
      return res.status(400).json({ error: 'userId, violationType va reason majburiy' });
    }

    const result = await disciplinaryService.applyDisciplinaryAction({
      userId,
      violationType,
      reason,
      documentId,
      performedBy: user.id
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error applying disciplinary action:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить статистику по дисциплинарным взысканиям
 * GET /api/disciplinary/statistics
 */
router.get('/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Проверка прав доступа
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const stats = await disciplinaryService.getDisciplinaryStatistics(startDate, endDate);
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting disciplinary statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить историю дисциплинарных взысканий пользователя
 * GET /api/disciplinary/user/:userId/history
 */
router.get('/user/:userId/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const targetUserId = parseInt(req.params.userId);
    
    // Пользователь может видеть только свою историю, кроме Admin и Bank apparati
    if (user.id !== targetUserId && user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const history = await disciplinaryService.getUserDisciplinaryHistory(targetUserId);
    res.json(history);
  } catch (error: any) {
    console.error('Error getting user disciplinary history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Сбросить дисциплинарные взыскания
 * POST /api/disciplinary/user/:userId/reset
 * Только для Admin
 */
router.post('/user/:userId/reset', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Только Admin может сбрасывать
    if (user.role.name !== 'Admin') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const targetUserId = parseInt(req.params.userId);
    const result = await disciplinaryService.resetDisciplinaryRecord(targetUserId, user.id);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error resetting disciplinary record:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

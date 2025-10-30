import express from 'express';
import { authenticateToken } from './auth.middleware';
import * as kpiService from './kpi.service';

const router = express.Router();

/**
 * Получение KPI текущего пользователя
 */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const kpi = await kpiService.getUserKPI(user.id);
    res.json(kpi);
  } catch (error: any) {
    console.error('Error fetching KPI:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение истории KPI текущего пользователя
 */
router.get('/my/history', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { months } = req.query;
    const history = await kpiService.getUserKPIHistory(user.id, months ? parseInt(months as string) : 6);
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching KPI history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение статистики по документам
 */
router.get('/my/stats', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const stats = await kpiService.getUserDocumentStats(user.id);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Пересчет KPI (только для админов)
 */
router.post('/recalculate', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Только Admin может пересчитывать KPI
    if (user.role.name !== 'Admin') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const results = await kpiService.recalculateAllKPI();
    res.json({ success: true, count: results.length });
  } catch (error: any) {
    console.error('Error recalculating KPI:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

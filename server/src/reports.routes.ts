import { Router, Request, Response } from 'express';
import { authenticateToken } from './auth.middleware';
import * as reportsService from './reports.service';

const router = Router();

// ============================================
// ОБЩИЕ ОТЧЕТЫ
// ============================================

/**
 * Создать отчет
 * POST /api/reports/create
 */
router.post('/create', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const {
      title,
      reportType,
      year,
      quarter,
      month,
      departmentId,
      content
    } = req.body;

    if (!title || !reportType || !year || !content) {
      return res.status(400).json({ error: 'title, reportType, year va content majburiy' });
    }

    const report = await reportsService.createReport({
      title,
      reportType,
      year,
      quarter,
      month,
      departmentId,
      content,
      createdBy: user.id
    });

    res.json(report);
  } catch (error: any) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Добавить метрику к отчету
 * POST /api/reports/:reportId/metrics
 */
router.post('/:reportId/metrics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const reportId = parseInt(req.params.reportId);
    const { metricName, metricValue, targetValue, unit, description } = req.body;

    if (!metricName || metricValue === undefined) {
      return res.status(400).json({ error: 'metricName va metricValue majburiy' });
    }

    const metric = await reportsService.addReportMetric({
      reportId,
      metricName,
      metricValue,
      targetValue,
      unit,
      description
    });

    res.json(metric);
  } catch (error: any) {
    console.error('Error adding metric:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Отправить отчет на утверждение
 * POST /api/reports/:reportId/submit
 */
router.post('/:reportId/submit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const reportId = parseInt(req.params.reportId);
    const report = await reportsService.submitReport(reportId);
    res.json(report);
  } catch (error: any) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Утвердить отчет
 * POST /api/reports/:reportId/approve
 */
router.post('/:reportId/approve', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const reportId = parseInt(req.params.reportId);
    const report = await reportsService.approveReport({
      reportId,
      approvedBy: user.id
    });

    res.json(report);
  } catch (error: any) {
    console.error('Error approving report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Отклонить отчет
 * POST /api/reports/:reportId/reject
 */
router.post('/:reportId/reject', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const reportId = parseInt(req.params.reportId);
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'rejectionReason majburiy' });
    }

    const report = await reportsService.rejectReport({
      reportId,
      approvedBy: user.id,
      rejectionReason
    });

    res.json(report);
  } catch (error: any) {
    console.error('Error rejecting report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить отчеты
 * GET /api/reports
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const {
      reportType,
      year,
      quarter,
      month,
      departmentId,
      status,
      createdBy
    } = req.query;

    const reports = await reportsService.getReports({
      reportType: reportType as any,
      year: year ? parseInt(year as string) : undefined,
      quarter: quarter ? parseInt(quarter as string) : undefined,
      month: month ? parseInt(month as string) : undefined,
      departmentId: departmentId ? parseInt(departmentId as string) : undefined,
      status: status as any,
      createdBy: createdBy ? parseInt(createdBy as string) : undefined
    });

    res.json(reports);
  } catch (error: any) {
    console.error('Error getting reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ОТЧЕТ ПО ИСПОЛНИТЕЛЬСКОЙ ДИСЦИПЛИНЕ
// ============================================

/**
 * Сгенерировать отчет по дисциплине
 * POST /api/reports/discipline/generate
 */
router.post('/discipline/generate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { reportType, year, quarter, month, departmentId } = req.body;

    if (!reportType || !year) {
      return res.status(400).json({ error: 'reportType va year majburiy' });
    }

    const report = await reportsService.generateDisciplineReport({
      reportType,
      year,
      quarter,
      month,
      departmentId,
      createdBy: user.id
    });

    res.json(report);
  } catch (error: any) {
    console.error('Error generating discipline report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить отчеты по дисциплине
 * GET /api/reports/discipline
 */
router.get('/discipline', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { reportType, year, quarter, month, departmentId } = req.query;

    const reports = await reportsService.getDisciplineReports({
      reportType: reportType as any,
      year: year ? parseInt(year as string) : undefined,
      quarter: quarter ? parseInt(quarter as string) : undefined,
      month: month ? parseInt(month as string) : undefined,
      departmentId: departmentId ? parseInt(departmentId as string) : undefined
    });

    res.json(reports);
  } catch (error: any) {
    console.error('Error getting discipline reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ОТЧЕТ ПО ДОКУМЕНТООБОРОТУ
// ============================================

/**
 * Сгенерировать отчет по документообороту
 * POST /api/reports/docflow/generate
 */
router.post('/docflow/generate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { reportType, year, quarter, month } = req.body;

    if (!reportType || !year) {
      return res.status(400).json({ error: 'reportType va year majburiy' });
    }

    const report = await reportsService.generateDocumentFlowReport({
      reportType,
      year,
      quarter,
      month,
      createdBy: user.id
    });

    res.json(report);
  } catch (error: any) {
    console.error('Error generating docflow report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить отчеты по документообороту
 * GET /api/reports/docflow
 */
router.get('/docflow', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { reportType, year, quarter, month } = req.query;

    const reports = await reportsService.getDocumentFlowReports({
      reportType: reportType as any,
      year: year ? parseInt(year as string) : undefined,
      quarter: quarter ? parseInt(quarter as string) : undefined,
      month: month ? parseInt(month as string) : undefined
    });

    res.json(reports);
  } catch (error: any) {
    console.error('Error getting docflow reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// СТАТИСТИКА
// ============================================

/**
 * Получить общую статистику для страницы отчетов
 * GET /api/reports/stats
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { period, year, month } = req.query;
    
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
    
    // Определяем диапазон дат
    let startDate: Date;
    let endDate: Date;
    
    if (period === 'year') {
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31, 23, 59, 59);
    } else if (period === 'quarter') {
      const quarter = Math.ceil(currentMonth / 3);
      startDate = new Date(currentYear, (quarter - 1) * 3, 1);
      endDate = new Date(currentYear, quarter * 3, 0, 23, 59, 59);
    } else {
      // month по умолчанию
      startDate = new Date(currentYear, currentMonth - 1, 1);
      endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    }
    
    const stats = await reportsService.getGeneralStats(startDate, endDate);
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить статистику отчетности
 * GET /api/reports/statistics
 */
router.get('/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const stats = await reportsService.getReportingStatistics();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

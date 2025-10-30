import { Router, Request, Response } from 'express';
import { authenticateToken } from './auth.middleware';
import * as stagesService from './document-stages.service';
import { DocumentStage } from '@prisma/client';

const router = Router();

/**
 * Переход документа на новый этап
 * POST /api/documents/:id/stages/transition
 */
router.post('/:id/stages/transition', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const documentId = parseInt(req.params.id);
    const { newStage, notes } = req.body;

    if (!newStage) {
      return res.status(400).json({ error: 'newStage majburiy' });
    }

    const result = await stagesService.transitionDocumentStage({
      documentId,
      newStage: newStage as DocumentStage,
      performedBy: user.id,
      notes
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error transitioning stage:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить историю этапов документа
 * GET /api/documents/:id/stages/history
 */
router.get('/:id/stages/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const history = await stagesService.getDocumentStageHistory(documentId);
    res.json(history);
  } catch (error: any) {
    console.error('Error getting stage history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить документы, застрявшие на этапе
 * GET /api/documents/stages/stuck?stage=PENDING_REGISTRATION
 */
router.get('/stages/stuck', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Только Bank apparati и Admin могут видеть застрявшие документы
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const stage = req.query.stage as DocumentStage;
    if (!stage) {
      return res.status(400).json({ error: 'stage parametri majburiy' });
    }

    const stuckDocs = await stagesService.getStuckDocuments(stage);
    res.json(stuckDocs);
  } catch (error: any) {
    console.error('Error getting stuck documents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить документы, близкие к превышению времени
 * GET /api/documents/stages/nearing-deadline?stage=RESOLUTION
 */
router.get('/stages/nearing-deadline', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stage = req.query.stage as DocumentStage;
    const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : 0.8;

    if (!stage) {
      return res.status(400).json({ error: 'stage parametri majburiy' });
    }

    const nearingDocs = await stagesService.getDocumentsNearingDeadline(stage, threshold);
    res.json(nearingDocs);
  } catch (error: any) {
    console.error('Error getting nearing deadline documents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Статистика по этапам
 * GET /api/documents/stages/statistics
 */
router.get('/stages/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Только Bank apparati и Admin могут видеть статистику
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const stats = await stagesService.getStageStatistics(startDate, endDate);
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting stage statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { authenticateToken } from './auth.middleware';
import * as ustxatService from './ustxat.service';

const router = Router();

/**
 * Создать резолюцию (ustxat)
 * POST /api/ustxat/create
 */
router.post('/create', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const {
      documentId,
      text,
      deadline,
      mainExecutorId,
      equalExecutors,
      coExecutors,
      assistantId,
      priority,
      notes
    } = req.body;

    if (!documentId || !text) {
      return res.status(400).json({ error: 'documentId va text majburiy' });
    }

    const resolution = await ustxatService.createResolution({
      documentId,
      text,
      deadline: deadline ? new Date(deadline) : undefined,
      assignedBy: user.id,
      mainExecutorId,
      equalExecutors,
      coExecutors,
      assistantId,
      priority,
      notes
    });

    res.json(resolution);
  } catch (error: any) {
    console.error('Error creating resolution:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить резолюции документа
 * GET /api/ustxat/document/:documentId
 */
router.get('/document/:documentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.documentId);
    const resolutions = await ustxatService.getDocumentResolutions(documentId);
    res.json(resolutions);
  } catch (error: any) {
    console.error('Error getting resolutions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Переназначить исполнителя
 * POST /api/ustxat/reassign
 */
router.post('/reassign', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId, newExecutorId, reason } = req.body;

    if (!documentId || !newExecutorId || !reason) {
      return res.status(400).json({ error: 'documentId, newExecutorId va reason majburiy' });
    }

    const document = await ustxatService.reassignExecutor({
      documentId,
      newExecutorId,
      reassignedBy: user.id,
      reason
    });

    res.json(document);
  } catch (error: any) {
    console.error('Error reassigning executor:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Добавить комментарий к резолюции
 * POST /api/ustxat/comment
 */
router.post('/comment', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId, comment } = req.body;

    if (!documentId || !comment) {
      return res.status(400).json({ error: 'documentId va comment majburiy' });
    }

    const result = await ustxatService.addResolutionComment({
      documentId,
      userId: user.id,
      comment
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить статистику по резолюциям
 * GET /api/ustxat/statistics
 */
router.get('/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : user.id;

    const stats = await ustxatService.getResolutionStatistics(userId);
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить документы пользователя по роли
 * GET /api/ustxat/my-documents/:role
 */
router.get('/my-documents/:role', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const role = req.params.role.toUpperCase() as 'MAIN' | 'EQUAL' | 'CO' | 'ASSISTANT';

    if (!['MAIN', 'EQUAL', 'CO', 'ASSISTANT'].includes(role)) {
      return res.status(400).json({ error: 'Noto\'g\'ri rol' });
    }

    const documents = await ustxatService.getUserDocumentsByRole(user.id, role);
    res.json(documents);
  } catch (error: any) {
    console.error('Error getting user documents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Завершить выполнение резолюции
 * POST /api/ustxat/complete
 */
router.post('/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId, completionNotes } = req.body;

    if (!documentId || !completionNotes) {
      return res.status(400).json({ error: 'documentId va completionNotes majburiy' });
    }

    const document = await ustxatService.completeResolution({
      documentId,
      userId: user.id,
      completionNotes
    });

    res.json(document);
  } catch (error: any) {
    console.error('Error completing resolution:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { authenticateToken } from './auth.middleware';
import * as archiveService from './archive.service';
import { DocumentValue } from '@prisma/client';

const router = Router();

// ============================================
// EKSPERT KOMISSIYASI
// ============================================

/**
 * Создать экспертную комиссию
 * POST /api/archive/commission
 */
router.post('/commission', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const { name, chairmanId, secretaryId } = req.body;

    if (!name || !chairmanId) {
      return res.status(400).json({ error: 'name va chairmanId majburiy' });
    }

    const commission = await archiveService.createExpertCommission({
      name,
      chairmanId,
      secretaryId
    });

    res.json(commission);
  } catch (error: any) {
    console.error('Error creating commission:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Добавить члена комиссии
 * POST /api/archive/commission/:commissionId/members
 */
router.post('/commission/:commissionId/members', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const commissionId = parseInt(req.params.commissionId);
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId majburiy' });
    }

    const member = await archiveService.addCommissionMember({
      commissionId,
      userId,
      role
    });

    res.json(member);
  } catch (error: any) {
    console.error('Error adding commission member:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Создать заседание комиссии
 * POST /api/archive/commission/:commissionId/meetings
 */
router.post('/commission/:commissionId/meetings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const commissionId = parseInt(req.params.commissionId);
    const { date, location, agenda, decisions, protocolNumber } = req.body;

    if (!date || !agenda) {
      return res.status(400).json({ error: 'date va agenda majburiy' });
    }

    const meeting = await archiveService.createCommissionMeeting({
      commissionId,
      date: new Date(date),
      location,
      agenda,
      decisions,
      protocolNumber
    });

    res.json(meeting);
  } catch (error: any) {
    console.error('Error creating commission meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EKSPERTIZA
// ============================================

/**
 * Создать экспертизу документа
 * POST /api/archive/expertise
 */
router.post('/expertise', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId, commissionId, documentValue, decision, notes } = req.body;

    if (!documentId || !commissionId || !documentValue || !decision) {
      return res.status(400).json({ error: 'documentId, commissionId, documentValue va decision majburiy' });
    }

    const expertise = await archiveService.createDocumentExpertise({
      documentId,
      commissionId,
      documentValue: documentValue as DocumentValue,
      decision,
      decidedBy: user.id,
      notes
    });

    res.json(expertise);
  } catch (error: any) {
    console.error('Error creating expertise:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить экспертизы документа
 * GET /api/archive/expertise/:documentId
 */
router.get('/expertise/:documentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.documentId);
    const expertises = await archiveService.getDocumentExpertises(documentId);
    res.json(expertises);
  } catch (error: any) {
    console.error('Error getting expertises:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить документы, требующие экспертизы
 * GET /api/archive/expertise/pending
 */
router.get('/expertise-pending', authenticateToken, async (req: Request, res: Response) => {
  try {
    const documents = await archiveService.getDocumentsNeedingExpertise();
    res.json(documents);
  } catch (error: any) {
    console.error('Error getting documents needing expertise:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ARXIV XRANILISHCHA
// ============================================

/**
 * Архивировать документ
 * POST /api/archive/store
 */
router.post('/store', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId, archiveNumber, shelfLocation, boxNumber, notes } = req.body;

    if (!documentId || !archiveNumber) {
      return res.status(400).json({ error: 'documentId va archiveNumber majburiy' });
    }

    const archive = await archiveService.archiveDocument({
      documentId,
      archiveNumber,
      shelfLocation,
      boxNumber,
      archivedBy: user.id,
      notes
    });

    res.json(archive);
  } catch (error: any) {
    console.error('Error archiving document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Извлечь документ из архива
 * POST /api/archive/retrieve/:documentId
 */
router.post('/retrieve/:documentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const documentId = parseInt(req.params.documentId);

    const archive = await archiveService.retrieveDocumentFromArchive({
      documentId,
      retrievedBy: user.id
    });

    res.json(archive);
  } catch (error: any) {
    console.error('Error retrieving document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Переместить документ в архиве
 * POST /api/archive/move
 */
router.post('/move', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId, fromLocation, toLocation, reason } = req.body;

    if (!documentId || !toLocation) {
      return res.status(400).json({ error: 'documentId va toLocation majburiy' });
    }

    const movement = await archiveService.moveDocumentInArchive({
      documentId,
      fromLocation,
      toLocation,
      movedBy: user.id,
      reason
    });

    res.json(movement);
  } catch (error: any) {
    console.error('Error moving document:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SO'ROVLAR
// ============================================

/**
 * Создать запрос на выдачу документа
 * POST /api/archive/request
 */
router.post('/request', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { documentId, reason } = req.body;

    if (!documentId || !reason) {
      return res.status(400).json({ error: 'documentId va reason majburiy' });
    }

    const request = await archiveService.createArchiveRequest({
      documentId,
      requestedBy: user.id,
      reason
    });

    res.json(request);
  } catch (error: any) {
    console.error('Error creating archive request:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Одобрить запрос
 * POST /api/archive/request/:requestId/approve
 */
router.post('/request/:requestId/approve', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const requestId = parseInt(req.params.requestId);

    const request = await archiveService.approveArchiveRequest({
      requestId,
      approvedBy: user.id
    });

    res.json(request);
  } catch (error: any) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Отклонить запрос
 * POST /api/archive/request/:requestId/reject
 */
router.post('/request/:requestId/reject', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const requestId = parseInt(req.params.requestId);
    const { notes } = req.body;

    const request = await archiveService.rejectArchiveRequest({
      requestId,
      approvedBy: user.id,
      notes
    });

    res.json(request);
  } catch (error: any) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Вернуть документ в архив
 * POST /api/archive/request/:requestId/return
 */
router.post('/request/:requestId/return', authenticateToken, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.requestId);
    const { returnDate } = req.body;

    const request = await archiveService.returnDocumentToArchive({
      requestId,
      returnDate: returnDate ? new Date(returnDate) : new Date()
    });

    res.json(request);
  } catch (error: any) {
    console.error('Error returning document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить запросы
 * GET /api/archive/requests
 */
router.get('/requests', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const status = req.query.status as string;
    const requestedBy = req.query.requestedBy ? parseInt(req.query.requestedBy as string) : undefined;

    const requests = await archiveService.getArchiveRequests({
      status,
      requestedBy: requestedBy || (user.role.name === 'Admin' ? undefined : user.id)
    });

    res.json(requests);
  } catch (error: any) {
    console.error('Error getting requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// STATISTIKA
// ============================================

/**
 * Получить статистику архива
 * GET /api/archive/statistics
 */
router.get('/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const stats = await archiveService.getArchiveStatistics();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получить документы для уничтожения
 * GET /api/archive/destruction
 */
router.get('/destruction', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin' && user.role.name !== 'Bank apparati') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const documents = await archiveService.getDocumentsForDestruction();
    res.json(documents);
  } catch (error: any) {
    console.error('Error getting documents for destruction:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Уничтожить документ
 * POST /api/archive/destroy/:documentId
 */
router.post('/destroy/:documentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role.name !== 'Admin') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const documentId = parseInt(req.params.documentId);
    const { notes } = req.body;

    const result = await archiveService.destroyDocument({
      documentId,
      destroyedBy: user.id,
      notes
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error destroying document:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

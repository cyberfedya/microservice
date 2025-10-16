import { Request, Response, NextFunction } from "express";
import * as DocumentService from './documents.service';

export async function getCorrespondences(req: Request, res: Response, next: NextFunction) {
    try {
        const user = (req as any).user;
        const documents = await DocumentService.findDocumentsForUser(user);
        res.json(documents);
    } catch (e) {
        next(e);
    }
}

export async function getCorrespondenceById(req: Request, res: Response, next: NextFunction) {
    try {
        const document = await DocumentService.findDocumentById(Number(req.params.id));
        if (!document) return res.status(404).json({ error: "Document not found" });
        res.json(document);
    } catch (e) {
        next(e);
    }
}

export async function createIncomingCorrespondence(req: Request, res: Response, next: NextFunction) {
    try {
        const { title, content, source, kartoteka } = req.body;
        const authorId = (req as any).user.id;
        if (!title || !content || !source) return res.status(400).json({ error: "Title, content, and source are required" });
        const newDocument = await DocumentService.createIncoming({ title, content, source, kartoteka }, authorId);
        res.status(201).json(newDocument);
    } catch (e) {
        next(e);
    }
}

export async function createOutgoingCorrespondence(req: Request, res: Response, next: NextFunction) {
    try {
        const { title, content, kartoteka } = req.body;
        const authorId = (req as any).user.id;
        if (!title) return res.status(400).json({ error: "Title is required" });
        const newDocument = await DocumentService.createOutgoing({ title, content, kartoteka }, authorId);
        res.status(201).json(newDocument);
    } catch (e) {
        next(e);
    }
}

export async function submitForReview(req: Request, res: Response, next: NextFunction) {
    try {
        const documentId = Number(req.params.id);
        const finalDocument = await DocumentService.submitForReview(documentId);
        res.json(finalDocument);
    } catch (e) {
        next(e);
    }
}

export async function approveReview(req: Request, res: Response, next: NextFunction) {
    try {
        const documentId = Number(req.params.id);
        const userId = (req as any).user.id;
        const finalDocument = await DocumentService.approveReview(documentId, userId);
        res.json(finalDocument);
    } catch (e) {
        next(e);
    }
}

export async function rejectReview(req: Request, res: Response, next: NextFunction) {
    try {
        const documentId = Number(req.params.id);
        const userId = (req as any).user.id;
        const { comment } = req.body;
        const finalDocument = await DocumentService.rejectReview(documentId, userId, comment);
        res.json(finalDocument);
    } catch (e) {
        next(e);
    }
}

export async function signDocument(req: Request, res: Response, next: NextFunction) {
    try {
        const userRole = (req as any).user.role.name;
        if (userRole !== 'Boshqaruv') return res.status(403).json({ error: "Sizda hujjatlarni imzolash uchun ruxsat yo'q." });
        const userId = (req as any).user.id;
        const updatedDocument = await DocumentService.sign(Number(req.params.id), userId);
        res.json(updatedDocument);
    } catch (e) {
        next(e);
    }
}

export async function dispatchDocument(req: Request, res: Response, next: NextFunction) {
    try {
        const userRole = (req as any).user.role.name;
        if (userRole !== 'Bank apparati') return res.status(403).json({ error: "Sizda hujjatlarni jo'natish uchun ruxsat yo'q." });
        const userId = (req as any).user.id;
        const updatedDocument = await DocumentService.dispatch(Number(req.params.id), userId);
        res.json(updatedDocument);
    } catch (e) {
        next(e);
    }
}

export async function updateExecutors(req: Request, res: Response, next: NextFunction) {
    try {
        const doerId = (req as any).user.id;
        const updatedDocument = await DocumentService.updateExecutors(Number(req.params.id), req.body, doerId);
        res.json(updatedDocument);
    } catch (e) {
        next(e);
    }
}

export async function updateDeadline(req: Request, res: Response, next: NextFunction) {
    try {
        const updatedDocument = await DocumentService.updateDeadline(Number(req.params.id), req.body);
        res.json(updatedDocument);
    } catch (e) {
        next(e);
    }
}
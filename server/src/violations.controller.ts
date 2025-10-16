import { Request, Response, NextFunction } from "express";
import * as ViolationService from './violations.service';

export async function getViolations(req: Request, res: Response, next: NextFunction) {
    try {
        const violations = await ViolationService.findViolations();
        res.json(violations);
    } catch (e) {
        next(e);
    }
}

export async function createViolation(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, reason, type, date } = req.body;
        if (!userId || !reason || !type || !date) return res.status(400).json({ error: "userId, reason, type, and date are required" });

        const newViolation = await ViolationService.createViolation(req.body);
        res.status(201).json(newViolation);
    } catch (e) {
        next(e);
    }
}
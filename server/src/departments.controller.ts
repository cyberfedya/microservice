import { Request, Response, NextFunction } from "express";
import * as DepartmentService from './departments.service';

export async function getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
        const departments = await DepartmentService.findDepartments();
        res.json(departments);
    } catch (e) {
        next(e);
    }
}
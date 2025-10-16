import { Request, Response, NextFunction } from "express";
import * as RoleService from './roles.service';

export async function getRoles(req: Request, res: Response, next: NextFunction) {
    try {
        const roles = await RoleService.findRoles();
        res.json(roles);
    } catch (e) {
        next(e);
    }
}

export async function createRole(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: "Role name is required" });
        const newRole = await RoleService.createRole({ name, description });
        res.status(201).json(newRole);
    } catch (e) {
        next(e);
    }
}

export async function updateRole(req: Request, res: Response, next: NextFunction) {
    try {
        const roleId = Number(req.params.id);
        const { description } = req.body;
        const updatedRole = await RoleService.updateRole(roleId, { description });
        res.json(updatedRole);
    } catch (e) {
        next(e);
    }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
        const roleId = Number(req.params.id);
        await RoleService.deleteRole(roleId);
        res.status(204).send();
    } catch (e: any) {
        // Handle the specific error from the service for a role in use
        if (e.message.includes("Cannot delete role")) return res.status(400).json({ error: e.message });
        next(e);
    }
}
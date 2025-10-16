import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, async (err: any, payload: any) => {
    if (err) return res.sendStatus(403);

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { role: true, department: true },
      });
      if (!user) return res.sendStatus(403);
      (req as any).user = user; // Attach full user object
      next();
    } catch (dbError) {
      return res.status(500).json({ error: "Database error during authentication." });
    }
  });
};
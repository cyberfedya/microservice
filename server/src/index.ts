// C:\Users\aliak\Desktop\Док-оборот\docmanageapp_xs-main\server\src\index.ts

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { authenticateToken } from "./auth.middleware";
import { registerAuthRoutes } from "./auth.routes";
import { registerUserRoutes } from "./users.routes";
import { registerDocumentRoutes } from "./documents.routes";
import { registerRoleRoutes } from "./roles.routes";
import { registerDepartmentRoutes } from "./departments.routes";
import { registerViolationRoutes } from "./violations.routes";
import { registerNotificationRoutes } from "./notifications.routes";
import { prisma } from "./prisma";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Register public routes
registerAuthRoutes(app);

// Register protected routes
app.use("/api", authenticateToken);
registerUserRoutes(app);
registerDocumentRoutes(app);
registerRoleRoutes(app);
registerDepartmentRoutes(app);
registerViolationRoutes(app);
registerNotificationRoutes(app);

// Global Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Server startup
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
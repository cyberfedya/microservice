// C:\Users\aliak\Desktop\Док-оборот\docmanageapp_xs-main\server\src\index.ts

import express, { Request, Response, NextFunction, Router } from "express";
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
import disciplineRoutes from "./discipline.routes";
import meetingsRoutes from './meetings.routes';
import receptionRoutes from './reception.routes';
import documentStagesRoutes from './document-stages.routes';
import disciplinaryRoutes from './disciplinary.routes';
import collegialRoutes from './collegial.routes';
import archiveRoutes from './archive.routes';
import ustxatRoutes from './ustxat.routes';
import reportsRoutes from './reports.routes';
import kpiRoutes from './kpi.routes';
import { prisma } from "./prisma";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Register public routes
registerAuthRoutes(app);

// Публичный endpoint для записи граждан на прием (без авторизации)
const publicRouter = Router();
publicRouter.post('/reception/appointments', async (req, res) => {
  try {
    const { scheduleId, citizenName, citizenPhone, citizenEmail, citizenAddress, topic, description, timeSlot } = req.body;
    if (!scheduleId || !citizenName || !citizenPhone || !topic || !timeSlot) {
      return res.status(400).json({ error: 'scheduleId, citizenName, citizenPhone, topic va timeSlot majburiy' });
    }
    const receptionService = await import('./reception.service');
    const appointment = await receptionService.createAppointment({
      scheduleId,
      citizenName,
      citizenPhone,
      citizenEmail,
      citizenAddress,
      topic,
      description,
      timeSlot
    });
    res.status(201).json(appointment);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: error.message });
  }
});
app.use('/api', publicRouter);

// Register protected routes
app.use("/api", authenticateToken);
registerUserRoutes(app);
registerDocumentRoutes(app);
registerRoleRoutes(app);
registerDepartmentRoutes(app);
registerViolationRoutes(app);
registerNotificationRoutes(app);
app.use('/api/discipline', disciplineRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/reception', receptionRoutes);
app.use('/api/documents', documentStagesRoutes);
app.use('/api/disciplinary', disciplinaryRoutes);
app.use('/api/collegial', collegialRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/ustxat', ustxatRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/kpi', kpiRoutes);

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
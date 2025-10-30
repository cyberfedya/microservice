-- ============================================
-- ПРИМЕНИТЬ ВСЕ МИГРАЦИИ СРАЗУ
-- Скопируйте этот файл в pgAdmin и выполните
-- ============================================

-- 1. ЗАСЕДАНИЯ И ПРОТОКОЛЫ
CREATE TYPE "MeetingType" AS ENUM ('BOSHQARUV', 'KOLLEGIAL_ORGAN', 'KENGASH', 'AKSIYADORLAR');
CREATE TYPE "MeetingStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE "Meeting" (
  "id" SERIAL PRIMARY KEY,
  "type" "MeetingType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "scheduledDate" TIMESTAMP NOT NULL,
  "startTime" TIMESTAMP,
  "endTime" TIMESTAMP,
  "location" TEXT,
  "isOnline" BOOLEAN DEFAULT false,
  "meetingLink" TEXT,
  "status" "MeetingStatus" DEFAULT 'PLANNED',
  "quorum" INTEGER,
  "attendeesCount" INTEGER DEFAULT 0,
  "createdById" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "MeetingAgenda" (
  "id" SERIAL PRIMARY KEY,
  "meetingId" INTEGER NOT NULL,
  "orderNumber" INTEGER NOT NULL,
  "topic" TEXT NOT NULL,
  "description" TEXT,
  "presenterId" INTEGER,
  "duration" INTEGER,
  "documentId" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE,
  FOREIGN KEY ("presenterId") REFERENCES "User"("id") ON DELETE SET NULL,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL
);

CREATE TABLE "MeetingAttendee" (
  "id" SERIAL PRIMARY KEY,
  "meetingId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "role" TEXT,
  "isRequired" BOOLEAN DEFAULT true,
  "attended" BOOLEAN DEFAULT false,
  "attendedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("meetingId", "userId")
);

CREATE TABLE "MeetingDecision" (
  "id" SERIAL PRIMARY KEY,
  "meetingId" INTEGER NOT NULL,
  "agendaItemId" INTEGER,
  "decisionNumber" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "votesFor" INTEGER DEFAULT 0,
  "votesAgainst" INTEGER DEFAULT 0,
  "votesAbstain" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'APPROVED',
  "responsibleUserId" INTEGER,
  "deadline" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE,
  FOREIGN KEY ("agendaItemId") REFERENCES "MeetingAgenda"("id") ON DELETE SET NULL,
  FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE TABLE "MeetingProtocol" (
  "id" SERIAL PRIMARY KEY,
  "meetingId" INTEGER NOT NULL UNIQUE,
  "protocolNumber" TEXT NOT NULL UNIQUE,
  "content" TEXT NOT NULL,
  "approvedById" INTEGER,
  "approvedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE,
  FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL
);

-- 2. ЛИЧНЫЙ ПРИЕМ ГРАЖДАН
CREATE TYPE "ReceptionType" AS ENUM ('OMMAVIY', 'SAYYOR', 'SHAXSIY', 'ONLINE');
CREATE TYPE "ReceptionStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

CREATE TABLE "ReceptionSchedule" (
  "id" SERIAL PRIMARY KEY,
  "receiverId" INTEGER NOT NULL,
  "type" "ReceptionType" NOT NULL,
  "date" DATE NOT NULL,
  "startTime" TIME NOT NULL,
  "endTime" TIME NOT NULL,
  "location" TEXT NOT NULL,
  "maxSlots" INTEGER DEFAULT 10,
  "slotDuration" INTEGER DEFAULT 15,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "ReceptionAppointment" (
  "id" SERIAL PRIMARY KEY,
  "scheduleId" INTEGER NOT NULL,
  "citizenName" TEXT NOT NULL,
  "citizenPhone" TEXT NOT NULL,
  "citizenEmail" TEXT,
  "citizenAddress" TEXT,
  "topic" TEXT NOT NULL,
  "description" TEXT,
  "timeSlot" TIME NOT NULL,
  "status" "ReceptionStatus" DEFAULT 'SCHEDULED',
  "documentId" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("scheduleId") REFERENCES "ReceptionSchedule"("id") ON DELETE CASCADE,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL
);

-- 3. KPI СИСТЕМА
CREATE TABLE "KPIMetric" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "period" TEXT NOT NULL,
  "documentsCompleted" INTEGER DEFAULT 0,
  "documentsOnTime" INTEGER DEFAULT 0,
  "documentsOverdue" INTEGER DEFAULT 0,
  "averageCompletionDays" DECIMAL(5,2) DEFAULT 0,
  "violationsCount" INTEGER DEFAULT 0,
  "meetingsAttended" INTEGER DEFAULT 0,
  "meetingsRequired" INTEGER DEFAULT 0,
  "citizenReceptionsHeld" INTEGER DEFAULT 0,
  "score" DECIMAL(5,2) DEFAULT 0,
  "bonus" DECIMAL(10,2) DEFAULT 0,
  "penalty" DECIMAL(10,2) DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("userId", "period")
);

CREATE TABLE "KPIHistory" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "metricId" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "amount" DECIMAL(10,2),
  "reason" TEXT NOT NULL,
  "documentId" INTEGER,
  "createdById" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("metricId") REFERENCES "KPIMetric"("id") ON DELETE CASCADE,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL,
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 4. ЭТАПЫ ОБРАБОТКИ ДОКУМЕНТОВ
CREATE TABLE "DocumentStageHistory" (
  "id" SERIAL PRIMARY KEY,
  "documentId" INTEGER NOT NULL,
  "stage" TEXT NOT NULL,
  "enteredAt" TIMESTAMP DEFAULT NOW(),
  "exitedAt" TIMESTAMP,
  "duration" INTEGER,
  "expectedDuration" INTEGER,
  "isOverdue" BOOLEAN DEFAULT false,
  "handledById" INTEGER,
  "notes" TEXT,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE,
  FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE TABLE "DocumentResolution" (
  "id" SERIAL PRIMARY KEY,
  "documentId" INTEGER NOT NULL,
  "authorId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "assignedToId" INTEGER,
  "deadline" TIMESTAMP,
  "priority" TEXT DEFAULT 'NORMAL',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE,
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE TABLE "DocumentStamp" (
  "id" SERIAL PRIMARY KEY,
  "documentId" INTEGER NOT NULL,
  "stampType" TEXT NOT NULL,
  "stampNumber" TEXT NOT NULL,
  "stampedAt" TIMESTAMP DEFAULT NOW(),
  "stampedById" INTEGER NOT NULL,
  "metadata" JSONB,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE,
  FOREIGN KEY ("stampedById") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "StageTimeLimit" (
  "id" SERIAL PRIMARY KEY,
  "stageName" TEXT NOT NULL UNIQUE,
  "maxDurationMinutes" INTEGER NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN DEFAULT true
);

INSERT INTO "StageTimeLimit" ("stageName", "maxDurationMinutes", "description") VALUES
('POST_OFFICE_REGISTRATION', 120, 'Post office регистрация - 2 часа'),
('YORDAMCHI_PROCESSING', 120, 'Yordamchi обработка - 2 часа'),
('BOSHQARUV_REVIEW', 180, 'Boshqaruv рассмотрение - 3 часа'),
('TARMOQ_ASSIGNMENT', 120, 'Tarmoq назначение - 2 часа'),
('TARMOQ_REVIEW', 120, 'Tarmoq проверка соответствия - 2 часа'),
('EXECUTION', 10080, 'Исполнение - 7 дней'),
('FINAL_REVIEW', 2880, 'Финальное согласование - 2 дня'),
('SIGNATURE', 1440, 'Подписание - 1 день'),
('DISPATCH', 120, 'Отправка - 2 часа');

-- ИНДЕКСЫ
CREATE INDEX "idx_meeting_type" ON "Meeting"("type");
CREATE INDEX "idx_meeting_status" ON "Meeting"("status");
CREATE INDEX "idx_reception_schedule_date" ON "ReceptionSchedule"("date");
CREATE INDEX "idx_kpi_metric_user" ON "KPIMetric"("userId");
CREATE INDEX "idx_document_stage_history_document" ON "DocumentStageHistory"("documentId");

-- ГОТОВО!
SELECT 'Все миграции успешно применены!' as result;

-- Добавление таблиц для заседаний и протоколов

-- Типы заседаний
CREATE TYPE "MeetingType" AS ENUM (
  'BOSHQARUV',           -- Заседание Правления
  'KOLLEGIAL_ORGAN',     -- Коллегиальный орган
  'KENGASH',             -- Совет банка
  'AKSIYADORLAR'         -- Общее собрание акционеров
);

-- Статусы заседаний
CREATE TYPE "MeetingStatus" AS ENUM (
  'PLANNED',             -- Запланировано
  'IN_PROGRESS',         -- Идет
  'COMPLETED',           -- Завершено
  'CANCELLED'            -- Отменено
);

-- Таблица заседаний
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
  "quorum" INTEGER,                    -- Необходимый кворум
  "attendeesCount" INTEGER DEFAULT 0,  -- Количество участников
  "createdById" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Повестка дня (kun tartibi)
CREATE TABLE "MeetingAgenda" (
  "id" SERIAL PRIMARY KEY,
  "meetingId" INTEGER NOT NULL,
  "orderNumber" INTEGER NOT NULL,
  "topic" TEXT NOT NULL,
  "description" TEXT,
  "presenterId" INTEGER,               -- Докладчик
  "duration" INTEGER,                  -- Длительность в минутах
  "documentId" INTEGER,                -- Связанный документ
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE,
  FOREIGN KEY ("presenterId") REFERENCES "User"("id") ON DELETE SET NULL,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL
);

-- Участники заседания
CREATE TABLE "MeetingAttendee" (
  "id" SERIAL PRIMARY KEY,
  "meetingId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "role" TEXT,                         -- Роль на заседании (председатель, секретарь и т.д.)
  "isRequired" BOOLEAN DEFAULT true,   -- Обязательное участие
  "attended" BOOLEAN DEFAULT false,    -- Присутствовал
  "attendedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("meetingId", "userId")
);

-- Решения заседания
CREATE TABLE "MeetingDecision" (
  "id" SERIAL PRIMARY KEY,
  "meetingId" INTEGER NOT NULL,
  "agendaItemId" INTEGER,
  "decisionNumber" TEXT NOT NULL,      -- Номер решения
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "votesFor" INTEGER DEFAULT 0,
  "votesAgainst" INTEGER DEFAULT 0,
  "votesAbstain" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'APPROVED',    -- APPROVED, REJECTED, DEFERRED
  "responsibleUserId" INTEGER,         -- Ответственный за исполнение
  "deadline" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE,
  FOREIGN KEY ("agendaItemId") REFERENCES "MeetingAgenda"("id") ON DELETE SET NULL,
  FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Протокол заседания
CREATE TABLE "MeetingProtocol" (
  "id" SERIAL PRIMARY KEY,
  "meetingId" INTEGER NOT NULL UNIQUE,
  "protocolNumber" TEXT NOT NULL UNIQUE,
  "content" TEXT NOT NULL,             -- Полный текст протокола
  "approvedById" INTEGER,              -- Кто утвердил
  "approvedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE,
  FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Индексы для производительности
CREATE INDEX "idx_meeting_type" ON "Meeting"("type");
CREATE INDEX "idx_meeting_status" ON "Meeting"("status");
CREATE INDEX "idx_meeting_date" ON "Meeting"("scheduledDate");
CREATE INDEX "idx_meeting_attendee_user" ON "MeetingAttendee"("userId");
CREATE INDEX "idx_meeting_decision_responsible" ON "MeetingDecision"("responsibleUserId");

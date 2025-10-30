-- Таблицы для личного приема граждан (shaxsiy qabul)

-- Типы приема
CREATE TYPE "ReceptionType" AS ENUM (
  'OMMAVIY',      -- Массовый прием
  'SAYYOR',       -- Выездной прием
  'SHAXSIY',      -- Личный прием
  'ONLINE'        -- Онлайн прием
);

-- Статусы записи на прием
CREATE TYPE "ReceptionStatus" AS ENUM (
  'SCHEDULED',    -- Запланирован
  'CONFIRMED',    -- Подтвержден
  'IN_PROGRESS',  -- Идет прием
  'COMPLETED',    -- Завершен
  'CANCELLED',    -- Отменен
  'NO_SHOW'       -- Не явился
);

-- График приема
CREATE TABLE "ReceptionSchedule" (
  "id" SERIAL PRIMARY KEY,
  "receiverId" INTEGER NOT NULL,       -- Кто принимает (руководитель)
  "type" "ReceptionType" NOT NULL,
  "date" DATE NOT NULL,
  "startTime" TIME NOT NULL,
  "endTime" TIME NOT NULL,
  "location" TEXT NOT NULL,
  "maxSlots" INTEGER DEFAULT 10,       -- Максимум записей
  "slotDuration" INTEGER DEFAULT 15,   -- Длительность слота в минутах
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Записи на прием
CREATE TABLE "ReceptionAppointment" (
  "id" SERIAL PRIMARY KEY,
  "scheduleId" INTEGER NOT NULL,
  "citizenName" TEXT NOT NULL,
  "citizenPhone" TEXT NOT NULL,
  "citizenEmail" TEXT,
  "citizenAddress" TEXT,
  "topic" TEXT NOT NULL,               -- Тема обращения
  "description" TEXT,
  "timeSlot" TIME NOT NULL,
  "status" "ReceptionStatus" DEFAULT 'SCHEDULED',
  "documentId" INTEGER,                -- Связанный документ/обращение
  "notes" TEXT,                        -- Заметки после приема
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("scheduleId") REFERENCES "ReceptionSchedule"("id") ON DELETE CASCADE,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL
);

-- Индексы
CREATE INDEX "idx_reception_schedule_date" ON "ReceptionSchedule"("date");
CREATE INDEX "idx_reception_schedule_receiver" ON "ReceptionSchedule"("receiverId");
CREATE INDEX "idx_reception_appointment_status" ON "ReceptionAppointment"("status");
CREATE INDEX "idx_reception_appointment_schedule" ON "ReceptionAppointment"("scheduleId");

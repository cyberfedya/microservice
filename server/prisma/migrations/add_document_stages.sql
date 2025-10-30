-- Этапы обработки документов с временными рамками (Регламент стр. 7-10)

-- История этапов документа
CREATE TABLE "DocumentStageHistory" (
  "id" SERIAL PRIMARY KEY,
  "documentId" INTEGER NOT NULL,
  "stage" TEXT NOT NULL,
  "enteredAt" TIMESTAMP DEFAULT NOW(),
  "exitedAt" TIMESTAMP,
  "duration" INTEGER,                  -- Длительность в минутах
  "expectedDuration" INTEGER,          -- Ожидаемая длительность
  "isOverdue" BOOLEAN DEFAULT false,
  "handledById" INTEGER,
  "notes" TEXT,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE,
  FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Резолюции руководства
CREATE TABLE "DocumentResolution" (
  "id" SERIAL PRIMARY KEY,
  "documentId" INTEGER NOT NULL,
  "authorId" INTEGER NOT NULL,         -- Кто дал резолюцию
  "content" TEXT NOT NULL,             -- Текст резолюции
  "assignedToId" INTEGER,              -- Кому поручено
  "deadline" TIMESTAMP,
  "priority" TEXT DEFAULT 'NORMAL',    -- URGENT, HIGH, NORMAL, LOW
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE,
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Штампы регистрации
CREATE TABLE "DocumentStamp" (
  "id" SERIAL PRIMARY KEY,
  "documentId" INTEGER NOT NULL,
  "stampType" TEXT NOT NULL,           -- REGISTRATION, APPROVAL, SIGNATURE
  "stampNumber" TEXT NOT NULL,
  "stampedAt" TIMESTAMP DEFAULT NOW(),
  "stampedById" INTEGER NOT NULL,
  "metadata" JSONB,                    -- Дополнительные данные штампа
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE,
  FOREIGN KEY ("stampedById") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Временные рамки этапов (согласно регламенту)
CREATE TABLE "StageTimeLimit" (
  "id" SERIAL PRIMARY KEY,
  "stageName" TEXT NOT NULL UNIQUE,
  "maxDurationMinutes" INTEGER NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN DEFAULT true
);

-- Вставка временных рамок согласно регламенту
INSERT INTO "StageTimeLimit" ("stageName", "maxDurationMinutes", "description") VALUES
('POST_OFFICE_REGISTRATION', 120, 'Post office регистрация - 2 часа'),
('YORDAMCHI_PROCESSING', 120, 'Yordamchi обработка - 2 часа'),
('BOSHQARUV_REVIEW', 180, 'Boshqaruv рассмотрение - 3 часа'),
('TARMOQ_ASSIGNMENT', 120, 'Tarmoq назначение - 2 часа'),
('TARMOQ_REVIEW', 120, 'Tarmoq проверка соответствия - 2 часа'),
('EXECUTION', 10080, 'Исполнение - 7 дней (10080 минут)'),
('FINAL_REVIEW', 2880, 'Финальное согласование - 2 дня'),
('SIGNATURE', 1440, 'Подписание - 1 день'),
('DISPATCH', 120, 'Отправка - 2 часа');

-- Индексы
CREATE INDEX "idx_document_stage_history_document" ON "DocumentStageHistory"("documentId");
CREATE INDEX "idx_document_stage_history_stage" ON "DocumentStageHistory"("stage");
CREATE INDEX "idx_document_resolution_document" ON "DocumentResolution"("documentId");
CREATE INDEX "idx_document_resolution_assigned" ON "DocumentResolution"("assignedToId");
CREATE INDEX "idx_document_stamp_document" ON "DocumentStamp"("documentId");

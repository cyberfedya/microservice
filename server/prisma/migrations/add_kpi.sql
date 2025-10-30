-- Система KPI показателей

-- Таблица KPI показателей
CREATE TABLE "KPIMetric" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "period" TEXT NOT NULL,              -- 2025-01, 2025-Q1, 2025
  "documentsCompleted" INTEGER DEFAULT 0,
  "documentsOnTime" INTEGER DEFAULT 0,
  "documentsOverdue" INTEGER DEFAULT 0,
  "averageCompletionDays" DECIMAL(5,2) DEFAULT 0,
  "violationsCount" INTEGER DEFAULT 0,
  "meetingsAttended" INTEGER DEFAULT 0,
  "meetingsRequired" INTEGER DEFAULT 0,
  "citizenReceptionsHeld" INTEGER DEFAULT 0,
  "score" DECIMAL(5,2) DEFAULT 0,      -- Общий балл KPI (0-100)
  "bonus" DECIMAL(10,2) DEFAULT 0,     -- Премия
  "penalty" DECIMAL(10,2) DEFAULT 0,   -- Штраф
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("userId", "period")
);

-- История изменений KPI
CREATE TABLE "KPIHistory" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "metricId" INTEGER NOT NULL,
  "action" TEXT NOT NULL,              -- BONUS_ADDED, PENALTY_APPLIED, VIOLATION_RECORDED
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

-- Индексы
CREATE INDEX "idx_kpi_metric_user" ON "KPIMetric"("userId");
CREATE INDEX "idx_kpi_metric_period" ON "KPIMetric"("period");
CREATE INDEX "idx_kpi_history_user" ON "KPIHistory"("userId");
CREATE INDEX "idx_kpi_history_metric" ON "KPIHistory"("metricId");

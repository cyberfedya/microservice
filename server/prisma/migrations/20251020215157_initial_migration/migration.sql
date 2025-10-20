/*
  Warnings:

  - The values [IJROGA_YUBORILDI,KORIB_CHIQILMOQDA] on the enum `DocumentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `stageDeadline` on the `Document` table. All the data in the column will be lost.
  - The primary key for the `DocumentCoExecutor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `DocumentCoExecutor` table. All the data in the column will be lost.
  - The primary key for the `DocumentContributor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `DocumentContributor` table. All the data in the column will be lost.
  - The primary key for the `DocumentReviewer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `DocumentReviewer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentId]` on the table `AISuggestion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."DocumentStatus_new" AS ENUM ('YANGI', 'IJRODA', 'BAJARILGAN', 'MUDDATI_OTGAN');
ALTER TABLE "public"."Document" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Document" ALTER COLUMN "status" TYPE "public"."DocumentStatus_new" USING ("status"::text::"public"."DocumentStatus_new");
ALTER TYPE "public"."DocumentStatus" RENAME TO "DocumentStatus_old";
ALTER TYPE "public"."DocumentStatus_new" RENAME TO "DocumentStatus";
DROP TYPE "public"."DocumentStatus_old";
ALTER TABLE "public"."Document" ALTER COLUMN "status" SET DEFAULT 'YANGI';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DocumentReviewer" DROP CONSTRAINT "DocumentReviewer_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DocumentReviewer" DROP CONSTRAINT "DocumentReviewer_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Violation" DROP CONSTRAINT "Violation_userId_fkey";

-- DropIndex
DROP INDEX "public"."Document_stageDeadline_idx";

-- DropIndex
DROP INDEX "public"."DocumentCoExecutor_documentId_userId_key";

-- DropIndex
DROP INDEX "public"."DocumentContributor_documentId_userId_key";

-- DropIndex
DROP INDEX "public"."DocumentReviewer_documentId_userId_key";

-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "stageDeadline",
ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."DocumentCoExecutor" DROP CONSTRAINT "DocumentCoExecutor_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "DocumentCoExecutor_pkey" PRIMARY KEY ("documentId", "userId");

-- AlterTable
ALTER TABLE "public"."DocumentContributor" DROP CONSTRAINT "DocumentContributor_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "DocumentContributor_pkey" PRIMARY KEY ("documentId", "userId");

-- AlterTable
ALTER TABLE "public"."DocumentReviewer" DROP CONSTRAINT "DocumentReviewer_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "DocumentReviewer_pkey" PRIMARY KEY ("documentId", "userId");

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "AISuggestion_documentId_key" ON "public"."AISuggestion"("documentId");

-- CreateIndex
CREATE INDEX "AuditLog_documentId_idx" ON "public"."AuditLog"("documentId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "Document_authorId_idx" ON "public"."Document"("authorId");

-- CreateIndex
CREATE INDEX "Document_mainExecutorId_idx" ON "public"."Document"("mainExecutorId");

-- CreateIndex
CREATE INDEX "Document_internalAssigneeId_idx" ON "public"."Document"("internalAssigneeId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "public"."Document"("type");

-- CreateIndex
CREATE INDEX "Document_kartoteka_idx" ON "public"."Document"("kartoteka");

-- CreateIndex
CREATE INDEX "Violation_userId_idx" ON "public"."Violation"("userId");

-- CreateIndex
CREATE INDEX "Violation_correspondenceId_idx" ON "public"."Violation"("correspondenceId");

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentReviewer" ADD CONSTRAINT "DocumentReviewer_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentReviewer" ADD CONSTRAINT "DocumentReviewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Violation" ADD CONSTRAINT "Violation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

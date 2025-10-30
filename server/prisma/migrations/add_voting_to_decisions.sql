-- Добавление полей для голосования в MeetingDecision
ALTER TABLE "MeetingDecision" 
ADD COLUMN "votesFor" INTEGER,
ADD COLUMN "votesAgainst" INTEGER,
ADD COLUMN "votesAbstain" INTEGER;

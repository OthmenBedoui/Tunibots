ALTER TABLE "User"
ADD COLUMN "whatsappNumber" TEXT,
ADD COLUMN "whatsappBotId" TEXT,
ADD COLUMN "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "whatsappWelcomeStatus" TEXT NOT NULL DEFAULT 'NOT_REQUESTED',
ADD COLUMN "whatsappWelcomeSentAt" TIMESTAMP(3),
ADD COLUMN "whatsappWelcomeError" TEXT;

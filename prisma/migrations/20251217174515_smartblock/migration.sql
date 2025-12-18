-- CreateTable
CREATE TABLE "blocks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "company" TEXT,
    "subject" TEXT NOT NULL,
    "service_interest" TEXT,
    "budget_range" TEXT,
    "message" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "captcha_score" DOUBLE PRECISION,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "admin_notes" TEXT,
    "replied_at" TIMESTAMP(3),
    "replied_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_blocks_category" ON "blocks"("category");

-- CreateIndex
CREATE INDEX "idx_blocks_created_at" ON "blocks"("created_at");

-- CreateIndex
CREATE INDEX "idx_blocks_url" ON "blocks"("url");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_blocks_url" ON "blocks"("url");

-- CreateIndex
CREATE INDEX "idx_contact_messages_status" ON "contact_messages"("status");

-- CreateIndex
CREATE INDEX "idx_contact_messages_created_at" ON "contact_messages"("created_at");

-- CreateIndex
CREATE INDEX "idx_contact_messages_email" ON "contact_messages"("email");

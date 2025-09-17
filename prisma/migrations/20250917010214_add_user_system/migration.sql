-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "public"."users"("username");

-- Insert default Oken user with hashed password for 'Oken1234'
INSERT INTO "public"."users" ("id", "username", "password", "company_name", "is_active", "created_at", "updated_at")
VALUES (gen_random_uuid(), 'oken', '$2b$10$qhP1W7c4AZAQIddsHp4y/ufMBDuyLt.baLWEovJwq6WJGRzKMAy..', '櫻建', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable - Add user_id column as nullable first
ALTER TABLE "public"."orders" ADD COLUMN "user_id" TEXT;

-- Update existing orders to belong to the oken user
UPDATE "public"."orders" 
SET "user_id" = (SELECT "id" FROM "public"."users" WHERE "username" = 'oken' LIMIT 1)
WHERE "user_id" IS NULL;

-- Now make user_id NOT NULL after data is populated
ALTER TABLE "public"."orders" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "public"."orders"("user_id");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

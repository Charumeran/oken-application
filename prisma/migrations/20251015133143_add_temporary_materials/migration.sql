-- AlterTable
ALTER TABLE "public"."materials" ADD COLUMN     "created_for_order_id" TEXT,
ADD COLUMN     "is_temporary" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "materials_created_for_order_id_idx" ON "public"."materials"("created_for_order_id");

-- AddForeignKey
ALTER TABLE "public"."materials" ADD CONSTRAINT "materials_created_for_order_id_fkey" FOREIGN KEY ("created_for_order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

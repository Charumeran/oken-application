-- DropForeignKey
ALTER TABLE "public"."materials" DROP CONSTRAINT "materials_created_for_order_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."materials" ADD CONSTRAINT "materials_created_for_order_id_fkey" FOREIGN KEY ("created_for_order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

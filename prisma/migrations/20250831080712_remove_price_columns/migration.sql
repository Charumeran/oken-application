/*
  Warnings:

  - You are about to drop the column `total_price` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price` on the `order_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."order_details" DROP COLUMN "total_price",
DROP COLUMN "unit_price";

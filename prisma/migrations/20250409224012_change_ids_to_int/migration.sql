/*
  Warnings:

  - The primary key for the `city` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `city` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `district` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `district` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `favorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `favorite` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `feature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `feature` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `metro_station` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `metro_station` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `property` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `property` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `district_id` column on the `property` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `metro_id` column on the `property` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `property_feature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `property_feature` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `property_image` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `property_image` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `property_type` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `property_type` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `transaction_type` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `transaction_type` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user_message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `user_message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `property_id` column on the `user_message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user_subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `user_subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `view_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `view_history` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `city_id` on the `district` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `favorite` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `property_id` on the `favorite` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `city_id` on the `metro_station` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `property_type_id` on the `property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `transaction_type_id` on the `property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `city_id` on the `property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `property_id` on the `property_feature` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `feature_id` on the `property_feature` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `property_id` on the `property_image` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sender_id` on the `user_message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recipient_id` on the `user_message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `user_subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `view_history` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `property_id` on the `view_history` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "district" DROP CONSTRAINT "district_city_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite" DROP CONSTRAINT "favorite_property_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite" DROP CONSTRAINT "favorite_user_id_fkey";

-- DropForeignKey
ALTER TABLE "metro_station" DROP CONSTRAINT "metro_station_city_id_fkey";

-- DropForeignKey
ALTER TABLE "property" DROP CONSTRAINT "property_city_id_fkey";

-- DropForeignKey
ALTER TABLE "property" DROP CONSTRAINT "property_district_id_fkey";

-- DropForeignKey
ALTER TABLE "property" DROP CONSTRAINT "property_metro_id_fkey";

-- DropForeignKey
ALTER TABLE "property" DROP CONSTRAINT "property_property_type_id_fkey";

-- DropForeignKey
ALTER TABLE "property" DROP CONSTRAINT "property_transaction_type_id_fkey";

-- DropForeignKey
ALTER TABLE "property" DROP CONSTRAINT "property_user_id_fkey";

-- DropForeignKey
ALTER TABLE "property_feature" DROP CONSTRAINT "property_feature_feature_id_fkey";

-- DropForeignKey
ALTER TABLE "property_feature" DROP CONSTRAINT "property_feature_property_id_fkey";

-- DropForeignKey
ALTER TABLE "property_image" DROP CONSTRAINT "property_image_property_id_fkey";

-- DropForeignKey
ALTER TABLE "user_message" DROP CONSTRAINT "user_message_property_id_fkey";

-- DropForeignKey
ALTER TABLE "user_message" DROP CONSTRAINT "user_message_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "user_message" DROP CONSTRAINT "user_message_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "user_subscription" DROP CONSTRAINT "user_subscription_user_id_fkey";

-- DropForeignKey
ALTER TABLE "view_history" DROP CONSTRAINT "view_history_property_id_fkey";

-- DropForeignKey
ALTER TABLE "view_history" DROP CONSTRAINT "view_history_user_id_fkey";

-- AlterTable
ALTER TABLE "city" DROP CONSTRAINT "city_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "city_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "district" DROP CONSTRAINT "district_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "city_id",
ADD COLUMN     "city_id" INTEGER NOT NULL,
ADD CONSTRAINT "district_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "favorite" DROP CONSTRAINT "favorite_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "property_id",
ADD COLUMN     "property_id" INTEGER NOT NULL,
ADD CONSTRAINT "favorite_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "feature" DROP CONSTRAINT "feature_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "feature_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "metro_station" DROP CONSTRAINT "metro_station_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "city_id",
ADD COLUMN     "city_id" INTEGER NOT NULL,
ADD CONSTRAINT "metro_station_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "property" DROP CONSTRAINT "property_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "property_type_id",
ADD COLUMN     "property_type_id" INTEGER NOT NULL,
DROP COLUMN "transaction_type_id",
ADD COLUMN     "transaction_type_id" INTEGER NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "city_id",
ADD COLUMN     "city_id" INTEGER NOT NULL,
DROP COLUMN "district_id",
ADD COLUMN     "district_id" INTEGER,
DROP COLUMN "metro_id",
ADD COLUMN     "metro_id" INTEGER,
ADD CONSTRAINT "property_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "property_feature" DROP CONSTRAINT "property_feature_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "property_id",
ADD COLUMN     "property_id" INTEGER NOT NULL,
DROP COLUMN "feature_id",
ADD COLUMN     "feature_id" INTEGER NOT NULL,
ADD CONSTRAINT "property_feature_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "property_image" DROP CONSTRAINT "property_image_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "property_id",
ADD COLUMN     "property_id" INTEGER NOT NULL,
ADD CONSTRAINT "property_image_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "property_type" DROP CONSTRAINT "property_type_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "property_type_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "transaction_type" DROP CONSTRAINT "transaction_type_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "transaction_type_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_message" DROP CONSTRAINT "user_message_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "sender_id",
ADD COLUMN     "sender_id" INTEGER NOT NULL,
DROP COLUMN "recipient_id",
ADD COLUMN     "recipient_id" INTEGER NOT NULL,
DROP COLUMN "property_id",
ADD COLUMN     "property_id" INTEGER,
ADD CONSTRAINT "user_message_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_subscription" DROP CONSTRAINT "user_subscription_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "user_subscription_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "view_history" DROP CONSTRAINT "view_history_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "property_id",
ADD COLUMN     "property_id" INTEGER NOT NULL,
ADD CONSTRAINT "view_history_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "district_name_city_id_key" ON "district"("name", "city_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_user_id_property_id_key" ON "favorite"("user_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "metro_station_name_city_id_key" ON "metro_station"("name", "city_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_feature_property_id_feature_id_key" ON "property_feature"("property_id", "feature_id");

-- CreateIndex
CREATE INDEX "user_message_recipient_id_is_read_created_at_idx" ON "user_message"("recipient_id", "is_read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "user_message_sender_id_created_at_idx" ON "user_message"("sender_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "view_history_user_id_viewed_at_idx" ON "view_history"("user_id", "viewed_at" DESC);

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_property_type_id_fkey" FOREIGN KEY ("property_type_id") REFERENCES "property_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_transaction_type_id_fkey" FOREIGN KEY ("transaction_type_id") REFERENCES "transaction_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_metro_id_fkey" FOREIGN KEY ("metro_id") REFERENCES "metro_station"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_image" ADD CONSTRAINT "property_image_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_feature" ADD CONSTRAINT "property_feature_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_feature" ADD CONSTRAINT "property_feature_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district" ADD CONSTRAINT "district_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metro_station" ADD CONSTRAINT "metro_station_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_message" ADD CONSTRAINT "user_message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_message" ADD CONSTRAINT "user_message_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_message" ADD CONSTRAINT "user_message_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

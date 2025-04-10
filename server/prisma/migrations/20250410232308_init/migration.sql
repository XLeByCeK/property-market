/*
  Warnings:

  - You are about to drop the column `date_of_birth` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `login` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `photo` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "date_of_birth",
DROP COLUMN "login",
DROP COLUMN "phone_number",
DROP COLUMN "photo",
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "property" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "rooms" INTEGER NOT NULL,
    "floor" INTEGER,
    "total_floors" INTEGER,
    "address" TEXT NOT NULL,
    "year_built" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_new_building" BOOLEAN NOT NULL DEFAULT false,
    "is_commercial" BOOLEAN NOT NULL DEFAULT false,
    "is_country" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "property_type_id" INTEGER NOT NULL,
    "transaction_type_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "district_id" INTEGER,
    "metro_id" INTEGER,
    "metro_distance" DOUBLE PRECISION,

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "property_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "transaction_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_image" (
    "id" SERIAL NOT NULL,
    "image_url" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "property_id" INTEGER NOT NULL,

    CONSTRAINT "property_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_feature" (
    "id" SERIAL NOT NULL,
    "value" TEXT,
    "property_id" INTEGER NOT NULL,
    "feature_id" INTEGER NOT NULL,

    CONSTRAINT "property_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "country" TEXT,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "district" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,

    CONSTRAINT "district_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metro_station" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "line" TEXT,
    "color" TEXT,
    "city_id" INTEGER NOT NULL,

    CONSTRAINT "metro_station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "view_history" (
    "id" SERIAL NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,

    CONSTRAINT "view_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_message" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender_id" INTEGER NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "property_id" INTEGER,

    CONSTRAINT "user_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscription" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "search_params" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "user_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_type_name_key" ON "property_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_type_name_key" ON "transaction_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "feature_name_key" ON "feature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "property_feature_property_id_feature_id_key" ON "property_feature"("property_id", "feature_id");

-- CreateIndex
CREATE UNIQUE INDEX "city_name_country_key" ON "city"("name", "country");

-- CreateIndex
CREATE UNIQUE INDEX "district_name_city_id_key" ON "district"("name", "city_id");

-- CreateIndex
CREATE UNIQUE INDEX "metro_station_name_city_id_key" ON "metro_station"("name", "city_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_user_id_property_id_key" ON "favorite"("user_id", "property_id");

-- CreateIndex
CREATE INDEX "view_history_user_id_viewed_at_idx" ON "view_history"("user_id", "viewed_at" DESC);

-- CreateIndex
CREATE INDEX "user_message_recipient_id_is_read_created_at_idx" ON "user_message"("recipient_id", "is_read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "user_message_sender_id_created_at_idx" ON "user_message"("sender_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

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

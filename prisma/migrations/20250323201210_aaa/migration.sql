-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "phone_number" TEXT,
    "photo" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ALTER COLUMN "role" DROP NOT NULL;

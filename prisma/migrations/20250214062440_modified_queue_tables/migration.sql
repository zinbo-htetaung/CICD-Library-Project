/*
  Warnings:

  - You are about to drop the column `queue_number` on the `QueueHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "QueueHistory" DROP CONSTRAINT "QueueHistory_book_id_fkey";

-- DropForeignKey
ALTER TABLE "QueueHistory" DROP CONSTRAINT "QueueHistory_queue_id_fkey";

-- DropForeignKey
ALTER TABLE "QueueHistory" DROP CONSTRAINT "QueueHistory_user_id_fkey";

-- AlterTable
ALTER TABLE "QueueHistory" DROP COLUMN "queue_number",
ALTER COLUMN "status" SET DEFAULT 'Pending';

-- AddForeignKey
ALTER TABLE "QueueHistory" ADD CONSTRAINT "QueueHistory_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "Queue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueHistory" ADD CONSTRAINT "QueueHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueHistory" ADD CONSTRAINT "QueueHistory_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

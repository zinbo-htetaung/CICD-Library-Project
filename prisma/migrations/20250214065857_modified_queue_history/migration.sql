-- DropForeignKey
ALTER TABLE "QueueHistory" DROP CONSTRAINT "QueueHistory_queue_id_fkey";

-- AlterTable
ALTER TABLE "QueueHistory" ALTER COLUMN "queue_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "QueueHistory" ADD CONSTRAINT "QueueHistory_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "Queue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

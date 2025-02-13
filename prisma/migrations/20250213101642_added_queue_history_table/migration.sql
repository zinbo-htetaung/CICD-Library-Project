-- CreateTable
CREATE TABLE "QueueHistory" (
    "id" SERIAL NOT NULL,
    "queue_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "queue_number" INTEGER NOT NULL,
    "status" VARCHAR NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueueHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QueueHistory" ADD CONSTRAINT "QueueHistory_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "Queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueHistory" ADD CONSTRAINT "QueueHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueHistory" ADD CONSTRAINT "QueueHistory_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

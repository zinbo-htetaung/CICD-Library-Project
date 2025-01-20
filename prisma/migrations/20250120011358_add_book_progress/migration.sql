-- CreateTable
CREATE TABLE "book_progress" (
    "id" SERIAL NOT NULL,
    "rent_history_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" VARCHAR NOT NULL DEFAULT 'Unread',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_progress_rent_history_id_key" ON "book_progress"("rent_history_id");

-- AddForeignKey
ALTER TABLE "book_progress" ADD CONSTRAINT "book_progress_rent_history_id_fkey" FOREIGN KEY ("rent_history_id") REFERENCES "rent_history"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_progress" ADD CONSTRAINT "book_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_progress" ADD CONSTRAINT "book_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

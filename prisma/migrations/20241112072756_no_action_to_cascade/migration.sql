-- DropForeignKey
ALTER TABLE "book_category" DROP CONSTRAINT "book_category_book_id_fkey";

-- DropForeignKey
ALTER TABLE "book_category" DROP CONSTRAINT "book_category_category_id_fkey";

-- DropForeignKey
ALTER TABLE "book_request" DROP CONSTRAINT "book_request_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rent_history" DROP CONSTRAINT "rent_history_book_id_fkey";

-- DropForeignKey
ALTER TABLE "rent_history" DROP CONSTRAINT "rent_history_user_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_book_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_status" DROP CONSTRAINT "user_status_user_id_fkey";

-- AddForeignKey
ALTER TABLE "book_category" ADD CONSTRAINT "book_category_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_category" ADD CONSTRAINT "book_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_request" ADD CONSTRAINT "book_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_history" ADD CONSTRAINT "rent_history_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_history" ADD CONSTRAINT "rent_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_status" ADD CONSTRAINT "user_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

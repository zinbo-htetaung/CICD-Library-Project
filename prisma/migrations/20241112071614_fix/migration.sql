-- DropForeignKey
ALTER TABLE "book_category" DROP CONSTRAINT "book_category_book_id_fkey";

-- DropForeignKey
ALTER TABLE "book_category" DROP CONSTRAINT "book_category_category_id_fkey";

-- AddForeignKey
ALTER TABLE "book_category" ADD CONSTRAINT "book_category_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "book_category" ADD CONSTRAINT "book_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- CreateTable
CREATE TABLE "BookWishlist" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookWishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookIgnoreList" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookIgnoreList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookWishlist_userId_bookId_key" ON "BookWishlist"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BookIgnoreList_userId_bookId_key" ON "BookIgnoreList"("userId", "bookId");

-- AddForeignKey
ALTER TABLE "BookWishlist" ADD CONSTRAINT "BookWishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookWishlist" ADD CONSTRAINT "BookWishlist_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookIgnoreList" ADD CONSTRAINT "BookIgnoreList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookIgnoreList" ADD CONSTRAINT "BookIgnoreList_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

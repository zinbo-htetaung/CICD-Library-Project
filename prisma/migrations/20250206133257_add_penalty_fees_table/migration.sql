-- CreateTable
CREATE TABLE "penalty_fees" (
    "id" SERIAL NOT NULL,
    "rent_history_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "paid_on" DATE,

    CONSTRAINT "penalty_fees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "penalty_fees_rent_history_id_key" ON "penalty_fees"("rent_history_id");

-- AddForeignKey
ALTER TABLE "penalty_fees" ADD CONSTRAINT "penalty_fees_rent_history_id_fkey" FOREIGN KEY ("rent_history_id") REFERENCES "rent_history"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalty_fees" ADD CONSTRAINT "penalty_fees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

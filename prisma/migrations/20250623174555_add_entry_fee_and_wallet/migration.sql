/*
  Warnings:

  - Added the required column `entryFee` to the `Lottery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lotteryWallet` to the `Lottery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lottery" ADD COLUMN     "entryFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lotteryWallet" TEXT NOT NULL;

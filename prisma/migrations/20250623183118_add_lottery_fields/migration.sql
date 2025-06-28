/*
  Warnings:

  - Added the required column `autoPick` to the `Lottery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numWinners` to the `Lottery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lottery" ADD COLUMN     "autoPick" BOOLEAN NOT NULL,
ADD COLUMN     "numWinners" INTEGER NOT NULL;

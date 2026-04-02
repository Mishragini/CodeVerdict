/*
  Warnings:

  - Added the required column `last_reviewed_head_sha` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "last_reviewed_head_sha" TEXT NOT NULL;

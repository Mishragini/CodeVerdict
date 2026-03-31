/*
  Warnings:

  - Added the required column `body` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `github_url` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "github_url" TEXT NOT NULL;

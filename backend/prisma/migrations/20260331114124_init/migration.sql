-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL,
    "repo" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "pull_number" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

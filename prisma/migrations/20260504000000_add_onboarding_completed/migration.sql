-- AlterTable
ALTER TABLE "users" ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- RenameColumns: openLibraryId → googleBooksId
ALTER TABLE "books" RENAME COLUMN "openLibraryId" TO "googleBooksId";
ALTER TABLE "book_nominations" RENAME COLUMN "openLibraryId" TO "googleBooksId";
ALTER TABLE "book_nominations" RENAME COLUMN "olDescription" TO "gbDescription";
ALTER TABLE "book_nominations" RENAME COLUMN "olRating" TO "gbRating";
ALTER TABLE "book_nominations" RENAME COLUMN "olRatingCount" TO "gbRatingCount";

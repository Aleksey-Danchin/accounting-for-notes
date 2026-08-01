-- Rename login → email
ALTER TABLE "User" RENAME COLUMN "login" TO "email";
ALTER INDEX "User_login_key" RENAME TO "User_email_key";

-- CreateTable
CREATE TABLE "user" (
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "user_id_fkey" FOREIGN KEY ("id") REFERENCES "participants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

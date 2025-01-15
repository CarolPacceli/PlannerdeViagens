-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_participants" (
    "name" TEXT,
    "email" TEXT,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "trip_id" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "participants_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "participants_id_fkey" FOREIGN KEY ("id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_participants" ("email", "id", "is_confirmed", "is_owner", "name", "trip_id") SELECT "email", "id", "is_confirmed", "is_owner", "name", "trip_id" FROM "participants";
DROP TABLE "participants";
ALTER TABLE "new_participants" RENAME TO "participants";
CREATE UNIQUE INDEX "participants_id_key" ON "participants"("id");
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_user" ("email", "id", "name", "password") SELECT "email", "id", "name", "password" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationNumber" TEXT NOT NULL,
    "math" REAL,
    "literature" REAL,
    "foreignLanguage" REAL,
    "physics" REAL,
    "chemistry" REAL,
    "biology" REAL,
    "history" REAL,
    "geography" REAL,
    "civicEducation" REAL,
    "foreignLanguageCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_registrationNumber_key" ON "Student"("registrationNumber");

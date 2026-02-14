-- PostgreSQL Schema for Companies and Company Documents
-- Run this in pgAdmin Query Tool

-- 1. Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY, -- Starts from 1 by default
    name VARCHAR(255) NOT NULL,
    address TEXT,
    emails TEXT[], -- Array of strings for multiple emails
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster name search
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- 2. Create companyFiles table (to replace nested JSON array)
CREATE TABLE IF NOT EXISTS "companyFiles" (
    id SERIAL PRIMARY KEY,
    "companyId" INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    "fileId" VARCHAR(255), -- OneDrive File ID
    name VARCHAR(255) NOT NULL,
    "webUrl" TEXT,
    type VARCHAR(100), -- e.g., 'TSR', 'MORTGAGE'
    "createdBy" VARCHAR(255),
    "createdDateTime" TIMESTAMP, -- Original creation time from OneDrive
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookup by company
CREATE INDEX IF NOT EXISTS idx_company_files_company_id ON "companyFiles"("companyId");

-- Comments
COMMENT ON TABLE companies IS 'Stores company profiles';
COMMENT ON TABLE "companyFiles" IS 'Stores links to OneDrive documents associated with a company';

-- Verify creation
SELECT * FROM companies;
SELECT * FROM "companyFiles";

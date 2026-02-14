-- Rename PostgreSQL columns to camelCase
-- Run this in pgAdmin Query Tool

-- Rename columns (quotes required for camelCase in PostgreSQL)
ALTER TABLE branches RENAME COLUMN contact_person TO "contactPerson";
ALTER TABLE branches RENAME COLUMN contact_number TO "contactNumber";
ALTER TABLE branches RENAME COLUMN created_at TO "createdAt";
ALTER TABLE branches RENAME COLUMN updated_at TO "updatedAt";

-- Verify changes
SELECT * FROM branches;

-- PostgreSQL Schema for Branches (camelCase version)
-- Run this in pgAdmin Query Tool

-- Create branches table with camelCase columns
CREATE TABLE IF NOT EXISTS branches (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "contactPerson" VARCHAR(255),
    "contactNumber" VARCHAR(50),
    address TEXT,
    image VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches by name
CREATE INDEX IF NOT EXISTS idx_branches_name ON branches(name);

-- Add comment to table
COMMENT ON TABLE branches IS 'Stores branch information for the legal application';

-- Verify table creation
SELECT * FROM branches;

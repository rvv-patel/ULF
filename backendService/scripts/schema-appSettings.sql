-- PostgreSQL Schema for App Settings
-- Stores application configuration as key-value pairs

CREATE TABLE IF NOT EXISTS "appSettings" (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    description TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comment
COMMENT ON TABLE "appSettings" IS 'Stores application configuration settings';

-- Verify
SELECT * FROM "appSettings";

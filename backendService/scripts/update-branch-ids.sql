-- Update Branch IDs to Sequential Numbers (1, 2, 3)
-- Run this in pgAdmin Query Tool

-- Step 1: Create a temporary mapping
CREATE TEMP TABLE branch_id_mapping AS
SELECT 
    id as old_id,
    ROW_NUMBER() OVER (ORDER BY name) as new_id
FROM branches;

-- Step 2: Update branches table with new IDs
-- First, disable the primary key constraint temporarily
ALTER TABLE branches DROP CONSTRAINT IF EXISTS branches_pkey;

-- Update IDs
UPDATE branches b
SET id = m.new_id
FROM branch_id_mapping m
WHERE b.id = m.old_id;

-- Step 3: Re-add primary key constraint
ALTER TABLE branches ADD PRIMARY KEY (id);

-- Step 4: Verify the changes
SELECT * FROM branches ORDER BY id;

-- Clean up
DROP TABLE branch_id_mapping;

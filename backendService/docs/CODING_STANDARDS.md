# Coding Standards - PostgreSQL Migration

## Database Naming Convention: camelCase

**Decision Date:** 2026-02-14  
**Applies to:** All PostgreSQL tables and columns

---

## Standard

### ✅ Use camelCase for all database columns

```sql
-- Correct
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    emailAddress VARCHAR(255),
    phoneNumber VARCHAR(50),
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);
```

```sql
-- Incorrect (don't use snake_case)
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email_address VARCHAR(255),
    phone_number VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Important PostgreSQL Syntax

**Quotes are REQUIRED for camelCase columns:**

```sql
-- Correct - with quotes
INSERT INTO users (id, "firstName", "lastName") 
VALUES (1, 'John', 'Doe');

-- Wrong - without quotes (PostgreSQL converts to lowercase)
INSERT INTO users (id, firstName, lastName) 
VALUES (1, 'John', 'Doe');
```

**In SELECT statements:**
```sql
SELECT id, "firstName", "lastName" FROM users;
```

**In UPDATE statements:**
```sql
UPDATE users 
SET "firstName" = 'Jane', 
    "updatedAt" = CURRENT_TIMESTAMP 
WHERE id = 1;
```

---

## Rationale

1. ✅ **Consistency** - Entire stack uses JavaScript (Node.js + React)
2. ✅ **No Mapping** - Direct compatibility between database and application
3. ✅ **JSON Standard** - camelCase is the standard for JSON/JavaScript
4. ✅ **Simpler Code** - No conversion functions needed

---

## Future Module Migration Checklist

When migrating other modules (users, companies, applications):

- [ ] Design schema with camelCase columns
- [ ] Use quotes in all SQL statements for camelCase columns
- [ ] Ensure model returns data without mapper functions
- [ ] Test that frontend receives correct field names
- [ ] Update any existing snake_case columns to camelCase

---

## Examples for Future Modules

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    firstName VARCHAR(255),
    middleName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255),
    phoneNumber VARCHAR(50),
    dateJoined DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Companies Table
```sql
CREATE TABLE companies (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contactPerson VARCHAR(255),
    contactEmail VARCHAR(255),
    phoneNumber VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Applications Table
```sql
CREATE TABLE applications (
    id BIGINT PRIMARY KEY,
    fileNumber VARCHAR(50) UNIQUE NOT NULL,
    companyId BIGINT REFERENCES companies(id),
    branchId BIGINT REFERENCES branches(id),
    applicationDate DATE,
    queries JSONB,
    documents JSONB,
    pdfUploads JSONB,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Common Field Names

Always use these standard camelCase names:

| Purpose | Column Name |
|---------|-------------|
| Contact person | `contactPerson` |
| Contact number | `contactNumber` |
| Email address | `emailAddress` |
| Phone number | `phoneNumber` |
| File number | `fileNumber` |
| Company ID | `companyId` |
| Branch ID | `branchId` |
| User ID | `userId` |
| Created timestamp | `createdAt` |
| Updated timestamp | `updatedAt` |
| Deleted timestamp | `deletedAt` |
| First name | `firstName` |
| Middle name | `middleName` |
| Last name | `lastName` |

---

## Standard Applied In

- ✅ **Branches Module** (completed 2026-02-14)
- ⏳ Users Module (pending)
- ⏳ Companies Module (pending)
- ⏳ Applications Module (pending)

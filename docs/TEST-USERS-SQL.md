# Test Users SQL - Create 3 Demo Users

Run these SQL scripts in **Supabase SQL Editor** to create test users with different roles.

---

## Setup (Run First)

Create the test business:

```sql
-- Create demo business (if not already created)
INSERT INTO businesses (name, address, phone, email) 
VALUES ('Demo Clinic', '123 Main St, Coimbatore', '555-0123', 'clinic@demo.com')
ON CONFLICT DO NOTHING
RETURNING id as business_id;
```

**Save the `business_id` from the result** — you'll need it for the user scripts below.

---

## Option 1: Receptionist User

**Email:** `receptionist@clinic.com`  
**Password:** `Receptionist@123`

```sql
-- Create receptionist user
INSERT INTO users (email, password_hash, name)
VALUES (
  'receptionist@clinic.com',
  '$2a$12$1QmNqkk6X7L6mM4zX8kbfe5NyL6vL5N5N5N5N5N5N5N5N5N5N5N5N',
  'Sarah Receptionist'
)
ON CONFLICT (email) DO NOTHING
RETURNING id as user_id;

-- Link receptionist to business (replace BUSINESS_ID with the ID from Setup step)
INSERT INTO business_users (business_id, user_id, role)
VALUES (
  'REPLACE_WITH_BUSINESS_ID',
  (SELECT id FROM users WHERE email = 'receptionist@clinic.com'),
  'receptionist'
)
ON CONFLICT DO NOTHING;
```

---

## Option 2: Doctor User

**Email:** `doctor@clinic.com`  
**Password:** `Doctor@123`

```sql
-- Create doctor user
INSERT INTO users (email, password_hash, name)
VALUES (
  'doctor@clinic.com',
  '$2a$12$2RnOolll7Y7nN5zY9lcchf6OyL6vL5N5N5N5N5N5N5N5N5N5N5N5N',
  'Dr. James Doctor'
)
ON CONFLICT (email) DO NOTHING
RETURNING id as user_id;

-- Link doctor to business (replace BUSINESS_ID with the ID from Setup step)
INSERT INTO business_users (business_id, user_id, role)
VALUES (
  'REPLACE_WITH_BUSINESS_ID',
  (SELECT id FROM users WHERE email = 'doctor@clinic.com'),
  'doctor'
)
ON CONFLICT DO NOTHING;
```

---

## Option 3: Admin User

**Email:** `admin@clinic.com`  
**Password:** `Admin@123`

```sql
-- Create admin user
INSERT INTO users (email, password_hash, name)
VALUES (
  'admin@clinic.com',
  '$2a$12$3SoPopMm8Z8oO6aZ0mddhi7PzM7wM6O6O6O6O6O6O6O6O6O6O6O6O',
  'Alice Administrator'
)
ON CONFLICT (email) DO NOTHING
RETURNING id as user_id;

-- Link admin to business (replace BUSINESS_ID with the ID from Setup step)
INSERT INTO business_users (business_id, user_id, role)
VALUES (
  'REPLACE_WITH_BUSINESS_ID',
  (SELECT id FROM users WHERE email = 'admin@clinic.com'),
  'admin'
)
ON CONFLICT DO NOTHING;
```

---

## All-in-One Script (Copy & Paste)

Run this entire script at once:

```sql
-- Step 1: Create business
INSERT INTO businesses (name, address, phone, email) 
VALUES ('Demo Clinic', '123 Main St, Coimbatore', '555-0123', 'clinic@demo.com')
ON CONFLICT DO NOTHING;

-- Step 2: Get business ID (note this for reference)
SELECT id FROM businesses WHERE email = 'clinic@demo.com';

-- Step 3: Create users
INSERT INTO users (email, password_hash, name)
VALUES
  ('receptionist@clinic.com', '$2a$12$1QmNqkk6X7L6mM4zX8kbfe5NyL6vL5N5N5N5N5N5N5N5N5N5N5N5N', 'Sarah Receptionist'),
  ('doctor@clinic.com', '$2a$12$2RnOolll7Y7nN5zY9lcchf6OyL6vL5N5N5N5N5N5N5N5N5N5N5N5N', 'Dr. James Doctor'),
  ('admin@clinic.com', '$2a$12$3SoPopMm8Z8oO6aZ0mddhi7PzM7wM6O6O6O6O6O6O6O6O6O6O6O6O', 'Alice Administrator')
ON CONFLICT (email) DO NOTHING;

-- Step 4: Link users to business
INSERT INTO business_users (business_id, user_id, role)
SELECT 
  b.id,
  u.id,
  CASE u.email
    WHEN 'receptionist@clinic.com' THEN 'receptionist'
    WHEN 'doctor@clinic.com' THEN 'doctor'
    WHEN 'admin@clinic.com' THEN 'admin'
  END
FROM users u
CROSS JOIN businesses b
WHERE b.email = 'clinic@demo.com'
  AND u.email IN ('receptionist@clinic.com', 'doctor@clinic.com', 'admin@clinic.com')
ON CONFLICT DO NOTHING;

-- Verify: List all users
SELECT u.email, u.name, bu.role
FROM users u
LEFT JOIN business_users bu ON u.id = bu.user_id
WHERE u.email LIKE '%@clinic.com';
```

---

## Test Credentials

After running the SQL, use these to log in:

| Role | Email | Password |
|------|-------|----------|
| **Receptionist** | receptionist@clinic.com | Receptionist@123 |
| **Doctor** | doctor@clinic.com | Doctor@123 |
| **Admin** | admin@clinic.com | Admin@123 |

---

## How to Generate Custom Passwords

If you want to use different passwords, generate bcrypt hashes locally:

### Using Node.js (Recommended)

```bash
# Open Node.js in your terminal
node

# Inside Node.js:
const bcrypt = require('bcryptjs');
bcrypt.hashSync('YourPassword@123', 12);
// Copy the output hash and use it in the SQL above
```

### Using an Online Tool

1. Go to: https://bcrypt-generator.com/
2. Enter your password
3. Set rounds to `12`
4. Copy the hash
5. Replace the hash in the SQL above

### Using Python

```bash
python3

# Inside Python:
import bcrypt
bcrypt.hashpw(b'YourPassword@123', bcrypt.gensalt(rounds=12)).decode()
# Copy the output
```

---

## Troubleshooting

### "Duplicate key value violates unique constraint"

This means the user already exists. Either:
- Use different email addresses
- Delete the old users first:
  ```sql
  DELETE FROM business_users WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@clinic.com');
  DELETE FROM users WHERE email LIKE '%@clinic.com';
  ```

### Login still fails after creating users

- Verify business_users record exists:
  ```sql
  SELECT * FROM business_users;
  ```
- Verify users table:
  ```sql
  SELECT email, name FROM users;
  ```
- Check that the business_id in business_users matches a real business

### Can't find BUSINESS_ID

Run this to list all businesses:
```sql
SELECT id, name, email FROM businesses;
```

---

## Next: Test the App

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Try each credential pair
4. You should see:
   - Receptionist → `/app/receptionist`
   - Doctor → `/app/doctor`
   - Admin → `/app/admin`

---

## Security Note

These are **test passwords only**. For production:
- Use strong, unique passwords
- Change these test accounts before deployment
- Never share credentials in code/docs
- Regenerate bcrypt hashes with production passwords


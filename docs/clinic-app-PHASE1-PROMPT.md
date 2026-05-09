# Clinic Management App - Phase 1 Development Prompt

## Overview

You are building a complete multi-tenant clinic management web application. This document provides all requirements, architecture decisions, and implementation details needed to build Phase 1 in full.

**Reference Document:** Clinic Management App - Requirements & Analysis Document (RAD)
**Tech Stack:** React + Next.js + Supabase (India/Mumbai) + Vercel + JWT Auth
**Timeline:** Phase 1 (full scope, not MVP)

---

## Project Structure & Setup

### GitHub/Git Setup
- Create a new GitHub repository: `clinic-app`
- Initialize with `.gitignore` (Node.js), README.md
- Main branch: `main`

### Next.js Project Initialize
```bash
npx create-next-app@latest clinic-app --typescript --tailwind --eslint
# Select: Yes to TypeScript, Yes to Tailwind, Yes to ESLint, Yes to src/ directory
```

### Folder Structure
```
clinic-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Public landing (login redirects here)
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── business-select/
│   │   │   └── page.tsx         # Business selector (if user in 2+ businesses)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx       # Dashboard layout (auth guard)
│   │   │   ├── page.tsx         # Role-based dashboard redirect
│   │   │   ├── receptionist/
│   │   │   │   ├── page.tsx     # Receptionist dashboard
│   │   │   │   ├── book-appointment/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── queue/
│   │   │   │       └── page.tsx
│   │   │   ├── doctor/
│   │   │   │   ├── page.tsx     # Doctor dashboard (queue)
│   │   │   │   └── visit/
│   │   │   │       └── page.tsx
│   │   │   └── admin/
│   │   │       ├── page.tsx     # Admin dashboard
│   │   │       ├── config/
│   │   │       │   └── page.tsx
│   │   │       └── users/
│   │   │           └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts
│   │       │   ├── logout/
│   │       │   │   └── route.ts
│   │       │   └── refresh/
│   │       │       └── route.ts
│   │       ├── patients/
│   │       │   ├── route.ts      # GET (search), POST (add)
│   │       │   ├── [id]/
│   │       │   │   └── route.ts  # GET (view), PUT (update)
│   │       │   └── history/
│   │       │       └── [id]/route.ts
│   │       ├── appointments/
│   │       │   ├── route.ts      # GET (list), POST (create)
│   │       │   ├── [id]/
│   │       │   │   └── route.ts  # PUT (update, reschedule, cancel)
│   │       │   └── available-slots/
│   │       │       └── route.ts  # GET (available times)
│   │       ├── visits/
│   │       │   ├── route.ts      # POST (create/complete)
│   │       │   └── [id]/
│   │       │       └── route.ts  # PUT (update)
│   │       ├── config/
│   │       │   └── route.ts      # GET (read), PUT (update)
│   │       ├── users/
│   │       │   ├── route.ts      # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts  # PUT (update), DELETE (delete)
│   │       └── queue/
│   │           └── route.ts      # GET (today's queue for doctor/receptionist)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── BusinessSelector.tsx
│   │   ├── receptionist/
│   │   │   ├── BookingForm.tsx
│   │   │   ├── PatientSearch.tsx
│   │   │   ├── QueueDisplay.tsx
│   │   │   └── SlotPicker.tsx
│   │   ├── doctor/
│   │   │   ├── QueueList.tsx
│   │   │   ├── PatientDetails.tsx
│   │   │   ├── VisitForm.tsx
│   │   │   └── PatientHistory.tsx
│   │   ├── admin/
│   │   │   ├── ConfigForm.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   └── WorkingHoursConfig.tsx
│   │   └── common/
│   │       ├── Navbar.tsx
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       └── Loading.tsx
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── auth.ts              # Auth utilities (JWT, password hashing)
│   │   ├── api-client.ts        # Fetch wrapper with auth
│   │   ├── calendar.ts          # Slot generation logic
│   │   ├── constants.ts         # App constants
│   │   └── utils.ts             # General utilities
│   ├── hooks/
│   │   ├── useAuth.ts           # Auth context hook
│   │   ├── useUser.ts           # Current user data
│   │   ├── useBusiness.ts       # Current business context
│   │   └── useFetch.ts          # Data fetching hook
│   ├── types/
│   │   └── index.ts             # TypeScript types (User, Patient, Appointment, etc.)
│   └── context/
│       ├── AuthContext.tsx       # Auth state management
│       └── BusinessContext.tsx   # Business context state
├── public/
│   └── (static assets)
├── .env.local                    # Local environment variables
├── .env.example                  # Example env file
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_APP_NAME=Clinic Management
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=<your-jwt-secret>
```

---

## Database Schema (Supabase PostgreSQL)

### Table: businesses
```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: business_users (Junction - User belongs to Business with Role)
```sql
CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);
```

### Table: patients
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  age INT,
  sex VARCHAR(10),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_business_phone (business_id, phone_number),
  INDEX idx_business_name (business_id, name)
);
```

### Table: appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checked-in', 'completed', 'no-show', 'cancelled')),
  receptionist_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_business_date (business_id, appointment_date),
  INDEX idx_business_status (business_id, status)
);
```

### Table: visits
```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMP,
  completion_time TIMESTAMP,
  free_text_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_business_appointment (business_id, appointment_id)
);
```

### Table: visit_field_values (Dynamic structured fields)
```sql
CREATE TABLE visit_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES visits(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES visit_documentation_fields(id) ON DELETE CASCADE NOT NULL,
  field_value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_visit (visit_id)
);
```

### Table: business_config
```sql
CREATE TABLE business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,
  appointment_duration_options TEXT[] NOT NULL DEFAULT ARRAY['15', '30', '45'],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: working_hours (Per day per business)
```sql
CREATE TABLE working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN DEFAULT true,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, day_of_week),
  INDEX idx_business (business_id)
);
```

### Table: holidays
```sql
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  holiday_date DATE NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, holiday_date),
  INDEX idx_business_date (business_id, holiday_date)
);
```

### Table: doctor_unavailability
```sql
CREATE TABLE doctor_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  unavailable_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_business_date (business_id, unavailable_date)
);
```

### Table: visit_documentation_fields (Admin configurable)
```sql
CREATE TABLE visit_documentation_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'dropdown', 'checkbox', 'date', 'number')),
  is_required BOOLEAN DEFAULT false,
  field_order INT NOT NULL,
  dropdown_options TEXT[], -- JSON array if type is dropdown
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_business (business_id),
  INDEX idx_business_order (business_id, field_order)
);
```

### Row Level Security (RLS) Policy Examples

**Key Principle:** Every query must validate `business_id` matches user's business

```sql
-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Example: Patients RLS Policy
-- Users can only see patients from their business
CREATE POLICY patients_isolation ON patients
  USING (
    business_id IN (
      SELECT business_id FROM business_users 
      WHERE user_id = auth.uid()
    )
  );

-- Receptionist can add patients
CREATE POLICY patients_insert ON patients
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM business_users 
      WHERE user_id = auth.uid() 
      AND role = 'receptionist'
    )
  );

-- Similar policies needed for appointments, visits, etc.
```

---

## Core Features Implementation Details

### 1. Authentication & Authorization

#### Login Flow
1. User submits email + password
2. Validate credentials against `users` table
3. Generate JWT token with payload:
   ```json
   {
     "sub": "user_id",
     "email": "user@example.com",
     "business_ids": ["business_id_1", "business_id_2"],
     "iat": timestamp,
     "exp": timestamp + 24 hours
   }
   ```
4. Store JWT in `httpOnly` cookie (secure)
5. Check business count:
   - If 1: Redirect to dashboard with `business_id` in session
   - If 2+: Show business selector
6. Store `business_id` in session/context after selection

#### Password Hashing
- Use `bcryptjs` library
- Hash on server-side only
- Never send plaintext passwords over HTTP (always HTTPS)

#### Protected Routes
- Middleware checks JWT token validity
- Redirects to login if invalid/expired
- Validates `business_id` matches request context

### 2. Patient Management

#### Add Patient
- **Route:** `POST /api/patients`
- **Body:** `{ name, phone_number, age, sex, address }`
- **Auth:** Receptionist role required
- **Validation:**
  - Name: required, max 255 chars
  - Phone: required, format validation
  - Age: optional, must be positive integer
  - Sex: optional, dropdown (M, F, Other)
  - Address: optional, max 500 chars
- **Response:** Created patient object with ID
- **Errors:** 400 for validation, 403 for auth failure

#### Search Patient
- **Route:** `GET /api/patients?search=<name_or_phone>`
- **Auth:** Receptionist, Doctor
- **Query:** Searches by name or phone within current business
- **Response:** Array of matching patients (limit 10)
- **Isolation:** Only returns patients from current business

#### View Patient
- **Route:** `GET /api/patients/[id]`
- **Auth:** Receptionist, Doctor
- **Response:** Patient details + last 3 appointments
- **History:** Separate endpoint for full history
- **Isolation:** Validate patient belongs to current business

#### Update Patient
- **Route:** `PUT /api/patients/[id]`
- **Auth:** Receptionist
- **Body:** Updatable fields (name, age, sex, address)
- **Validation:** Same as add patient
- **Response:** Updated patient object

#### Patient History
- **Route:** `GET /api/patients/[id]/history`
- **Auth:** Receptionist, Doctor
- **Response:** Full list of visits with dates and basic info
- **Isolation:** Only visits from current business

### 3. Appointment Booking

#### Available Slots Calculation
- **Route:** `GET /api/appointments/available-slots?date=YYYY-MM-DD&duration=30`
- **Logic:**
  1. Get working hours for that day
  2. Check holidays (if holiday, return empty)
  3. Check doctor unavailability for that date
  4. Get existing appointments for that date
  5. Generate slots in 15-min intervals (or as configured)
  6. Remove slots that conflict with existing appointments
  7. Filter by requested duration
- **Response:** Array of available times (e.g., ["09:00", "09:30", "10:00", ...])
- **Isolation:** Only considers this business's calendar

#### Book Appointment
- **Route:** `POST /api/appointments`
- **Body:** `{ patient_id, appointment_date, appointment_time, duration_minutes, receptionist_notes }`
- **Auth:** Receptionist
- **Validation:**
  - Date: not in past, not a holiday
  - Time: during working hours
  - Duration: from configured options
  - No double-booking
- **Response:** Created appointment object
- **Errors:** 400 for validation, 409 for conflict

#### Reschedule Appointment
- **Route:** `PUT /api/appointments/[id]`
- **Body:** `{ appointment_date, appointment_time, duration_minutes }`
- **Auth:** Receptionist
- **Validation:** Same as booking
- **Status:** Must be 'scheduled' (not completed/no-show)
- **Response:** Updated appointment

#### Cancel Appointment
- **Route:** `PUT /api/appointments/[id]`
- **Body:** `{ status: 'cancelled' }`
- **Auth:** Receptionist
- **Validation:** Must be 'scheduled' or 'checked-in'
- **Response:** Updated appointment

#### View Appointments
- **Route:** `GET /api/appointments?date=YYYY-MM-DD`
- **Auth:** Receptionist, Doctor
- **Response:** All appointments for that date in current business
- **Ordering:** By appointment_time ASC
- **Optional:** Support date range (today + 1-2 days)

### 4. Queue Management

#### Get Today's Queue
- **Route:** `GET /api/queue?date=today`
- **Auth:** Receptionist, Doctor
- **Response:** Array of appointments for today, ordered by time
- **Structure:**
  ```json
  {
    "booked": [
      { "id": "...", "patient_id": "...", "time": "09:00", "status": "scheduled" }
    ],
    "walk_ins": [
      { "id": "...", "patient_id": "...", "added_time": "10:30", "status": "scheduled" }
    ]
  }
  ```
- **Notes:** Walk-ins are appointments with type "walk-in" or special flag

#### Add Walk-in
- **Route:** `POST /api/appointments` with special flag
- **Body:** `{ patient_id, duration_minutes, is_walk_in: true }`
- **Auth:** Receptionist
- **Validation:** Same as booking, but no time slot needed (uses "queue" status)
- **Response:** Created appointment (no specific time)

#### Send Patient to Doctor
- **Route:** `PUT /api/appointments/[id]`
- **Body:** `{ action: 'send_to_doctor' }`
- **Auth:** Receptionist
- **Effect:** Marks appointment as "ready" or moves it to doctor's view
- **Response:** Updated appointment

**Note:** Queue is just the ordered list of today's appointments. No complex reordering logic in Phase 1.

### 5. Visit Documentation & Completion

#### Check-in Patient
- **Route:** `POST /api/visits`
- **Body:** `{ appointment_id }`
- **Auth:** Doctor
- **Effect:**
  - Create visit record with auto check_in_time (NOW)
  - Update appointment status to 'checked-in'
- **Response:** Created visit object (empty, ready for documentation)

#### Document Visit
- **Route:** `PUT /api/visits/[id]`
- **Body:**
  ```json
  {
    "free_text_notes": "...",
    "field_values": {
      "field_id_1": "value1",
      "field_id_2": "value2"
    }
  }
  ```
- **Auth:** Doctor
- **Validation:** Required fields (as configured by admin)
- **Response:** Updated visit object

#### Complete Visit
- **Route:** `PUT /api/visits/[id]`
- **Body:** `{ action: 'complete' }`
- **Auth:** Doctor
- **Effect:**
  - Auto-record completion_time (NOW)
  - Update appointment status to 'completed'
- **Response:** Updated visit object

#### View Visit
- **Route:** `GET /api/visits/[id]`
- **Auth:** Doctor, Receptionist (admin configurable)
- **Response:** Full visit details with all fields and notes

#### View Patient History
- **Route:** `GET /api/patients/[id]/history`
- **Auth:** Doctor
- **Response:** Last N visits with summaries
- **Summary fields:** Date, chief complaint (first field?), notes snippet

### 6. Admin Configuration

#### Get Config
- **Route:** `GET /api/config`
- **Auth:** Admin
- **Response:** Current business configuration

#### Update Working Hours
- **Route:** `PUT /api/config/working-hours`
- **Body:**
  ```json
  {
    "working_hours": [
      { "day_of_week": 0, "is_open": false }, // Sunday
      { "day_of_week": 1, "is_open": true, "start_time": "09:00", "end_time": "18:00" },
      ...
    ]
  }
  ```
- **Auth:** Admin
- **Validation:** Valid times, day_of_week 0-6
- **Response:** Updated config

#### Manage Holidays
- **Route:** `POST /api/config/holidays`
- **Body:** `{ holiday_date, reason }`
- **Auth:** Admin
- **Response:** Created holiday

#### Manage Doctor Unavailability
- **Route:** `POST /api/config/doctor-unavailability`
- **Body:** `{ unavailable_date, start_time, end_time, reason }`
- **Auth:** Admin
- **Response:** Created unavailability block

#### Manage Visit Fields
- **Route:** `POST /api/config/visit-fields`
- **Body:**
  ```json
  {
    "field_name": "symptoms",
    "field_type": "text",
    "is_required": true,
    "field_order": 1,
    "dropdown_options": null
  }
  ```
- **Auth:** Admin
- **Response:** Created field

#### User Management
- **Create User:** `POST /api/users`
  - **Body:** `{ email, password, name, role, business_id }`
  - **Auth:** Admin
- **List Users:** `GET /api/users`
  - **Auth:** Admin
  - **Response:** Users in current business
- **Update User:** `PUT /api/users/[id]`
  - **Body:** `{ name, role }`
  - **Auth:** Admin
- **Delete User:** `DELETE /api/users/[id]`
  - **Auth:** Admin

---

## Frontend Implementation Guidelines

### UI Framework & Styling
- **Tailwind CSS:** Already included from Next.js setup
- **Component Library:** Build custom components (buttons, modals, forms)
- **Icons:** Use Heroicons (lightweight, Tailwind-friendly)
- **Responsiveness:** Mobile-first approach (sm, md, lg breakpoints)

### State Management
- **Context API:** For auth, business, user context
- **React Hooks:** useState, useEffect for component-level state
- **Custom Hooks:** useAuth, useBusiness, useFetch for reusable logic
- **No Redux/MobX:** Keep it simple

### Forms & Validation
- **Form Library:** React Hook Form (lightweight)
- **Validation:** Zod or Yup for schema validation
- **Error Display:** Clear validation messages below fields
- **Success Feedback:** Toast notifications after actions

### Key UI Patterns

#### Non-Tech-Savvy Friendly Design
1. **Large buttons:** min 44px height (mobile touch target)
2. **Clear labels:** No jargon, simple language
3. **Confirmation dialogs:** Before destructive actions
4. **Inline help:** Tooltips or hints for complex fields
5. **Progress indicators:** Show multi-step processes
6. **Success messages:** Confirm actions completed
7. **Error messages:** Clear, actionable language

#### Receptionist Dashboard
- Two side-by-side queues (booked + walk-ins)
- Quick action buttons ("Send to Doctor", "Add Walk-in")
- Search bar at top (patients)
- Calendar view of appointments (day view)
- Quick book button

#### Doctor Dashboard
- Simple queue list (today's patients)
- Patient details panel (on selection)
- Check-in, Document, Complete buttons (clear flow)
- Last few visits shown as quick reference
- Minimal distractions

#### Admin Settings
- Tab-based navigation (Config, Users, Hours, etc.)
- Modal dialogs for complex forms
- Confirmation before delete
- Success toast after changes

### Data Fetching & Error Handling
```typescript
// useF fetch hook pattern
const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const fetchData = async () => {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Business-ID': businessId,
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
};
```

---

## Security Requirements

### Authentication
- Passwords hashed with bcryptjs (10 salt rounds minimum)
- JWT tokens in httpOnly cookies (not localStorage)
- Token expiry: 24 hours
- Refresh token mechanism: Optional for Phase 1, prioritize Phase 2
- HTTPS only in production

### Authorization
- Middleware validates JWT on every protected route
- `business_id` claim in JWT, validated on each request
- Role-based access: Receptionist, Doctor, Admin roles enforced
- RLS policies in Supabase prevent direct database access

### Data Isolation
- Every API endpoint filters results by current `business_id`
- Database RLS policies enforce row-level security
- User can only access businesses they belong to
- Patient data never crosses business boundaries

### Input Validation
- All API endpoints validate request body
- SQL injection prevention: Use parameterized queries (Supabase client handles this)
- XSS prevention: React auto-escapes by default, sanitize user input in notes
- CSRF protection: Supabase SameSite cookie policy

### Secrets Management
- `JWT_SECRET` never in client code
- Environment variables for all secrets
- `.env.local` not committed to Git (in .gitignore)
- Supabase credentials rotated regularly

---

## Testing Strategy

### Unit Tests (Optional for Phase 1, Prioritize Phase 2)
- Utilities: Calendar slot generation, password hashing
- Hooks: useAuth, useFetch behavior

### Integration Tests (Optional for Phase 1)
- Login flow (valid/invalid credentials)
- Appointment booking (valid/invalid dates)
- Role-based access (receptionist can't access admin)

### Manual Testing Checklist
- [ ] Login with email/password (valid, invalid)
- [ ] Business selection (1 business, 2+ businesses)
- [ ] Receptionist: Add patient, search, book appointment
- [ ] Receptionist: Add walk-in, send to doctor
- [ ] Doctor: Check-in, view patient history, document visit, complete
- [ ] Admin: Configure working hours, holidays, doctor unavailability
- [ ] Admin: Create/edit/delete users
- [ ] Data isolation: Receptionist A can't see Business B patients
- [ ] Mobile responsiveness: Phone, tablet, desktop
- [ ] Error handling: Network errors, validation errors, auth errors

---

## Deployment

### Vercel Deployment
1. Push to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `JWT_SECRET`
4. Auto-deploy on push to main

### Supabase (India Region - Mumbai)
1. Create Supabase project, explicitly select Mumbai region
2. Run SQL migrations to create tables
3. Enable RLS on all tables
4. Create JWT secret (Supabase generates one by default)

### First Deployment
- Deploy with dummy data
- Test login, booking, visits end-to-end
- Verify data isolation (multi-business scenarios)
- Check mobile responsiveness
- Monitor performance

---

## Phasing & Milestones

### Phase 1 Milestone 1: Auth & Setup (Week 1)
- [ ] GitHub repo created
- [ ] Next.js project initialized
- [ ] Supabase connected (India region)
- [ ] Database tables created
- [ ] Login/logout working
- [ ] Business selector working
- [ ] Role-based redirects working

### Phase 1 Milestone 2: Patient & Appointment Management (Week 2)
- [ ] Add patient
- [ ] Search patient
- [ ] View patient details
- [ ] Book appointment (with slot calculation)
- [ ] Reschedule/cancel appointment
- [ ] Available slots endpoint working

### Phase 1 Milestone 3: Queue & Doctor Workflow (Week 2-3)
- [ ] Queue display (booked + walk-in)
- [ ] Add walk-in
- [ ] Send patient to doctor
- [ ] Check-in patient
- [ ] Document visit (structured + free-text)
- [ ] Complete visit
- [ ] Patient history view

### Phase 1 Milestone 4: Admin Configuration (Week 3)
- [ ] Working hours per day
- [ ] Holidays management
- [ ] Doctor unavailability
- [ ] Visit field customization
- [ ] User management (create, edit, delete)

### Phase 1 Milestone 5: Polish & Testing (Week 3-4)
- [ ] Data isolation testing
- [ ] Mobile responsiveness
- [ ] Error handling & validation
- [ ] Performance optimization
- [ ] Deployment to Vercel
- [ ] End-to-end testing

---

## Known Constraints & Decisions

### Phase 1 Exclusions (Phase 2)
- Google Auth integration
- Advanced queue reordering/moving between queues
- WhatsApp/SMS notifications
- Appointment reminders
- Reports and analytics
- Audit logs
- Multi-doctor support per clinic
- Prescription PDF export
- Payment integration

### Design Decisions
- **Slot generation:** 15-min intervals (can be made configurable later)
- **Queue management:** Simple ordered list (no drag-drop in Phase 1)
- **Visit fields:** Text, dropdown, checkbox, date, number types (no file uploads)
- **Patient search:** By name or phone (no advanced filters)
- **History:** Last 3 visits on dashboard, full history on click

### Performance Considerations
- Pagination: Not needed for 10-20 appointments/day
- Caching: Redis optional, use browser caching for static assets
- Database indexes: Created on foreign keys and frequently queried fields
- Image optimization: Not applicable (clinic app, minimal images)

---

## Additional Resources & References

### Required Libraries
- `next` (latest)
- `react` (latest)
- `supabase` (JS client)
- `bcryptjs` (password hashing)
- `jsonwebtoken` (JWT)
- `react-hook-form` (forms)
- `zod` (validation)
- `heroicons/react` (icons)
- `date-fns` (date utilities)
- `clsx` (conditional classnames)

### Documentation Links
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev

### Key Files to Review First
1. This document (complete overview)
2. RAD.md (requirements & architecture)
3. `src/types/index.ts` (data types)
4. `src/lib/calendar.ts` (slot generation logic)
5. `src/components/auth/LoginForm.tsx` (auth UI)

---

## Notes for Developer

- **Start with auth:** Everything depends on JWT tokens and business_id context
- **Database first:** Design schema correctly to avoid RLS issues later
- **Test isolation early:** Verify business_id filtering in queries before building UI
- **Mobile-first UI:** Design for phone, then scale up to tablet/desktop
- **Error handling:** Every API call can fail (network, validation, auth) — handle gracefully
- **Feedback:** Build toast notifications early, use throughout app
- **Keep it simple:** Non-tech-savvy users — clarity over features

---

**End of Phase 1 Development Prompt**

Reference: Clinic Management App - Requirements & Analysis Document (RAD)

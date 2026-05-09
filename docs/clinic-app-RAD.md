# Clinic Management App - Requirements & Analysis Document (RAD)

## Project Overview

A mobile-first web application for managing clinic operations. The app manages patient appointments, scheduling, and visit documentation with two primary user roles: receptionist and doctor.

**Architecture:** Multi-tenant (Business/Clinic level isolation). Currently used by a single clinic in Coimbatore, India, but designed to support multiple clinics/businesses in the future.

**Key Principles:**
- Simple, non-tech-savvy friendly interface
- Minimal data entry, flexible queue management
- India-based infrastructure
- Complete data segregation per business (no cross-clinic data sharing)
- Users can belong to multiple clinics with different roles

---

## Users & Roles

### Multi-Tenancy Model
- **Business:** A clinic/practice (currently one, extensible to many)
- **Users:** Belong to one or more businesses with specific roles per business
- **Data Isolation:** Complete segregation per business (no patient data crosses between clinics)

### 1. Receptionist
- Belongs to one or more businesses
- Takes phone calls (outside system)
- Schedules patients for visits **within their assigned business**
- Manages patient details (new or existing) **for that business**
- Finds available slots and books appointments **in that business's calendar**
- Manages two separate queues: booked appointments and walk-ins **for that business**
- Sends patients to doctor when ready
- Can reschedule or cancel appointments
- May use phone, tablet, or desktop (flexible)
- **Cannot access data from other businesses**

### 2. Doctor
- Belongs to one or more businesses
- Reviews appointments/queue for the day **in their assigned business**
- Checks in patient (auto check-in time)
- Documents patient interaction (structured + free-text notes)
- Completes visit (auto completion time)
- Views patient history (last few visits + full history option) **only for patients in assigned business**
- Primarily mobile/tablet based, one-handed use friendly
- Cannot reorder queue or manage scheduling (Phase 1)
- **Cannot access data from other businesses**

### 3. Admin
- Belongs to one or more businesses
- Manages user accounts (receptionist, doctor, admin) **per business**
- Sets working hours, holidays, doctor unavailability **per business**
- Customizes visit documentation fields **per business**
- Configures business settings and visibility rules **per business**
- **Cannot access data from other businesses**

---

## Tech Stack

### Frontend
- **Framework:** React (mobile-first, responsive)
- **Deployment:** Vercel (free tier)
- **Responsiveness:** Phone, tablet, desktop support

### Backend
- **Framework:** Next.js (API routes)
- **Deployment:** Vercel (same as frontend)
- **Authentication:** JWT-based (email/password), independent of database

### Database & Storage
- **Service:** Supabase (free tier)
- **Region:** India (Mumbai)
- **Database:** PostgreSQL
- **Storage:** Object storage for files/documents
- **Data Residency:** All data stays in India

### Authentication
- **Phase 1:** Basic JWT (email/password)
- **Phase 2:** Google OAuth integration (independent of Supabase)

### Hosting & Infrastructure
- All services: India-based or with India region support
- Zero external calendar integrations (build custom calendar)
- Cost: Free tier to start, scales as needed

---

## Data Model

### 0. Business
```
- ID (unique)
- Name (clinic name)
- Address
- Phone
- Email
- Created Date
- Updated Date
```

### 1. Patient
```
- ID (unique)
- Business ID (foreign key) *** CRITICAL: Ties patient to specific business
- Name
- Phone Number
- Age
- Sex
- Address (optional)
- Created Date
- Updated Date
*** Patients are completely isolated per business - no cross-business access
```

### 2. Appointment
```
- ID (unique)
- Business ID (foreign key) *** CRITICAL: Ties appointment to specific business
- Patient ID (foreign key)
- Date
- Time
- Duration (in minutes)
- Status (scheduled, checked-in, completed, no-show, cancelled)
- Receptionist Notes (optional - e.g., "fever, cough")
- Created Date
- Updated Date
*** Appointments exist only within their business
```

### 3. Visit (Doctor's Documentation)
```
- ID (unique)
- Business ID (foreign key) *** CRITICAL: Ties visit to specific business
- Appointment ID (foreign key)
- Check-in Time (auto-recorded when doctor taps check-in)
- Completion Time (auto-recorded when doctor taps complete visit)
- Structured Fields (dynamic, configured by admin per business)
  - Example: symptoms, diagnosis, prescription, follow-up date, etc.
- Free-text Notes
- Created Date
- Updated Date
*** Visit records are completely isolated per business
```

### 4. User
```
- ID (unique)
- Email
- Password (hashed)
- Name
- Business Memberships (list of businesses with roles)
  - Business A: Doctor
  - Business B: Receptionist
  - etc.
- Created Date
- Updated Date
*** Users can belong to multiple businesses but have isolated access within each
```

### 5. Business Configuration
```
- ID (unique)
- Business ID (foreign key) *** CRITICAL: Configuration per business
- Working Hours (per day: Mon 9 AM-6 PM, Tue 9 AM-1 PM, Wed off, etc.)
- Days Open (which days clinic operates)
- Holidays (blocked dates - e.g., "May 15 - Clinic closed")
- Doctor Unavailability (sick leave, vacation, conferences - block specific dates/times)
- Appointment Duration Options (15, 30, 45 mins, custom)
- Visit Documentation Fields (configurable list of structured fields doctor fills in)
- Visibility Config (which data receptionist/doctor can see - optional Phase 2)
- Created Date
- Updated Date
*** Each business has independent configuration
```

### 6. Visit Documentation Fields
```
- ID (unique)
- Business ID (foreign key) *** CRITICAL: Fields per business
- Field Name (e.g., "symptoms", "diagnosis")
- Field Type (text, dropdown, checkbox, date, etc.)
- Is Required (yes/no)
- Order (sequence on form)
- Created Date
- Updated Date
*** Each business defines their own documentation fields
```

### Data Isolation Rules
**CRITICAL FOR MULTI-TENANCY:**
- Every query must filter by `business_id`
- A user can only see/access data for businesses they belong to
- Receptionist of Business A cannot see Business B's patients
- Doctor of Business A cannot see Business B's appointments
- Database constraints should enforce business_id requirements
- API endpoints must validate user has access to requested business

---

## Feature Set - Phase 1

### Core Features (All Included)

#### 1. Authentication & User Management
- Login/logout with email and password
- JWT-based session management with `business_id` claim
- Business selection on login:
  - **If user belongs to 1 business:** Auto-redirect to that business dashboard
  - **If user belongs to 2+ businesses:** Show business selector, user picks which clinic
- Role-based access per business (receptionist, doctor, admin in Business A; different role in Business B)
- Password hashing (secure storage)
- Session tokens include business context
- No Google Auth in Phase 1 (Phase 2 feature)

#### 2. Patient Management
- **Add new patient:** Name, phone, age, sex, address (tied to current business)
- **Search patient:** By name or phone number (searches only within current business)
- **View patient record:** Demographics + appointment history (for this business only)
- **View patient history:** Last few visits (summary) + full history (expandable) (for this business only)
- **Edit patient details:** Update information if needed (this business only)
- **Complete data isolation:** Patients from Business A never appear in Business B searches

#### 3. Admin Configuration
- **Working hours:** Set per day per business (flexible hours each day)
- **Days open:** Configure which days clinic operates (per business)
- **Holidays:** Block out specific dates (clinic closed) (per business)
- **Doctor unavailability:** Mark dates/times when doctor unavailable (per business)
- **Appointment duration options:** Define available durations (per business)
- **Visit documentation fields:** Admin defines what doctor fills in (per business)
- **User management:** Create/edit/delete receptionist, doctor, admin accounts (per business)
- **Each business has independent configuration** - settings don't affect other businesses

#### 4. Appointment Booking (Receptionist)
- **Search or add patient:** Existing patient or new patient entry (within current business)
- **View available slots:** System generates slots based on:
  - Working hours for selected day (from current business config)
  - No holidays (from current business config)
  - No doctor unavailability blocks (from current business)
  - No double-bookings (within current business calendar)
  - Configured appointment duration (from current business)
- **Book appointment:** Select slot, add optional receptionist notes (tied to current business)
- **Reschedule appointment:** Move appointment to different date/time (within current business)
- **Cancel appointment:** Remove appointment from schedule (within current business)
- **View upcoming appointments:** See next 1-2 days (default: today only) (for current business)
- **Complete isolation:** Receptionist only sees appointments for their assigned business

#### 5. Queue Management (Receptionist)
- **Two separate queues (per business):**
  - Booked Appointments Queue (scheduled in advance for current business)
  - Walk-in Queue (patients who walked in at current business)
- **Send to doctor:** Receptionist taps "Send to Doctor" or "Check-in" on patient
- **Simple flow:** One-way (receptionist → doctor), no complex reordering
- **No dragging/moving:** Too complex for non-tech-savvy users
- **Business isolation:** Queues are completely separate per business

#### 6. Doctor Dashboard & Visit Documentation
- **Today's queue:** See patient sent by receptionist (from current business)
- **Patient details:** Name, phone, age, demographics (from current business)
- **Patient history:** Last few visits (summary) + clickable full history (only for this business)
- **Check-in patient:** Taps "Check-in" → check-in time auto-recorded (in current business context)
- **Fill structured fields:** Doctor completes business-configured fields (symptoms, diagnosis, etc.)
- **Free-text notes:** Doctor adds any additional notes
- **Complete visit:** Taps "Complete" → completion time auto-recorded (in current business context)
- **Next patient:** Move to next in queue (from current business)
- **Business isolation:** Doctor only sees patients and appointments from assigned business

#### 7. Calendar System (Custom Built)
- **Slot generation:** Based on working hours + appointment duration (per business)
- **Conflict detection:** No double-booking (within each business)
- **Calendar display:** Day/week view (simple, mobile-friendly) (per business)
- **No external integrations:** Build entirely in-house
- **Receptionist view:** Shows available slots when booking (for current business)
- **Doctor view:** Not primary focus (focuses on queue) (for current business)
- **Business isolation:** Each business has independent calendar and slot management

#### 8. Data Security & Privacy
- JWT authentication (independent of database)
- Password hashing (bcrypt or similar)
- HTTPS only
- **Role-based access control per business:**
  - Receptionist of Business A cannot see Business B data
  - Doctor of Business A cannot see Business B data
  - Admin of Business A cannot see Business B settings
- **Business isolation enforced:**
  - Every database query filters by `business_id`
  - API endpoints validate user has access to requested business
  - Cross-business data access is prevented at database level
- Audit logs (optional Phase 1, prioritize Phase 2)
- Data residency: All patient data stays in India (Supabase Mumbai)
- **Complete patient data segregation:** No cross-business leakage

---

## User Flows - Phase 1

### Pre-Flow: Login with Business Selection

1. User enters email + password
2. System validates credentials
3. **Business Selection:**
   - **If user belongs to 1 business:** Auto-redirect to that business dashboard
   - **If user belongs to 2+ businesses:** Show business selector (user picks which clinic)
   - **If user belongs to 0 businesses:** Error (contact admin to assign to business)
4. User lands in their dashboard (receptionist, doctor, or admin)
5. All subsequent actions are within the selected business context

### Flow 1: Receptionist Booking an Appointment

1. Receptionist logs in and selects/is auto-routed to their business
2. Sees dashboard with:
   - Today's booked appointments (for this business only)
   - Today's walk-ins (for this business only)
   - Option to view next 1-2 days
3. Patient calls in
4. Receptionist searches for patient
   - If **existing:** Pulls up record (searches only within this business)
   - If **new:** Adds patient details (name, phone, age, sex, address) - tied to this business
5. Adds optional receptionist notes (e.g., "fever, cough")
6. Taps "Book Appointment"
7. System shows available slots for selected date based on **this business's config**
8. Receptionist selects slot and duration
9. Confirms booking
10. Appointment appears in Booked Queue (for this business)
11. Can reschedule or cancel existing appointments (for this business)

### Flow 2: Receptionist Managing Walk-ins

1. Patient walks into clinic
2. Receptionist adds walk-in:
   - Search for existing patient (searches within this business) or add new
   - Taps "Add Walk-in"
   - Walk-in appears in Walk-in Queue (for this business)
3. When ready, receptionist taps "Send to Doctor" on the walk-in
4. Patient goes to doctor (from this business's queue)

### Flow 3: Receptionist Sending Patient to Doctor

1. Receptionist has booked queue and walk-in queue visible (for this business)
2. When doctor is ready, receptionist selects a patient (from either queue)
3. Taps "Send to Doctor" or "Check-in"
4. Patient moves to doctor (this business only)
5. Queue updates (patient removed from this business's queue)

### Flow 4: Doctor Check-in & Documentation

1. Doctor logs in and selects/is auto-routed to their business
2. Sees today's queue (patients receptionist sent from this business)
3. Taps "Check-in Patient"
   - Check-in time auto-recorded
   - Appointment status changes to "checked-in"
4. Sees patient details:
   - Demographics (name, phone, age, sex)
   - Last few visits (summary) (from this business only)
   - Full history (clickable) (from this business only)
5. Fills in structured fields (configured by admin for this business):
   - Symptoms, diagnosis, prescription, follow-up date, etc.
6. Adds free-text notes (optional)
7. Taps "Complete Visit"
   - Completion time auto-recorded
   - Appointment status changes to "completed"
8. Moves to next patient in queue (from this business)

### Flow 5: Admin Configuration

1. Admin logs in and selects/is auto-routed to their business
2. Accesses admin settings (for this business):
   - **Working hours:** Set per day
   - **Holidays:** Block specific dates
   - **Doctor unavailability:** Mark vacation/sick leave dates
   - **Appointment durations:** Define options
   - **Visit fields:** Add/edit/remove structured documentation fields
   - **Users:** Create/edit receptionist, doctor, admin accounts (for this business)
3. Changes take effect immediately (only for this business)
4. **Admin cannot see or modify other businesses' settings**

---

## Phase 1 Scope - NOT Included

### Phase 2 Features (Future)
- Google OAuth integration (independent auth system)
- Advanced queue management (reordering, moving between queues)
- WhatsApp/SMS notifications to patients
- Appointment reminders
- Reports and analytics
- Audit logs (detailed activity tracking)
- Visibility configuration (role-based data access)
- Prescription printing/PDF export
- Multi-doctor support
- Appointment types/categories
- Payment integration

---

## Non-Functional Requirements

### Performance
- Page load time: <2 seconds
- Queue update: Real-time (receptionist to doctor)
- Responsive on all screen sizes (phone, tablet, desktop)

### Usability
- **Non-tech-savvy friendly:** Large buttons, clear labels, minimal clicks
- **Error prevention:** Confirmation dialogs for destructive actions
- **Feedback:** Clear confirmation messages ("Appointment booked for 2 PM")
- **Consistency:** Same patterns across all screens

### Reliability
- 99% uptime target
- Data backup (Supabase automatic backups)
- Graceful error handling

### Security
- All data encrypted in transit (HTTPS)
- Passwords hashed at rest
- JWT tokens with expiry
- Role-based access control
- No sensitive data in logs

### Compliance
- Data residency: India (Supabase Mumbai region)
- Privacy: Patient data protection
- No external data sharing (Phase 1)

---

## Development Approach

### Phase 0: Setup (1-2 hours)
1. Create GitHub repo
2. Set up Supabase project (India region)
3. Initialize Next.js project
4. Connect Next.js ↔ Supabase
5. Basic folder structure

### Phase 1: Full Development (2-3 weeks estimated)
Build all features listed in "Feature Set - Phase 1" above

### Deployment Strategy
- Code → GitHub
- GitHub → Vercel (auto-deploy on push)
- Database: Supabase (India region)

### Development Mode
- Claude Code builds features
- User reviews, tests, provides feedback
- Iterate until complete

---

## Notes & Assumptions

- **Multi-tenant architecture:** Designed for multiple clinics/businesses, but currently operating one
- **Single doctor per business (Phase 1):** One doctor per clinic initially, scalable to multiple doctors per clinic later
- **Internet always available:** No offline support needed
- **India-based:** All users in India, all data in India
- **Free tier:** Start with free Supabase + Vercel, scale later
- **No complex logic:** Simple queue management, straightforward flows
- **Mobile-first:** Responsive design for all screen sizes
- **Non-tech-savvy:** Minimal UI complexity, clear actions
- **Complete data segregation:** Patients, appointments, visits are completely isolated per business (no cross-business data sharing)
- **Business context:** All users operate within a single business context after login (auto-routed or selected)

---

## Success Criteria (Phase 1 Complete)
- ✅ Multi-tenant architecture functional (single business in use, ready to scale)
- ✅ Login with business selection (auto-route if 1 business, selector if 2+)
- ✅ Receptionist can book appointments (within their business)
- ✅ Receptionist can manage two queues (per business)
- ✅ Doctor can check in, document, and complete visits (for their business)
- ✅ Admin can configure all settings (per business)
- ✅ Complete data isolation (Business A data never accessible from Business B)
- ✅ All data stays in India (Supabase Mumbai region)
- ✅ App works on phone, tablet, desktop
- ✅ No external integrations (except Supabase)
- ✅ Non-tech-savvy users can operate it
- ✅ Database enforces business-level isolation (every query filters by business_id)

---

## Document History
- **Created:** May 9, 2026
- **Status:** Requirements Finalized
- **Next Step:** Phase 0 Setup

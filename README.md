# Final Assessment — Backend Development

**Weight:** 30% of final grade
**Duration:** 2 weeks
**Mode:** Individual project
**Stack (mandatory):** Node.js, Express.js, MySQL (with parameterized queries only), Redis

---

## Scenario — "MediBook" Clinic Appointment System

A community clinic wants a backend service for booking doctor appointments. Doctors see patients in fixed 30-minute slots during working hours (09:00–17:00), each doctor can handle at most **12 appointments per day**, and the clinic administrator needs reports. You will design the database, build the API, and handle the operational concerns (background jobs, logging, testing).

**Entity limit:** Your database must contain **exactly 3 entities**:

| Entity | Purpose |
|---|---|
| `patients` | People who book appointments |
| `doctors` | Doctors with a specialty, consultation fee, and room |
| `appointments` | A patient's booking with a doctor at a specific date/time (links the other two) |

You may add columns as needed, but no additional tables (lookup/locale JSON files don't count).

---

## Part A — Database Design & Normalization

The clinic currently tracks everything in this single spreadsheet:

| appt_ref | patient_name | patient_email | patient_phone | doctor_name | specialty | consultation_fee | room | appt_datetime | amount_paid | booked_on |
|---|---|---|---|---|---|---|---|---|---|---|
| AP-001 | Ama Mensah | ama@mail.com | 0244-111-222 | Dr. Boateng | Dermatology | 150.00 | R-12 | 2026-08-10 09:00 | 150.00 | 2026-07-01 |
| AP-002 | Kojo Owusu | kojo@mail.com | 0555-333-444 | Dr. Boateng | Dermatology | 150.00 | R-12 | 2026-08-10 09:30 | 120.00 | 2026-07-02 |
| AP-003 | Ama Mensah | ama@mail.com | 0244-111-222 | Dr. Adjei | Paediatrics | 100.00 | R-03 | 2026-08-15 10:00 | 100.00 | 2026-07-03 |

Study the spreadsheet, then produce a **database schema diagram** of your design in fully normalized form (up to 3NF). The diagram must show **everything**:

- all 3 entities with every column and its MySQL data type,
- primary keys and foreign keys, clearly marked,
- the relationships between the entities and their cardinality (1:N, etc.),
- every constraint that enforces a business rule (`NOT NULL`, `UNIQUE`, `CHECK`) — in particular, it must be visible from the diagram that *a doctor cannot have two appointments at the same date/time*.

Use any tool you like (dbdiagram.io, draw.io) and include it in your repository as `schema-diagram` (image or PDF).

## Part B — Database Implementation & Project Setup

1. **Table creation.** Translate your Part A diagram into a MySQL DDL script, `database/schema.sql`, that creates the database and the 3 tables — data types, primary keys, foreign keys, and every constraint shown on the diagram. The script must run cleanly on a fresh MySQL server. Also provide `database/seed.sql` with realistic sample data: at least 3 patients, 3 doctors (including one with no appointments), and 8 appointments (including one doctor-day at or near the 12-slot daily cap).

2. **Project structure.** Set up the Express project in a **models / controllers / routes** structure:

```
├── database/          schema.sql and seed.sql (Part B.1)
└── src/
    ├── models/        all application SQL lives here — nowhere else
    ├── controllers/   business logic; calls model functions, never the DB directly
    └── routes/        maps URLs and HTTP methods to controllers
```

Every SQL statement in the application must use **parameterized queries** (`?` placeholders via `mysql2`). SQL found in a controller or route file loses marks. **Do not use any ORM for this assignment.**

## Part C — Controllers & Endpoints

Implement endpoints for the operations below. **Designing the API is part of the assessment**: you choose the URL paths, the HTTP methods, and how the endpoints are grouped into controllers and routes — your choices should follow REST conventions and will be marked. The business rules listed are **requirements** — *how* you satisfy them is your design decision, and you will be asked to defend it at the viva.

1. **Basic CRUD** — standard **C**reate, **R**ead (one and all), **U**pdate, and **D**elete operations for patients and for doctors, with sensible validation. (Appointments get their create/delete behaviour from the two operations below — no separate CRUD needed there.)

2. **Book an appointment**. Rules that must always hold:
   - Appointments can only be booked in the future, within working hours (09:00–17:00), on a 30-minute slot boundary.
   - A doctor never exceeds 12 appointments in a day.
   - Two patients can never hold the same doctor slot — even when both requests arrive at the same instant.

3. **Cancel an appointment**. Rules:
   - The refund is computed by the server from the notice given: more than 48 hours → 100%; 24–48 hours → 50%; less than 24 hours → 0%. The response states the refund amount.
   - The cancellation and its refund record succeed or fail together.
   - A cancelled slot becomes bookable by another patient, while the cancellation record is kept for refund history.
   - A cancellation notifies the waitlist (Part E).

4. **Doctor statistics** — for a given doctor: revenue collected, upcoming appointment count, appointments per day for the next 7 days, and utilization % against the 12-slot daily cap.

Operations 5 and 6 are where your **advanced SQL** is assessed: the results must be produced by the SQL in your models (joins, aggregates, etc) — not fetched raw and computed in JavaScript.

5. **Doctors report** — every doctor's total appointments and revenue collected, including doctors with zero appointments.
6. **Busy days report** — every (doctor, date) where more than 80% of the 12-slot daily capacity is booked.

### General requirements (all endpoints)

Input validation with meaningful `400` messages; correct status codes (`201`, `404`, `409`, `422`); a central error-handling middleware.

## Part D — Node.js `fs` Module

**Audit log:** every successful booking and cancellation must be appended as a JSON line to `logs/audit.log` using the `fs` module (async, non-blocking — no `*Sync` calls inside request handlers). The logger must create the `logs/` directory on first run if it doesn't exist, and a logging failure must **not** fail the user's request.

## Part E — Queues & Redis

1. **Waitlist queue:** when the requested slot (or the doctor's whole day) is fully booked, offer the patient a waitlist spot — push them onto a queue (Redis list, or Bull/BullMQ). When a cancellation frees a slot, a **worker process** (separate from the web server) pops the first waitlisted patient and books them in. Think through: what happens if the promoted booking itself fails? The patient must not simply vanish from both the queue and the appointments table.
2. **Notification jobs:** every confirmed appointment enqueues a "confirmation SMS/email" job; the worker processes it by writing the message to the audit log (no real sending needed).

## Part F — Unit Testing

Using Jest, write **at least 6 meaningful unit tests**:

- The refund calculator from Part C.3 — cover all three tiers **and both boundaries** (exactly 24 hours, exactly 48 hours). Boundary behaviour must match your documented policy.
- One validation function of your choice — e.g., the slot-alignment/working-hours check — including at least one edge case (17:00 exactly? 09:15? a malformed date?).

Tests must not require a live MySQL or Redis connection — that's the point of extracting pure functions. `npm test` must run them.

## Part G — i18n & l10n: Course Feedback Page

Create a **simple HTML page** (served by your Express app at `GET /feedback`) containing a short course-feedback form with **exactly 5 essay questions** (each answered in a `<textarea>`):

1. Which topic in this course did you find most challenging, and why?
2. Describe one concept you understood only after the practical assignments. What made it click?
3. How has your approach to designing databases or APIs changed since the start of the trimester?
4. What would you improve about how this course was taught or assessed?
5. How do you plan to apply what you learned in this course going forward?

**i18n/l10n requirement (keep it simple):** the page title, instructions, and all 5 questions must be loaded from locale files (e.g., `locales/en.json` and `locales/fr.json` — English plus one other language of your choice). Visiting `/feedback?lang=fr` shows the translated page; the default is English, and an unsupported `lang` value must fall back to English rather than crash. Display today's date on the page formatted for the active locale (e.g., using `Intl.DateTimeFormat`).

---

## Submission Requirements

- Git repository (with meaningful commit history — a single "final commit" will be questioned) containing:
  - `schema-diagram` (image or PDF), `schema.sql`, and `seed.sql` (as specified in Part B)
  - Application source, worker process, tests, locale files
  - `README.md` with: setup steps, `.env.example`, and the short written justifications requested in Parts C, D, and E
- The app must start with `npm install && npm start` (plus documented MySQL/Redis setup) and tests with `npm test`.
- A short **viva/demo (10 minutes)** walkthrough.

**Automatic penalties:** SQL injection vector anywhere in the app (−15), secrets committed to the repo (−5), app does not start per README instructions (−10), work the student cannot explain in the video (or at a follow-up viva if called) | Academic integrity referral; affected criteria re-scored at Developing or below |
---

# MediBook: Implementation Notes

## Setup

**Requirements:** Node.js LTS, Docker Desktop (for MySQL and Redis).

```bash
# 1. Start MySQL and Redis
docker run --name medibook-mysql -e MYSQL_ROOT_PASSWORD=rootpass -p 3306:3306 -d mysql:8
docker run --name medibook-redis -p 6379:6379 -d redis:7

# 2. Create the database and load sample data (wait ~20s for MySQL to start)
# Windows PowerShell:
Get-Content database/schema.sql | docker exec -i medibook-mysql mysql -uroot -prootpass
Get-Content database/seed.sql | docker exec -i medibook-mysql mysql -uroot -prootpass
# macOS / Linux:
docker exec -i medibook-mysql mysql -uroot -prootpass < database/schema.sql
docker exec -i medibook-mysql mysql -uroot -prootpass < database/seed.sql

# 3. Configure and install
cp .env.example .env        # Windows: copy .env.example .env
npm install

# 4. Run (two terminals)
npm start                   # web server on http://localhost:3000
npm run worker              # background worker (waitlist + confirmations)

# 5. Tests (no MySQL or Redis needed)
npm test
```

Schema diagram: `schema-diagram.png`. The diagram was made with dbdiagram.io and draw.io; AI assistance for the diagram was allowed by the facilitator.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET, POST | `/patients` | list, create |
| GET, PUT, DELETE | `/patients/:id` | read, update, delete |
| GET, POST | `/doctors` | list, create |
| GET, PUT, DELETE | `/doctors/:id` | read, update, delete |
| GET | `/doctors/:id/stats` | revenue, upcoming count, next-7-days per-day counts, utilization % |
| POST | `/appointments` | book |
| DELETE | `/appointments/:id` | cancel (soft cancel, record kept) |
| POST | `/waitlist` | join the waitlist |
| GET | `/reports/doctors` | every doctor's total appointments and revenue |
| GET | `/reports/busy-days` | doctor-days above 80% of the 12-slot cap |
| GET | `/feedback?lang=en\|fr` | i18n feedback page |

Date format for booking: `"YYYY-MM-DD HH:mm"`, for example `"2026-12-20 10:00"`.

## Part C: Design justifications

**REST choices.** Resources are nouns (`/patients`, `/doctors`, `/appointments`) and the HTTP method carries the action. Cancelling is `DELETE /appointments/:id`, but it is a *soft* cancel: the row stays with `status = 'cancelled'`, `refund_amount` and `cancelled_at`, because refund history must be kept. Stats hang off the doctor (`/doctors/:id/stats`) and reports live under `/reports`.

**Status codes.** `400` = malformed input (missing fields, bad email, unparseable date). `404` = unknown id. `409` = the request is valid but conflicts with current state (slot already taken, doctor fully booked, appointment already cancelled, duplicate email). `422` = well-formed request that breaks a business rule (in the past, not on a 30-minute boundary, outside working hours, cancelling a past appointment). `201` for creation.

**Booking rules.** Future only, 09:00 to 17:00, 30-minute boundaries, at most 12 per doctor per day. The last valid slot is 16:30; **17:00 exactly is invalid**, because a slot that starts at closing time makes no sense. All business values (12, hours, refund thresholds) are defined once in `src/config/constants.js`.

**Refund policy (computed on the server).**
- More than 48 hours notice: 100%
- 24 hours to 48 hours **inclusive** (exactly 48h and exactly 24h both give 50%): 50%
- Less than 24 hours: 0%

The cancellation and refund record are written in one database transaction, so they succeed or fail together.

**Concurrency.** Two layers protect the data:
1. *Row lock.* Booking runs in a transaction that first does `SELECT ... FOR UPDATE` on the doctor's row, so simultaneous bookings for the same doctor run one after another. This makes the 12-per-day count safe.
2. *Unique index.* `UNIQUE (doctor_id, active_slot)`, where `active_slot` is a generated column equal to `appt_datetime` while the status is `booked` and `NULL` once cancelled. NULLs do not collide in a UNIQUE index, so a cancelled slot can be rebooked while two active bookings can never share a slot. Even if the lock failed, the database would reject the duplicate.

I verified this by sending 5 identical booking requests at the same moment: exactly one returned 201 and four returned 409.

**Revenue** means `amount_paid - refund_amount`, summed over all of a doctor's appointments. **Utilization** is booked appointments in the next 7 days divided by (12 x 7). Both reports are computed in SQL inside the models (joins and aggregates), using a LEFT JOIN so doctors with no appointments still appear.

**Code organisation.** `routes` map URLs to `controllers`, controllers validate input and call `services` or `models`, and **all SQL lives in `models`** using `?` placeholders. No ORM is used.

## Part D: Audit log (fs module)

Every successful booking and cancellation is appended as one JSON line to `logs/audit.log` using `fs/promises` (`mkdir` with `recursive: true`, then `appendFile`). It is asynchronous so logging never blocks the event loop, and no `*Sync` calls are used in request handlers. The `logs/` folder is created on first use. The logger catches its own errors and only prints them, because a logging failure must never fail the user's request.

## Part E: Queues and Redis

**Structure.** Redis holds two things: a job list `queue:jobs` (confirmation and "slot freed" jobs) and one waitlist list per doctor per day (`waitlist:<doctorId>:<date>`). The MySQL "3 tables only" rule does not apply to Redis.

**Flow.** If a slot or the whole day is full, the API responds 409 with `waitlistAvailable: true`, and the patient can join via `POST /waitlist`. A successful booking enqueues a confirmation job. A cancellation enqueues a `slot_freed` job. The **worker is a separate process** (`npm run worker`) that blocks on the job list with `BRPOP`. For a confirmation job it writes the message to the audit log. For a `slot_freed` job it takes the first waiting patient for that doctor and day and books them into the freed slot using the same booking service (same rules and locks as the API). I kept the worker separate so slow background work never delays web requests, and so the web server and the worker can be restarted independently.

**If the promoted booking fails.** The patient is taken off the waitlist, the booking is attempted, and on any failure the patient is pushed back to the **front** of the list and a `waitlist_promotion_failed` event is logged. The patient is therefore never lost from both the queue and the appointments table.

**Behaviour to note.** The waitlist is per doctor per day, so the first waiting patient is placed into whichever slot of that day was freed (they may get an earlier time than the one they asked for).

**Known limitation.** If the worker process crashed in the instant between removing a patient from the list and booking or re-adding them, that patient could be lost. A production system would use a reliable queue (for example BullMQ) with acknowledgements.

## Part F: Tests

`npm test` runs 11 Jest unit tests with fixed dates and no MySQL or Redis: the refund calculator (all three tiers, plus exactly 24h and exactly 48h) and the slot validator (valid slot, 09:15, 17:00, past date, malformed date, impossible date).

## Part G: Feedback page

`GET /feedback` is served by Express. All text comes from `locales/en.json` and `locales/fr.json`. `?lang=fr` shows French. Any unsupported `lang` falls back to English. Today's date is formatted for the active locale with `Intl.DateTimeFormat`.

## Video walkthrough

Video: PASTE-YOUR-YOUTUBE-LINK-HERE

Run instructions: see **Setup** above.
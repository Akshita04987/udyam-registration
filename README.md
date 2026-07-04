# Udyam Registration Portal Clone

This is a functional clone of the first two steps of the official Indian [Udyam Registration Portal](https://udyamregistration.gov.in) (Ministry of MSME). It is built as a college assignment using a modern web stack.

The project is structured inside a single folder containing:
*   `/frontend`: Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.
*   `/backend`: Built with Node.js + Express, TypeScript, Prisma, and PostgreSQL (via Supabase / Local Docker).

---

## Technical Features

1.  **Schema-Driven Forms**: The entire Step 1 and Step 2 forms are dynamically generated from a central JSON schema definitions file. Fields are not hardcoded.
2.  **Strict Client & Server Validation**:
    *   **Aadhaar Number**: Checked against exactly 12 digits (`^[0-9]{12}$`).
    *   **PAN Number**: Normalised to uppercase and validated against the format `5 letters, 4 digits, 1 letter` (`^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$`).
    *   **Name**: Alphabets and spaces only (`^[A-Za-z ]+$`).
    *   **Organisation Type**: Selectable options list that conditionally controls other fields.
3.  **Mocked OTP Flow**: Requests a mock OTP with an 800ms simulated network latency delay, a 30-second resend cooldown timer, and a verification screen.
4.  **Conditional Rendering**: The Name as per PAN field is dynamically hidden when "Proprietorship" is selected and mandatory for all other business types.
5.  **Secure Storage**: Aadhaar number is hashed using SHA-256 before being stored in PostgreSQL. It is never persisted in plain text.
6.  **Full Test Suite**: Tested using Jest and React Testing Library on the frontend, and Jest + Supertest on the backend.

---

Design Decisions

I built the form so it renders from a single JSON schema
(udyamFormSchema.json) instead of hardcoding each input directly in the
components. The reason is simple: Step 1 and Step 2 both have fields,
validation rules, and error messages that change together - if I'd
hardcoded them, changing one PAN validation rule would mean editing the
JSX itself. Keeping the schema separate meant I could tweak a regex or
add a field without touching the UI code at all, and it also matches the
assignment's own requirement that the form be "dynamic" based on the
scraped structure.

I split the form logic into custom hooks (useStep1Form.ts,
useStep2Form.ts) instead of keeping everything inside the components.
This made the validation logic testable on its own, without needing to
render the UI first - that's why the Aadhaar and PAN regex tests in
validators.ts could be written independently of the component tests.

On the backend, I made sure the Aadhaar number is hashed (SHA-256) before
it's stored, rather than saved as plain text - even though this is just a
demo project, real Aadhaar data is sensitive, and I wanted the schema to
reflect how it'd actually need to be handled in a real system.

One real bug I ran into: I initially only ran prisma generate, which
builds the Prisma client but doesn't actually create tables in the
database. My first Submit attempt failed with an "Internal server error"
because the UdyamSubmission table simply didn't exist in Supabase yet - I
had to explicitly push the schema to the database before submissions
could be saved. That was a good reminder that generating a client and
applying a schema to a live database are two separate steps.

---

## Running Locally

### Prerequisites
*   Node.js (v18 or higher)
*   A running PostgreSQL database instance (or Docker)

### 1. Database Setup
Create a `.env` file in `/backend` using `/backend/.env.example` as a template:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.mofscsewexuahqriltyh.supabase.co:5432/postgres"
PORT=4000
```
Run Prisma Client generator and push the database migrations:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### 2. Run Backend
Start the Express API development server (runs on `http://localhost:4000`):
```bash
npm run dev
```

### 3. Run Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Running with Docker

You can spin up the entire application stack (Frontend, Backend, and a local PostgreSQL database) in one step using Docker Compose.

### Steps:
1.  Navigate to the root folder:
    ```bash
    docker-compose up --build
    ```
2.  The services will run as:
    *   **Frontend**: `http://localhost:3000`
    *   **Backend API**: `http://localhost:4000`
    *   **PostgreSQL Database**: Port `5432` on localhost

---

## Running Tests

### Frontend Tests
Tests cover Aadhaar/PAN regex validation, conditional rendering, and form action button states:
```bash
cd frontend
npm test
```

### Backend API Tests
Tests cover Express routing, schema validators, mock database interactions, and error status codes:
```bash
cd backend
npm test
```

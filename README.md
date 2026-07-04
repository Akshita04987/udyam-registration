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

## Form Design: Why Schema-Driven?

Instead of hardcoding input elements like `<input name="pan" ... />` inside React files, the forms are rendered dynamically by reading a JSON schema configuration file located at:
[`frontend/src/schema/udyamFormSchema.json`](frontend/src/schema/udyamFormSchema.json)

### Key Benefits:
*   **Maintainability**: Any updates to field labels, validation regexes, error messages, or placeholders can be modified by editing a single JSON schema. No JSX/TSX changes are required.
*   **Separation of Concerns**: Decouples form configuration (metadata) from presentation UI logic (rendering components).
*   **Dynamic Layouts**: Easily handles conditional visibility rules (e.g. showing name fields only for non-proprietorships, showing OTP inputs only after requesting) using schema directives.
*   **Scalability**: Adding a Step 3 or new fields takes minutes; simply declare them in the JSON schema list, and the layout renderer handles the rest automatically.

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

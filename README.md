# Udyam Registration Portal Clone

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Express](https://img.shields.io/badge/Express-4.18-green?style=flat-square&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css)
![Tests Passing](https://img.shields.io/badge/Tests-Passing-success?style=flat-square)

A functional clone of the first two steps of the official Indian [Udyam Registration Portal](https://udyamregistration.gov.in) (Ministry of MSME), built as a college assignment using a modern full-stack web architecture.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Technical Features](#technical-features)
- [Design Decisions](#design-decisions)
- [Running Locally](#running-locally)
- [Running with Docker](#running-with-docker)
- [Running Tests](#running-tests)
- [Assignment Context](#assignment-context)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (via Supabase), Prisma ORM |
| **Testing** | Jest, React Testing Library, Supertest |
| **Deployment** | Docker Compose |

---

## Project Structure

```
udyam-registration/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks (useStep1Form, useStep2Form)
│   │   ├── schema/           # JSON schema for form definition
│   │   ├── utils/            # Utility functions
│   │   └── validators/       # Validation logic
│   ├── public/               # Static assets
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/           # Express API routes
│   │   ├── validators/       # Request validation schemas
│   │   ├── utils/            # Helper functions (hashing, reference generation)
│   │   ├── lib/              # Prisma client configuration
│   │   └── index.ts          # Express app entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema definition
│   │   └── SCHEMA_NOTES.md   # Schema documentation
│   ├── .env                  # Environment variables (gitignored)
│   └── package.json
├── docs/                     # Assignment documentation and diagrams
└── README.md
```

---

## Technical Features

| Feature | Description | Validation Rule |
|---------|-------------|-----------------|
| **Schema-Driven Forms** | Step 1 and Step 2 forms are dynamically generated from a central JSON schema. Fields are not hardcoded in components. | N/A |
| **Aadhaar Validation** | Client and server-side validation for 12-digit Aadhaar numbers. | `^[0-9]{12}$` |
| **PAN Validation** | Normalised to uppercase and validated against standard PAN format. | `^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$` |
| **Name Validation** | Ensures names contain only alphabets and spaces. | `^[A-Za-z ]+$` |
| **Organisation Type** | Selectable options that conditionally control other field visibility. | N/A |
| **Mocked OTP Flow** | Simulates OTP request with 800ms network delay, 30-second resend cooldown, and verification screen. | N/A |
| **Conditional Rendering** | "Name as per PAN" field is hidden for Proprietorship, mandatory for other business types. | N/A |
| **Secure Storage** | Aadhaar numbers are hashed using SHA-256 before storage. Plain text is never persisted. | N/A |
| **Full Test Suite** | Frontend tests with Jest + React Testing Library; backend tests with Jest + Supertest. | N/A |

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

- Node.js (v18 or higher)
- A running PostgreSQL database instance (or Docker)

### 1. Database Setup

Create a `.env` file in `/backend` using `/backend/.env.example` as a template:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.mofscsewexuahqriltyh.supabase.co:5432/postgres"
PORT=4000
```

Run Prisma Client generator and push the database schema:

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

Spin up the entire application stack (Frontend, Backend, and a local PostgreSQL database) in one step using Docker Compose.

### Steps

1. Navigate to the root folder:

```bash
docker-compose up --build
```

2. The services will run as:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:4000`
   - **PostgreSQL Database**: Port `5432` on localhost

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

---

## Assignment Context

This project was built as a college assignment to clone the first two steps of the Udyam Registration portal (Aadhaar verification and PAN verification). The implementation focuses on schema-driven form design, secure data handling, and comprehensive test coverage.

Hand-drawn flow diagrams, entity-relationship diagrams, and the full assignment prompt log are available in the `/docs` directory for reference.

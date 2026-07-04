# Prisma Schema Notes — UdyamSubmission

This document explains every field in the `UdyamSubmission` model in plain English.
Use this as your reference when drawing the ER diagram by hand.

---

## Table: `UdyamSubmission`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (string) | Auto-generated primary key. Each submission gets a globally unique ID. |
| `referenceNumber` | String (unique) | The human-readable reference number shown to the applicant after registration, e.g. `UDYAM-MH-00-0001234`. Must be unique across all submissions. |
| `aadhaarHash` | String | A SHA-256 hash of the raw 12-digit Aadhaar number. **The plain-text Aadhaar is never stored.** Hashing means we can verify a number later (hash it again and compare) without being able to read the original. |
| `applicantName` | String | Full name of the person registering, entered in Step 1. Letters and spaces only. |
| `organisationType` | String | The legal structure chosen by the applicant in Step 2 (e.g. `proprietorship`, `private_ltd`, `llp`). Stored as the option value string from the frontend dropdown. |
| `panNumber` | String | The 10-character PAN in uppercase (e.g. `ABCDE1234F`). Already normalised to uppercase by the frontend before submission. |
| `panHolderName` | String | Name as it appears on the PAN card. Required for all organisation types **except** Proprietorship (where the applicant themselves is the PAN holder). Stored as an empty string when not applicable. |
| `dobOrDoi` | DateTime | Date of Birth for individuals / sole proprietors, or Date of Incorporation for registered entities (partnerships, companies, LLPs, etc.). Stored as a full UTC timestamp; only the date portion is meaningful. |
| `otpVerified` | Boolean | `true` when the applicant successfully completed the Aadhaar OTP step before submitting. Currently set to `false` by default because OTP verification is mocked on the frontend; a real integration would set this to `true` upon confirmed delivery. |
| `panVerified` | Boolean | Reserved for a future PAN verification API integration. `false` by default. |
| `createdAt` | DateTime | Set automatically to the UTC timestamp when the record is first inserted. |
| `updatedAt` | DateTime | Updated automatically by Prisma every time the record is modified. |

---

## Relationships

This model has no foreign keys — it is a standalone flat record per submission.
If a lookup / status-tracking feature is added later, `referenceNumber` is the natural join key.

---

## Indexes

- `id` — Primary key index (auto)
- `referenceNumber` — Unique index, used by `GET /api/submissions/:referenceNumber`

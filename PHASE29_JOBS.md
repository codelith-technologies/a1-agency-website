# Phase 29 - Admin Job Management

## Data operations

The admin job UI uses the authenticated Supabase browser client and stores records in `public.jobs`.
The shared repository in `packages/database/src/jobs.ts` provides option loading, listing, lookup, insert,
optimistic-concurrency update, and status updates.

## Field mapping

- Country and category are selected by database UUID.
- Currency is always `LKR`.
- Salary, age, closing date, city, conditions, and optional descriptions are mapped directly to existing columns.
- Arrays are stored in `responsibilities`, `qualifications`, and `benefits`.
- Employment and experience values use the existing database enums.
- Unsupported foreign currencies, `active`/`paused` status values, gender restrictions, and the non-existent
  SLBFE approval column are not used.

## Status behavior

New jobs are created as `draft`. Existing draft jobs remain drafts after saving. Closed and archived records
remain in their historical status when edited. Close and archive actions require confirmation and use
`updated_at` optimistic concurrency.

Database-created publication is blocked by the Phase 29 migration until a server or rebuilt public route
integrates database jobs. Existing static public detail routes are build-time sample routes and cannot safely
resolve arbitrary database slugs.

## Security

Browser CRUD remains constrained by the Phase 28 RLS policies and the trusted staff profile role function.
Content editors cannot manage jobs. The publication trigger also rejects direct browser attempts to set
`status = 'published'`.

## Concurrency and audit

Updates include the record's `updated_at` timestamp in the database filter. A missing row reports a reload
conflict instead of silently overwriting another staff member's changes.

A database trigger records job create, update, and status-change actions in `audit_logs` without storing
form field values.

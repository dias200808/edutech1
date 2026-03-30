# Aqtas Diary

Production-grade MVP for an AI-first school electronic diary and student information platform built with `Next.js`, `TypeScript`, `PostgreSQL`, `Prisma`, and a backend-only grounded AI layer.

## Stack

- Frontend: `Next.js App Router`, `React`, `TypeScript`, `Tailwind CSS`, local shadcn-style UI primitives, `TanStack Query`, `Zustand`, `Framer Motion`, `Lucide`
- Backend: `Next.js route handlers`, `Prisma`, `PostgreSQL`, `Zod`, JWT cookie auth, RBAC service layer
- AI: backend-only endpoints with grounded Prisma context, optional OpenAI provider, deterministic fallback summaries

## Features

- Multi-role authentication: `Admin`, `Teacher`, `Parent`, `Student`
- Left-sidebar dashboard shell with role-aware navigation
- Role-specific dashboards
- Schedule, homework, grades, attendance, messages, announcements, calendar, reports, AI assistant
- Admin views for users, students, parents, teachers, classes, subjects, timetable, analytics, and system settings
- CRUD APIs for core entities
- Seeded demo data with realistic school workflows

## Project Structure

```text
app/
  (auth)/
  (dashboard)/
  api/
components/
  ai/
  dashboard/
  forms/
  layout/
  messages/
  modules/
  providers/
  shared/
  ui/
features/
  admin/
  ai/
  announcements/
  attendance/
  auth/
  calendar/
  dashboard/
  grades/
  homework/
  messages/
  reports/
  schedule/
  students/
lib/
  ai/
  auth/
  context.ts
  db.ts
  navigation.ts
  permissions/
  stores/
  utils.ts
  validators/
prisma/
  schema.prisma
  seed.ts
proxy.ts
```

## Environment Variables

Create `.env` from `.env.example`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school_diary?schema=public"
JWT_SECRET="replace-with-a-long-random-string"
NEXT_PUBLIC_APP_NAME="Aqtas Diary"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
```

## Installation

```bash
npm install
```

## Database Setup

1. Start PostgreSQL.
2. Create a database, for example `school_diary`.
3. Update `DATABASE_URL` in `.env`.

Run one of the following:

```bash
# preferred for a local first run
npm run prisma:push

# or create a migration
npm run prisma:migrate -- --name init
```

Seed the demo data:

```bash
npm run db:seed
```

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Build Check

```bash
npm run lint
npm run build
```

Both commands complete successfully in the current codebase.

## Demo Credentials

All seeded users use the same password:

```text
Demo123!
```

Primary demo accounts:

- Admin: `admin@aqtas.school`
- Teacher: `teacher1@aqtas.school`
- Parent: `parent1@aqtas.school`
- Student: `student1@aqtas.school`

Additional accounts are seeded for broader demos:

- Teachers: `teacher2@aqtas.school`, `teacher3@aqtas.school`
- Parents: `parent2@aqtas.school` through `parent5@aqtas.school`
- Students: `student2@aqtas.school` through `student10@aqtas.school`

## Role Model

- Student: own schedule, homework, grades, attendance, reports, AI guidance
- Parent: linked child view, homework and attendance oversight, announcements, parent-facing AI summaries
- Teacher: assigned class and subject scope, homework creation, grade entry, attendance marking, messaging, teacher AI summary
- Admin: full platform access, analytics, user management, school operations overview

## API Summary

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Users

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### Students

- `GET /api/students`
- `GET /api/students/:id`
- `GET /api/students/:id/dashboard`
- `GET /api/students/:id/grades`
- `GET /api/students/:id/attendance`
- `GET /api/students/:id/homework`

### Homework

- `GET /api/homework`
- `POST /api/homework`
- `GET /api/homework/:id`
- `PATCH /api/homework/:id`
- `DELETE /api/homework/:id`
- `POST /api/homework/:id/submit`

### Grades

- `GET /api/grades`
- `POST /api/grades`
- `PATCH /api/grades/:id`
- `DELETE /api/grades/:id`

### Attendance

- `GET /api/attendance`
- `POST /api/attendance`
- `PATCH /api/attendance/:id`

### Messages

- `GET /api/threads`
- `POST /api/threads`
- `GET /api/threads/:id/messages`
- `POST /api/messages`

### Announcements and Events

- `GET /api/announcements`
- `POST /api/announcements`
- `PATCH /api/announcements/:id`
- `GET /api/events`
- `POST /api/events`
- `PATCH /api/events/:id`

### Reports

- `GET /api/reports/student/:id`
- `GET /api/reports/class/:id`
- `GET /api/reports/admin/overview`

### AI

- `POST /api/ai/day-summary`
- `POST /api/ai/week-summary`
- `POST /api/ai/risk-analysis`
- `POST /api/ai/study-plan`
- `POST /api/ai/teacher-summary`
- `POST /api/ai/message-draft`
- `POST /api/ai/explain-topic`

## AI Architecture

- Client never calls the LLM provider directly.
- Every AI request hits a backend route handler.
- Backend services assemble grounded school facts from Prisma queries.
- If `OPENAI_API_KEY` is present, the provider layer can generate concise grounded responses.
- If no provider is available, deterministic fallback summaries still work.
- AI insights are stored in the database for history and dashboard reuse.

## Architecture Notes

- `lib/auth/*`: JWT session handling and password utilities
- `lib/permissions/*`: RBAC and scope enforcement
- `features/*/service.ts`: business logic shared by pages and APIs
- `proxy.ts`: protected routing for dashboard and admin surfaces
- `prisma/schema.prisma`: normalized school data model
- `prisma/seed.ts`: realistic seeded demo environment

## Demo Flow

After seeding, you can:

1. Sign in as each role from `/login`.
2. Open role-specific dashboards from the sidebar.
3. Review schedules, homework, grades, attendance, messages, announcements, and reports.
4. Create homework, grades, attendance records, announcements, events, and users with authorized roles.
5. Trigger grounded AI summaries and message drafts from the AI module.

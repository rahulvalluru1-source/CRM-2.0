# CRM & Field Tracking System - AI Agent Instructions

## Project Architecture

### Core Components
- **Next.js App Router Structure** (`src/app/*`)
  - Role-based sections: `admin/`, `employee/`, `crm/`
  - API routes in `api/` follow REST patterns
  - Layouts define role-based navigation and auth guards

### Data Flow
1. Authentication via NextAuth.js (JWT strategy)
2. Prisma ORM for SQLite database operations
3. Real-time updates via Socket.io for notifications
4. Client-state management: Combination of React Context and Zustand

## Key Development Patterns

### Authentication & Authorization
```typescript
// Example role-based route protection in src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
if (session?.user?.role !== 'ADMIN') {
  redirect('/login')
}
```

### Database Operations
- Always use Prisma Client from `@/lib/db`
- Follow schema types defined in `prisma/schema.prisma`
- Include relations when needed for nested data

### Component Structure
- UI components from shadcn/ui in `components/ui/`
- Custom components follow atomic design in `components/`
- Page layouts enforce role-based access

## Critical Workflows

### Setup
1. Install dependencies: `npm install`
2. Setup database:
   ```bash
   npm run db:push
   npm run db:generate
   ```
3. Seed data: `curl -X POST http://localhost:3000/api/seed`

### Development
- Use `npm run dev` for development
- Database changes require `npm run db:push`
- Always update Prisma client after schema changes

## Project-Specific Conventions

### API Routes
## CRM & Field Tracking — Agent Quick Guide

Purpose: Give AI coding agents the concrete, repo-specific patterns and commands needed to be productive quickly.

Key architecture (what to know first)
- App: Next.js App Router under `src/app/` with role-based areas: `admin/`, `employee/`, `crm/`.
- Server entry: `server.ts` is used in dev/start scripts (dev uses `nodemon` + `tsx` to run `server.ts`).
- DB: Prisma schema in `prisma/schema.prisma`; prisma client helper is at `src/lib/db.ts`.
- Auth: NextAuth integration and guards live in `src/lib/auth.ts` and role-protecting layouts like `src/app/admin/layout.tsx`.
- Real-time: Socket.IO helpers in `src/lib/socket.ts` and example client in `examples/websocket/page.tsx`.

Primary developer scripts (from `package.json`)
- Install: `npm install`
- Dev (runs `server.ts` and watches): `npm run dev` (writes `dev.log`).
- Build (Next): `npm run build`; Start prod: `npm start`.
- Prisma: `npm run db:push`, `npm run db:generate`, `npm run db:migrate`, `npm run db:reset`.
- Seed: `npm run db:seed` (runs `tsx prisma/seed.ts`) or POST `/api/seed`.

Conventions & patterns to follow
- API routes: create under `src/app/api/<entity>/...`. Responses follow the shape: `{ success: boolean, data?: any, error?: string }`.
- DB access: always import the Prisma client from `src/lib/db.ts` to preserve connection handling.
- Auth guards: enforce role-based redirects in the layout files (see `src/app/admin/layout.tsx` and `src/app/employee/layout.tsx`).
- UI: shared atomic components live in `components/ui/` (shadcn patterns). Reuse these for consistent styling.
- State: auth uses `contexts/auth-context.tsx`; lightweight UI state uses Zustand.

Small contract when modifying server/API
- Inputs: HTTP request body/params under `src/app/api/*`.
- Outputs: `{ success, data, error }` JSON + proper HTTP status codes.
- Errors: surface errors with `error` string and appropriate 4xx/5xx status.

Quick editing workflow
1. Update Prisma schema (`prisma/schema.prisma`) → `npm run db:push` → `npm run db:generate`.
2. If needed, seed with `npm run db:seed` or POST `/api/seed`.
3. Run `npm run dev` to test changes; check `dev.log` for server output.

Files to inspect for examples
- Role guards: `src/app/admin/layout.tsx`, `src/app/employee/layout.tsx`
- DB helper: `src/lib/db.ts`; Prisma schema: `prisma/schema.prisma`
- Auth: `src/lib/auth.ts`
- Socket usage: `src/lib/socket.ts`, `examples/websocket/page.tsx`
- API pattern: any file under `src/app/api/` (follow existing handlers)

Notes / limitations
- There is no test framework configured in the repo; adding tests should include a package.json update.
- Follow existing code style and TypeScript types; small edits should preserve public APIs.

If anything here is unclear or you want me to expand an area (e.g., typical request validation, more example API handlers, or a starter PR template), tell me which section to expand.

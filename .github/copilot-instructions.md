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
- Follow `/api/[entity]/[action]` pattern
- Return standardized response format:
  ```typescript
  { success: boolean, data?: any, error?: string }
  ```

### State Management
- Auth state: React Context (`contexts/auth-context.tsx`)
- UI state: Zustand stores
- Server state: React Query patterns

### Error Handling
- API errors use HTTP status codes
- Client-side notifications via `useToast` hook
- Authentication errors redirect to login

## Integration Points
- NextAuth.js for authentication (`src/lib/auth.ts`)
- Socket.io for real-time features (`src/lib/socket.ts`)
- Prisma for database (`src/lib/db.ts`)
- shadcn/ui for components (`components/ui/*`)

## Common Tasks
1. **Adding New API Route**
   - Create in `src/app/api/`
   - Use Prisma client for DB operations
   - Follow error handling pattern

2. **Creating New Page**
   - Place in appropriate role directory
   - Use layout for auth protection
   - Follow component composition pattern

3. **Database Changes**
   - Update `schema.prisma`
   - Run `npm run db:push`
   - Update affected queries
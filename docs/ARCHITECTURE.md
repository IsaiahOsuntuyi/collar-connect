# Architecture Overview - NextGen Collar

## 1. System High-Level Design
NextGen Collar is a professional network designed to elevate rising talent and connect students with industry mentors and recruiters. The application is built as a single-page application (SPA) backed by a managed BaaS (Supabase) architecture.

```
[ Client: Vite + React 18 SPA ]
           |
           +---> [ Supabase Auth ] (JWT / Sessions)
           |
           +---> [ Supabase PostgreSQL ] (Data + Row-Level Security)
           |
           +---> [ Supabase Storage & Edge Functions ] (Deno runtime)
```

---

## 2. Frontend Stack
- **Framework & Runtime:** React 18 with TypeScript
- **Bundler & Build Tool:** Vite
- **Styling:** Tailwind CSS with HSL color-variable theming (`src/index.css`)
- **UI Components:** shadcn/ui built on Radix UI primitives (`components.json`)
- **Icons:** Lucide React
- **Routing:** React Router DOM
- **Server State & Caching:** TanStack Query (React Query)
- **Forms & Validation:** React Hook Form with Zod schemas
- **Data Visualization:** Recharts

---

## 3. Backend & Data Layer (Supabase)
- **Database:** PostgreSQL with Row Level Security (RLS) policies enforcing tenant isolation.
- **Authentication:** Supabase Auth (email/password, OAuth providers, session management via `@supabase/client`).
- **Edge Functions:** Deno runtime functions for server-side logic (e.g., account deletion, notification dispatch).
- **Client Instance:** Located at `src/integrations/supabase/client.ts`.

---

## 4. Directory Structure
```
├── docs/                 # Developer guides, architecture, setup
├── public/               # Static assets & icons
├── src/
│   ├── components/       # Reusable UI & domain-specific components
│   │   ├── ui/           # shadcn/ui primitive components
│   │   └── ...           # Feature components (navigation, auth, feeds)
│   ├── hooks/            # Custom React hooks (toast, auth, queries)
│   ├── integrations/     # Third-party configurations (Supabase client)
│   ├── pages/            # Route view components
│   ├── index.css         # Global design tokens and mobile viewport resets
│   └── main.tsx          # Application entry point
├── supabase/             # Migrations, config, and edge function definitions
├── components.json       # shadcn/ui configuration
├── tailwind.config.ts    # Tailwind styling tokens & plugins
└── vite.config.ts        # Vite configuration & path aliases
```

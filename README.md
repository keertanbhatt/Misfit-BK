# Backend — Misfit API

Express + TypeScript + Prisma. **Neon PostgreSQL only.**

## Source map

- `src/config` — env & third-party clients
- `src/controllers` — HTTP layer
- `src/services` — business logic
- `src/repositories` — Prisma data access
- `src/routes` — `/api/v1` routers
- `src/middlewares` — auth, roles, validation, errors
- `src/validators` — request schemas
- `src/prisma` — Prisma client singleton
- `prisma/` — schema + migrations (Module 2)

Runtime bootstrap arrives in **Module 3 — Backend Setup**.
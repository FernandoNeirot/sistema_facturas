# App de Facturas

Monorepo con dos proyectos independientes (sin tooling de monorepo compartido, cada uno con su propio `node_modules`):

- `server/` — API REST en **NestJS** + TypeScript + Prisma + SQLite.
- `web/` — Frontend en **Next.js** (App Router) + Tailwind CSS v4.

No hay autenticación ni multi-usuario: es una app de un solo usuario, pensada para uso local/personal, no para producción multi-tenant.

## Cómo correr el proyecto

Backend:
```bash
cd server
npm install
npm run prisma:migrate   # crea/actualiza server/prisma/dev.db
npm run dev               # nest start --watch, http://localhost:4000
```

Frontend:
```bash
cd web
npm install
npm run dev               # http://localhost:3000
```

El frontend lee la URL de la API de `web/.env.local` (`NEXT_PUBLIC_API_URL`, default `http://localhost:4000/api`).

## Backend (`server/`)

- Todas las rutas quedan bajo el prefijo global `/api` (configurado en `src/main.ts`).
- Organizado **por módulo de dominio**, no por tipo de archivo:
  - `src/prisma/` — `PrismaModule` (`@Global()`) + `PrismaService` (extiende `PrismaClient`).
  - `src/clients/` — controller, service, DTOs (`class-validator`).
  - `src/invoices/` — controller, service, DTOs; incluye el endpoint de descarga de PDF (`GET /invoices/:id/pdf`).
  - `src/pdf/generate-invoice-pdf.ts` — función pura con `pdfkit`, no es un provider de Nest.
  - `src/health.controller.ts` — `GET /health`.
- **Arquitectura**: capas simples `Controller → Service → PrismaService`, sin Repository Pattern ni capa de dominio separada. Los services llaman a Prisma directamente; los controllers devuelven el resultado de Prisma tal cual (sin DTO de serialización de salida todavía).
- Validación de entrada con `class-validator`/`class-transformer` vía `ValidationPipe` global (`whitelist: true, transform: true`).
- `@nestjs/mapped-types` está fijado en `2.1.1` (no la `12.x`) porque esa versión es ESM-only y rompe Jest bajo la config CommonJS del proyecto — no actualizar sin resolver eso primero.
- Modelo de datos: `Client` 1—N `Invoice` 1—N `InvoiceItem` (ver `prisma/schema.prisma`). El `total` de una factura se calcula en runtime a partir de sus ítems, no se persiste. La numeración de factura (`INV-00001`, ...) se genera contando registros existentes.
- Tests: solo hay un e2e (`test/app.e2e-spec.ts`) que pega a `/health`. No hay unit tests de services todavía.

## Frontend (`web/`)

- App Router. Todas las páginas siguen siendo `"use client"` (no se usan Server Components para data fetching ni Server Actions para mutaciones), pero el estado y la validación siguen el stack definido por el skill `react-rules`:
  - **React Query** (`@tanstack/react-query`) para data fetching/cache/invalidación — capa de hooks en `src/hooks/` (`use-clients.ts`, `use-invoices.ts`), que llaman a `src/lib/api.ts` (fetch manual, sin cambios) como `queryFn`/`mutationFn`. `src/lib/query-client.ts` + `src/components/query-provider.tsx` proveen el `QueryClient` (montado en `layout.tsx`).
  - **Zod** para esquemas/validación (`src/schemas/client.schema.ts`, `src/schemas/invoice.schema.ts`) — los tipos (`Client`, `Invoice`, `InvoiceStatus`, etc.) se infieren de estos esquemas (`z.infer`) en vez de declararse a mano; `lib/api.ts` los reexporta.
  - **React Hook Form + Zod** (`@hookform/resolvers/zod`) en los formularios de `/clients` y `/invoices/new`. El de nueva factura usa `useFieldArray` para los ítems dinámicos y tipa `useForm` con `z.input`/`z.output` del schema porque `quantity`/`unitPrice` usan `z.coerce.number()`.
  - **Zustand** (`src/store/ui-store.ts`) solo para el toast global de errores/éxitos de mutations (`src/components/toast.tsx`, montado en `layout.tsx`) — los errores de validación de campo siguen mostrándose inline vía `formState.errors` (`src/components/ui/error-text.tsx`), el store no los reemplaza.
  - Componentes chicos reutilizables en `src/components/ui/` (`button.tsx`, `card.tsx`, `status-badge.tsx`, `error-text.tsx`) además de `theme-provider.tsx`/`theme-toggle.tsx`.
  - Formatters de fecha/moneda centralizados en `src/lib/format.ts` (antes duplicados en cada página).
- Rutas: `/` (listado de facturas), `/clients` (alta + listado), `/invoices/new` (alta de factura con ítems dinámicos), `/invoices/[id]` (detalle, cambio de estado, descarga de PDF).
- **Tema claro/oscuro**: `next-themes` + Tailwind con `@custom-variant dark (&:where(.dark, .dark *))` en `globals.css` (modo oscuro por clase, no por `prefers-color-scheme`). Constantes de clases compartidas (`inputClass`, `labelClass`, `cardClass`, `itemInputClass`) en `src/lib/ui.ts` para no repetir los pares de clases claro/oscuro en cada input.
- UI en **español** (textos, labels, mensajes de error) — mantener ese idioma en cambios nuevos salvo que se indique lo contrario.

## Skills disponibles

- **`explain-code`** — resume el codebase (tecnologías con versiones, funcionalidades, estructura de directorios, componentes principales, base de datos). Trigger: pedidos de explicar/resumir el proyecto.
- **`react-rules`** — define el stack obligatorio para features de React/Next nuevas o modificadas: TypeScript, Zustand (estado global), Zod (validación de esquemas), React Hook Form + Zod (formularios), React Query o SWR (data fetching con cache), componentes chicos de una sola responsabilidad, sin lógica derivada en `useEffect`. Trigger: crear o modificar componentes, hooks, estado, formularios o lógica de UI en React/Next.

## Convenciones generales

- TypeScript estricto en ambos proyectos; no bajar `strict`/`strictNullChecks` para "resolver" un error de tipos.
- Antes de dar por terminado un cambio de UI, verificar en navegador real (Playwright vía script ad-hoc en el scratchpad de la sesión) en vez de confiar solo en el type-check — varias veces esto encontró bugs reales (ej. desplazamiento de fechas por timezone, un `<select>` que rompía el layout).

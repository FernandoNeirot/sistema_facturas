# App de Facturas

Monorepo con dos proyectos independientes:

- `server/` — API REST (NestJS + TypeScript + Prisma + SQLite) que expone clientes, facturas y generación de PDF.
- `web/` — Frontend (Next.js + Tailwind CSS) que consume la API.

## Requisitos

- Node.js 20+

## Levantar el backend

```bash
cd server
npm install
npm run prisma:migrate   # crea/actualiza dev.db
npm run dev              # http://localhost:4000 (nest start --watch)
```

Todas las rutas quedan bajo el prefijo global `/api` (p. ej. `/api/clients`, `/api/invoices`).

## Levantar el frontend

```bash
cd web
npm install
npm run dev               # http://localhost:3000
```

El frontend lee la URL de la API desde `web/.env.local` (`NEXT_PUBLIC_API_URL`, por defecto `http://localhost:4000/api`).

## Funcionalidad

- CRUD de clientes (`/clients`).
- CRUD de facturas con ítems (`/invoices/new`), cambio de estado (DRAFT/SENT/PAID/OVERDUE).
- Descarga de factura en PDF desde el detalle de la factura.

## Modelo de datos (Prisma)

`Client` 1—N `Invoice` 1—N `InvoiceItem`. El total de cada factura se calcula a partir de sus ítems (no se persiste).

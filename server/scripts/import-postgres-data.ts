/**
 * Importa el JSON generado por export-sqlite-data.ts a la base Postgres
 * (Supabase) ya migrada. Preserva los IDs originales para no romper
 * relaciones.
 *
 * Uso: npm run import-postgres-data
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ExportedData {
  users: { id: string; username: string; passwordHash: string; createdAt: string }[];
  clients: {
    id: string;
    name: string;
    email: string | null;
    taxId: string | null;
    address: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  invoices: {
    id: string;
    number: string;
    status: string;
    issueDate: string;
    dueDate: string;
    notes: string | null;
    clientId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  invoiceItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    invoiceId: string;
  }[];
}

async function main() {
  const inPath = path.join(__dirname, '..', 'prisma', 'data-export.json');
  const data: ExportedData = JSON.parse(fs.readFileSync(inPath, 'utf-8'));

  if (data.users.length) {
    await prisma.user.createMany({
      data: data.users.map((u) => ({ ...u, createdAt: new Date(u.createdAt) })),
    });
  }

  if (data.clients.length) {
    await prisma.client.createMany({
      data: data.clients.map((c) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      })),
    });
  }

  if (data.invoices.length) {
    await prisma.invoice.createMany({
      data: data.invoices.map((i) => ({
        ...i,
        status: i.status as never,
        issueDate: new Date(i.issueDate),
        dueDate: new Date(i.dueDate),
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt),
      })),
    });
  }

  if (data.invoiceItems.length) {
    await prisma.invoiceItem.createMany({ data: data.invoiceItems });
  }

  console.log(
    `Importado: ${data.users.length} usuarios, ${data.clients.length} clientes, ${data.invoices.length} facturas, ${data.invoiceItems.length} ítems`,
  );
}

void main().finally(() => prisma.$disconnect());

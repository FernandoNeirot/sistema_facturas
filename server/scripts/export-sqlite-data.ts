/**
 * Exporta todos los datos de la base SQLite actual a un JSON, como paso
 * previo a migrar la persistencia a PostgreSQL (Supabase).
 *
 * Uso: npm run export-sqlite-data
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const [users, clients, invoices, invoiceItems] = await Promise.all([
    prisma.user.findMany(),
    prisma.client.findMany(),
    prisma.invoice.findMany(),
    prisma.invoiceItem.findMany(),
  ]);

  const data = { users, clients, invoices, invoiceItems };
  const outPath = path.join(__dirname, '..', 'prisma', 'data-export.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

  console.log(`Exportado: ${users.length} usuarios, ${clients.length} clientes, ${invoices.length} facturas, ${invoiceItems.length} ítems`);
  console.log(`Archivo: ${outPath}`);
}

void main().finally(() => prisma.$disconnect());

import PDFDocument from 'pdfkit';

type InvoiceForPdf = {
  number: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  notes: string | null;
  total: number;
  client: {
    name: string;
    email: string | null;
    taxId: string | null;
    address: string | null;
  };
  items: { description: string; quantity: number; unitPrice: number }[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
    value,
  );

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('es-AR', { timeZone: 'UTC' });

export function generateInvoicePdf(
  invoice: InvoiceForPdf,
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(20).text(`Factura ${invoice.number}`, { align: 'right' });
  doc
    .fontSize(10)
    .fillColor('#555')
    .text(`Estado: ${invoice.status}`, { align: 'right' });
  doc.moveDown(2);

  doc.fillColor('#000').fontSize(12).text('Cliente', { underline: true });
  doc.fontSize(10).text(invoice.client.name);
  if (invoice.client.email) doc.text(invoice.client.email);
  if (invoice.client.taxId) doc.text(`CUIT/Tax ID: ${invoice.client.taxId}`);
  if (invoice.client.address) doc.text(invoice.client.address);

  doc.moveDown();
  doc.fontSize(10).text(`Fecha de emisión: ${formatDate(invoice.issueDate)}`);
  doc.text(`Fecha de vencimiento: ${formatDate(invoice.dueDate)}`);
  doc.moveDown();

  const tableTop = doc.y + 10;
  const col = { description: 50, quantity: 300, unitPrice: 380, subtotal: 470 };

  doc.fontSize(10).text('Descripción', col.description, tableTop);
  doc.text('Cant.', col.quantity, tableTop);
  doc.text('Precio', col.unitPrice, tableTop);
  doc.text('Subtotal', col.subtotal, tableTop);
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(545, tableTop + 15)
    .stroke();

  let y = tableTop + 25;
  for (const item of invoice.items) {
    const subtotal = item.quantity * item.unitPrice;
    doc.text(item.description, col.description, y, { width: 240 });
    doc.text(String(item.quantity), col.quantity, y);
    doc.text(formatCurrency(item.unitPrice), col.unitPrice, y);
    doc.text(formatCurrency(subtotal), col.subtotal, y);
    y += 20;
  }

  doc
    .moveTo(50, y + 5)
    .lineTo(545, y + 5)
    .stroke();
  doc
    .fontSize(12)
    .text(`Total: ${formatCurrency(invoice.total)}`, col.subtotal - 80, y + 15);

  if (invoice.notes) {
    doc.moveDown(3);
    doc.fontSize(10).fillColor('#555').text(`Notas: ${invoice.notes}`);
  }

  doc.end();
  return doc;
}

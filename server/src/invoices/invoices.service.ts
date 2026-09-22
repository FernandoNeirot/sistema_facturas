import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

const invoiceWithRelations = {
  client: true,
  items: true,
} as const;

function withTotal<
  T extends { items: { quantity: number; unitPrice: number }[] },
>(invoice: T) {
  const total = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  return { ...invoice, total };
}

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const invoices = await this.prisma.invoice.findMany({
      include: invoiceWithRelations,
      orderBy: { createdAt: 'desc' },
    });
    return invoices.map(withTotal);
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: invoiceWithRelations,
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return withTotal(invoice);
  }

  private async nextInvoiceNumber() {
    const count = await this.prisma.invoice.count();
    return `INV-${String(count + 1).padStart(5, '0')}`;
  }

  async create(dto: CreateInvoiceDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) throw new BadRequestException('Unknown clientId');

    const number = await this.nextInvoiceNumber();

    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        clientId: dto.clientId,
        dueDate: new Date(dto.dueDate),
        notes: dto.notes,
        items: { create: dto.items },
      },
      include: invoiceWithRelations,
    });

    return withTotal(invoice);
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    await this.findOne(id);

    const invoice = await this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      }
      return tx.invoice.update({
        where: { id },
        data: {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          notes: dto.notes,
          status: dto.status,
          items: dto.items ? { create: dto.items } : undefined,
        },
        include: invoiceWithRelations,
      });
    });

    return withTotal(invoice);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.invoice.delete({ where: { id } });
  }

  async getForPdf(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: invoiceWithRelations,
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return withTotal(invoice);
  }
}

import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: {
    invoice: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    client: {
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let tx: {
    invoiceItem: { deleteMany: jest.Mock };
    invoice: { update: jest.Mock };
  };

  const items = [
    { description: 'Item 1', quantity: 2, unitPrice: 10 },
    { description: 'Item 2', quantity: 1, unitPrice: 5 },
  ];

  beforeEach(async () => {
    tx = {
      invoiceItem: { deleteMany: jest.fn() },
      invoice: { update: jest.fn() },
    };

    prisma = {
      invoice: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      client: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(
        (callback: (transaction: typeof tx) => Promise<unknown>) =>
          callback(tx),
      ),
    };

    const module = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(InvoicesService);
  });

  describe('findAll', () => {
    it('adds a computed total to every invoice', async () => {
      prisma.invoice.findMany.mockResolvedValue([{ id: '1', items }]);

      const result = await service.findAll();

      expect(result).toEqual([{ id: '1', items, total: 25 }]);
    });
  });

  describe('findOne', () => {
    it('returns the invoice with a computed total', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: '1', items });

      const result = await service.findOne('1');

      expect(result).toEqual({ id: '1', items, total: 25 });
    });

    it('throws NotFoundException when the invoice does not exist', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const dto: CreateInvoiceDto = {
      clientId: 'client-1',
      dueDate: '2026-10-01',
      notes: undefined,
      items,
    };

    it('throws BadRequestException when the client does not exist', async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.invoice.create).not.toHaveBeenCalled();
    });

    it('numbers the invoice from the current invoice count', async () => {
      prisma.client.findUnique.mockResolvedValue({ id: 'client-1' });
      prisma.invoice.count.mockResolvedValue(4);
      prisma.invoice.create.mockResolvedValue({
        id: 'inv-1',
        number: 'INV-00005',
        items,
      });

      const result = await service.create(dto);

      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          number: 'INV-00005',
          clientId: 'client-1',
          items: { create: items },
        }) as Record<string, unknown>,
        include: { client: true, items: true },
      });
      expect(result.total).toBe(25);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the invoice does not exist', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', {})).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('replaces existing items when new items are provided', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: '1', items });
      tx.invoice.update.mockResolvedValue({ id: '1', items });

      await service.update('1', { items });

      expect(tx.invoiceItem.deleteMany).toHaveBeenCalledWith({
        where: { invoiceId: '1' },
      });
      expect(tx.invoice.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          items: { create: items },
        }) as Record<string, unknown>,
        include: { client: true, items: true },
      });
    });

    it('leaves existing items untouched when no items are provided', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: '1', items });
      tx.invoice.update.mockResolvedValue({ id: '1', items });

      await service.update('1', { notes: 'updated' });

      expect(tx.invoiceItem.deleteMany).not.toHaveBeenCalled();
      expect(tx.invoice.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          items: undefined,
        }) as Record<string, unknown>,
        include: { client: true, items: true },
      });
    });
  });

  describe('remove', () => {
    it('deletes an existing invoice', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: '1', items });

      await service.remove('1');

      expect(prisma.invoice.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('throws NotFoundException when removing a missing invoice', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.invoice.delete).not.toHaveBeenCalled();
    });
  });

  describe('getForPdf', () => {
    it('returns the invoice with a computed total', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: '1', items });

      const result = await service.getForPdf('1');

      expect(result).toEqual({ id: '1', items, total: 25 });
    });

    it('throws NotFoundException when the invoice does not exist', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);

      await expect(service.getForPdf('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

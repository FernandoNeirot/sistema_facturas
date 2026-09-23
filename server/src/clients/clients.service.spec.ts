import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: {
    client: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      client: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [ClientsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ClientsService);
  });

  describe('findAll', () => {
    it('returns clients ordered by most recent', async () => {
      const clients = [{ id: '1', name: 'Acme' }];
      prisma.client.findMany.mockResolvedValue(clients);

      const result = await service.findAll();

      expect(result).toBe(clients);
      expect(prisma.client.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('returns the client when found', async () => {
      const client = { id: '1', name: 'Acme' };
      prisma.client.findUnique.mockResolvedValue(client);

      const result = await service.findOne('1');

      expect(result).toBe(client);
      expect(prisma.client.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('throws NotFoundException when the client does not exist', async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a client from the dto', async () => {
      const dto = { name: 'Acme', email: 'acme@example.com' };
      const created = { id: '1', ...dto };
      prisma.client.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toBe(created);
      expect(prisma.client.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('update', () => {
    it('updates an existing client', async () => {
      const dto = { name: 'Acme Renamed' };
      prisma.client.findUnique.mockResolvedValue({ id: '1', name: 'Acme' });
      const updated = { id: '1', name: 'Acme Renamed' };
      prisma.client.update.mockResolvedValue(updated);

      const result = await service.update('1', dto);

      expect(result).toBe(updated);
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
    });

    it('throws NotFoundException when updating a missing client', async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', {})).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.client.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes an existing client', async () => {
      prisma.client.findUnique.mockResolvedValue({ id: '1', name: 'Acme' });
      prisma.client.delete.mockResolvedValue(undefined);

      await service.remove('1');

      expect(prisma.client.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('throws NotFoundException when removing a missing client', async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.client.delete).not.toHaveBeenCalled();
    });
  });
});

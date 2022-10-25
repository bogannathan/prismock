import { PrismaClient } from '@prisma/client';

import { resetDb, simulateSeed, buildUser, formatEntries, generateId } from '../../testing';
import { PrismockClient } from '../lib/client';
import { generatePrismock } from '../lib/prismock';

jest.setTimeout(15000);

describe('updateMany', () => {
  let prismock: PrismockClient;
  let prisma: PrismaClient;

  let realUpdateMany: { count: number };
  let mockUpdateMany: { count: number };

  beforeAll(async () => {
    await resetDb();

    prisma = new PrismaClient();
    prismock = await generatePrismock();
    simulateSeed(prismock);

    realUpdateMany = await prisma.user.updateMany({
      where: { id: { in: [generateId(2), generateId(3)] } },
      data: { warnings: 99 },
    });
    mockUpdateMany = await prismock.user.updateMany({
      where: { id: { in: [generateId(2), generateId(3)] } },
      data: { warnings: 99 },
    });
  });

  it('Should return count', () => {
    expect(realUpdateMany).toEqual({ count: 2 });
    expect(mockUpdateMany).toEqual({ count: 2 });
  });

  it('Should return count 0 if not match', async () => {
    expect(await prisma.user.updateMany({ where: { id: generateId(0) }, data: { warnings: 50 } })).toEqual({ count: 0 });
    expect(await prismock.user.updateMany({ where: { id: generateId(0) }, data: { warnings: 50 } })).toEqual({ count: 0 });
  });

  it('Should update stored data', async () => {
    const expectedStore = [buildUser(1, { warnings: 0 }), buildUser(2, { warnings: 99 }), buildUser(3, { warnings: 99 })];
    const mockStored = prismock.getData().user;
    const stored = await prisma.user.findMany();

    expect(formatEntries(stored)).toEqual(formatEntries(expectedStore));
    expect(formatEntries(mockStored)).toEqual(formatEntries(expectedStore));
  });
});

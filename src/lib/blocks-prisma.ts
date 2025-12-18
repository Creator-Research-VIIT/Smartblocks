import prisma from '@/lib/prisma';
import { Block } from '@prisma/client';

export async function getBlocks(category?: string, limit = 50, offset = 0): Promise<Block[]> {
  return prisma.block.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });
}

export async function getBlocksCount(
  category?: string,
  search?: string
): Promise<number> {
  return prisma.block.count({
    where: {
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
  });
}


export async function getBlockById(id: number): Promise<Block | null> {
  return prisma.block.findUnique({ where: { id } });
}

export async function createBlock(data: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>): Promise<Block> {
  // Ensure URL uniqueness at app-level (consider unique index in DB)
  const existing = await prisma.block.findFirst({ where: { url: data.url } });
  if (existing) throw new Error('URL already exists');
  return prisma.block.create({ data });
}

export async function updateBlock(id: number, data: Partial<Omit<Block, 'id'>>): Promise<Block | null> {
  try {
    return await prisma.block.update({ where: { id }, data });
  } catch (e) {
    return null;
  }
}

export async function deleteBlock(id: number): Promise<boolean> {
  try {
    await prisma.block.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
export async function searchBlocks(
  term: string,
  limit = 20,
  offset = 0
): Promise<Block[]> {
  const q = term.trim();
  if (!q) return [];

  return prisma.block.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,   // ✅ pagination
    take: limit,
  });
}

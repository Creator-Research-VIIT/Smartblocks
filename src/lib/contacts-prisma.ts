import prisma from '@/lib/prisma';
import { ContactMessage, Prisma } from '@prisma/client';

export type ContactFilters = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

export async function createContact(
  data: Omit<ContactMessage, 'id' | 'createdAt' | 'updatedAt' | 'repliedAt' | 'isVerified' | 'status'> & {
    captchaScore?: number | null;
    isVerified?: boolean;
    status?: string;
  }
): Promise<ContactMessage> {
  return prisma.contactMessage.create({
    data: {
      ...data,
      isVerified: data.isVerified ?? false,
      status: data.status ?? 'new',
    },
  });
}

export async function getContacts({ page = 1, limit = 20, status, search }: ContactFilters) {
  const where: Prisma.ContactMessageWhereInput = {
    ...(status && status !== 'all' ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { company: { contains: search, mode: 'insensitive' as const } },
            { subject: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [contacts, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return { contacts, total, totalPages: Math.ceil(total / limit) };
}

export async function getContactById(id: number) {
  return prisma.contactMessage.findUnique({ where: { id } });
}

export async function updateContactStatus(
  id: number,
  status: string,
  adminNotes?: string,
  repliedBy?: string
) {
  try {
    return await prisma.contactMessage.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes ?? undefined,
        repliedBy: repliedBy ?? undefined,
        repliedAt: status === 'replied' ? new Date() : undefined,
      },
    });
  } catch (e) {
    return null;
  }
}

export async function updateContact(id: number, data: Partial<ContactMessage>) {
  try {
    const { id: _omit, createdAt: _c, updatedAt: _u, ...rest } = data as any;
    return await prisma.contactMessage.update({ where: { id }, data: rest });
  } catch {
    return null;
  }
}

export async function deleteContact(id: number): Promise<boolean> {
  try {
    await prisma.contactMessage.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

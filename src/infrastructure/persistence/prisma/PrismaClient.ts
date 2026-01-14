import { PrismaClient as PrismaClientType } from '@prisma/client';

let prismaClient: PrismaClientType | null = null;

export function getPrismaClient(): PrismaClientType {
  if (!prismaClient) {
    prismaClient = new PrismaClientType({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaClient;
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Обработка завершения работы приложения
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma; 
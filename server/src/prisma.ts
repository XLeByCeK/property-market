import { PrismaClient } from "@prisma/client";

// Export a single PrismaClient instance to be used across the app
const prisma = new PrismaClient();

// Handle application shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma; 
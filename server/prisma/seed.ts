import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting seed...');

    // Create test users
    const password = await bcrypt.hash('password123', 10);
    const birthDate = new Date('1990-01-01');
    
    const seller = await prisma.users.create({
      data: {
        login: 'seller',
        email: 'seller@example.com',
        password,
        date_of_birth: birthDate,
        phone_number: '+79001234567',
        photo: 'seller.jpg',
      },
    });

    console.log('Seller created:', seller.id);

    const buyer = await prisma.users.create({
      data: {
        login: 'buyer',
        email: 'buyer@example.com',
        password,
        date_of_birth: birthDate,
        phone_number: '+79007654321',
        photo: 'buyer.jpg',
      },
    });

    console.log('Buyer created:', buyer.id);

    const admin = await prisma.users.create({
      data: {
        login: 'admin',
        email: 'admin@example.com',
        password,
        date_of_birth: birthDate,
        phone_number: '+79009876543',
        photo: 'admin.jpg',
      },
    });

    console.log('Admin created:', admin.id);
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
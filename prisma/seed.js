// Simple seed script for Prisma
// Run: node prisma/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Blocks if empty
  const count = await prisma.block.count();
  if (count === 0) {
    await prisma.block.createMany({
      data: [
        {
          title: 'CreatorIT Website',
          description: 'Our main company site',
          url: 'https://creatorit.com',
          color: '#0ea5e9',
          category: 'company',
        },
        {
          title: 'Docs Portal',
          description: 'Internal documentation',
          url: 'https://docs.creatorit.com',
          color: '#10b981',
          category: 'internal',
        },
      ],
    });
    console.log('Seeded sample blocks');
  } else {
    console.log(`Blocks already present (${count})`);
  }

  // Optional: seed a sample contact
  const contacts = await prisma.contactMessage.count();
  if (contacts === 0) {
    await prisma.contactMessage.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 555-111-2222',
        countryCode: '+1',
        company: 'Example Co.',
        subject: 'Project Inquiry',
        serviceInterest: 'web-development',
        budgetRange: '5k-10k',
        message: 'Hello! I would like to discuss a new project.',
        isVerified: true,
        status: 'new',
      },
    });
    console.log('Seeded sample contact');
  } else {
    console.log(`Contacts already present (${contacts})`);
  }

  console.log('Seeding done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

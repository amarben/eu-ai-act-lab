import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Cleaning up test data...');

  // Delete all AI Recruitment Assistant systems
  const deleted = await prisma.aISystem.deleteMany({
    where: {
      name: 'AI Recruitment Assistant',
    },
  });

  console.log(`✅ Deleted ${deleted.count} AI Recruitment Assistant systems`);

  // Count remaining systems
  const remaining = await prisma.aISystem.count();
  console.log(`📊 Remaining AI systems: ${remaining}`);

  await prisma.$disconnect();
}

cleanup().catch(console.error);

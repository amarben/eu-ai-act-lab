/**
 * Seed Test User Script
 *
 * Creates a test user in the database for Playwright tests.
 * Run this script before running tests:
 *
 * npx tsx tests/helpers/seed-test-user.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test user...');

  const email = 'test@example.com';
  const password = 'testpassword123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Update the password hash to ensure it's correct
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword },
    });
    console.log('✅ Test user updated');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    return;
  }

  // Create organization first
  const organization = await prisma.organization.create({
    data: {
      name: 'Test Organization',
    },
  });

  // Create test user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name: 'Test User',
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });

  console.log('✅ Test user created successfully!');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Organization: ${organization.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

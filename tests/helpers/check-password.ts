/**
 * Check Password Script
 * Verifies the test user password hash
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = 'testpassword123';

  console.log('🔍 Checking test user password...\n');

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    },
  });

  if (!user) {
    console.log('❌ User not found!');
    process.exit(1);
  }

  console.log('✅ User found:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Has password hash: ${!!user.passwordHash}`);
  console.log();

  if (!user.passwordHash) {
    console.log('❌ No password hash found!');
    process.exit(1);
  }

  // Test password comparison
  const isValid = await bcrypt.compare(password, user.passwordHash);
  console.log(`Password check for "${password}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);

  if (!isValid) {
    console.log('\n⚠️  Password does not match! Regenerating hash...\n');
    const newHash = await bcrypt.hash(password, 10);
    console.log(`Old hash: ${user.passwordHash.substring(0, 30)}...`);
    console.log(`New hash: ${newHash.substring(0, 30)}...`);

    // Update the password
    await prisma.user.update({
      where: { email },
      data: { passwordHash: newHash },
    });

    console.log('\n✅ Password hash updated!');

    // Verify the new hash
    const verifyUser = await prisma.user.findUnique({
      where: { email },
      select: { passwordHash: true },
    });

    if (verifyUser?.passwordHash) {
      const finalCheck = await bcrypt.compare(password, verifyUser.passwordHash);
      console.log(`Final verification: ${finalCheck ? '✅ VALID' : '❌ STILL INVALID'}`);
    }
  } else {
    console.log('\n✅ Password is valid! Ready for testing.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

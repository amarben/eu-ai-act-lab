/**
 * Base Seed: TalentTech Organization and Users
 *
 * This seed creates the foundational TalentTech Solutions organization
 * and key personnel that appear throughout the EU AI Act course.
 *
 * Run independently: npx tsx prisma/seeds/00-base.ts
 * Or as part of lecture seeding: npm run db:seed:lecture -- --lecture=1
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding base TalentTech organization and users...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('talenttech-demo-2025', 10);

  // Create TalentTech Solutions organization
  const organization = await prisma.organization.upsert({
    where: { id: 'talenttech-org' },
    update: {},
    create: {
      id: 'talenttech-org',
      name: 'TalentTech Solutions',
      domain: 'talenttech.eu',
      industry: 'Recruitment & HR Technology',
      country: 'Germany',
      size: 'MEDIUM', // 250 employees
      description: 'Germany-based recruitment technology company specializing in AI-powered resume screening and candidate ranking solutions. Operates across 12 EU member states with 50+ enterprise clients.',
    },
  });

  console.log('✅ Created organization:', organization.name);

  // Create key TalentTech personnel
  const users = [
    {
      id: 'rachel-thompson',
      email: 'rachel.thompson@talenttech.eu',
      name: 'Rachel Thompson',
      role: 'Chief Risk Officer',
      department: 'Risk & Compliance',
      title: 'AI Governance Committee Chair',
    },
    {
      id: 'sarah-chen',
      email: 'sarah.chen@talenttech.eu',
      name: 'Sarah Chen',
      role: 'Chief Technology Officer',
      department: 'Engineering',
      title: 'CTO',
    },
    {
      id: 'michael-rodriguez',
      email: 'michael.rodriguez@talenttech.eu',
      name: 'Michael Rodriguez',
      role: 'Data Science Lead',
      department: 'Engineering',
      title: 'Lead Data Scientist',
    },
    {
      id: 'lisa-park',
      email: 'lisa.park@talenttech.eu',
      name: 'Lisa Park',
      role: 'Product Manager',
      department: 'Product',
      title: 'Senior Product Manager',
    },
    {
      id: 'jennifer-martinez',
      email: 'jennifer.martinez@talenttech.eu',
      name: 'Jennifer Martinez',
      role: 'Compliance Manager',
      department: 'Risk & Compliance',
      title: 'EU AI Act Compliance Manager',
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
        organizationId: organization.id,
      },
    });

    console.log(`✅ Created user: ${user.name} (${user.role})`);
  }

  console.log('');
  console.log('📊 Base seed summary:');
  console.log(`   - Organization: ${organization.name}`);
  console.log(`   - Users: ${users.length} key personnel`);
  console.log('   - Password for all users: talenttech-demo-2025');
  console.log('');
  console.log('✨ Base seed complete! TalentTech organization ready for course.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding base data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

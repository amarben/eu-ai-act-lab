/**
 * Progressive Lecture Seeding
 *
 * Seeds TalentTech data progressively based on lecture number.
 * Each lecture builds on previous lectures' data.
 *
 * Usage:
 *   npm run db:seed:lecture -- --lecture=2    # Seeds up to Lecture 2
 *   npm run db:seed:lecture -- --lecture=5    # Seeds up to Lecture 5
 *   npm run db:seed:lecture -- --all          # Seeds all 9 lectures
 */

import { PrismaClient, RiskLevel, ComplianceStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedBase() {
  console.log('🌱 Seeding base TalentTech organization and users...');

  const hashedPassword = await hash('talenttech-demo-2025', 10);

  const organization = await prisma.organization.upsert({
    where: { id: 'talenttech-org' },
    update: {},
    create: {
      id: 'talenttech-org',
      name: 'TalentTech Solutions',
      domain: 'talenttech.eu',
      industry: 'Recruitment & HR Technology',
      country: 'Germany',
      size: 'MEDIUM',
      description: 'Germany-based recruitment technology company specializing in AI-powered resume screening and candidate ranking solutions.',
    },
  });

  const users = [
    {
      id: 'rachel-thompson',
      email: 'rachel.thompson@talenttech.eu',
      name: 'Rachel Thompson',
      role: 'Chief Risk Officer',
      department: 'Risk & Compliance',
    },
    {
      id: 'sarah-chen',
      email: 'sarah.chen@talenttech.eu',
      name: 'Sarah Chen',
      role: 'Chief Technology Officer',
      department: 'Engineering',
    },
    {
      id: 'michael-rodriguez',
      email: 'michael.rodriguez@talenttech.eu',
      name: 'Michael Rodriguez',
      role: 'Data Science Lead',
      department: 'Engineering',
    },
    {
      id: 'lisa-park',
      email: 'lisa.park@talenttech.eu',
      name: 'Lisa Park',
      role: 'Product Manager',
      department: 'Product',
    },
    {
      id: 'jennifer-martinez',
      email: 'jennifer.martinez@talenttech.eu',
      name: 'Jennifer Martinez',
      role: 'Compliance Manager',
      department: 'Risk & Compliance',
    },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
        organizationId: organization.id,
      },
    });
  }

  console.log('✅ Base: Organization and 5 users created');
  return organization;
}

async function seedLecture2(organizationId: string) {
  console.log('📖 Lecture 2: Scope Assessment...');

  const aiSystem = await prisma.aISystem.upsert({
    where: { id: 'ai-recruitment-assistant' },
    update: {},
    create: {
      id: 'ai-recruitment-assistant',
      name: 'AI Recruitment Assistant',
      description: 'Automated resume screening and candidate ranking platform',
      purpose: 'Screen resumes, evaluate candidate qualifications, and generate ranked shortlists for hiring decisions',
      status: 'PRODUCTION',
      deploymentDate: new Date('2024-01-15'),
      organizationId,
    },
  });

  console.log('✅ Lecture 2: AI system registered (Scope Assessment complete)');
  return aiSystem;
}

async function seedLecture3(aiSystemId: string) {
  console.log('📖 Lecture 3: Risk Classification...');

  await prisma.riskClassification.upsert({
    where: { aiSystemId },
    update: {},
    create: {
      aiSystemId,
      riskLevel: RiskLevel.HIGH_RISK,
      category: 'EMPLOYMENT',
      reasoning: 'Annex III Section 4(a): AI systems intended to be used for recruitment or selection of natural persons',
      applicableArticles: ['Article 9', 'Article 10', 'Article 11', 'Article 13', 'Article 14', 'Article 15', 'Article 17', 'Article 43', 'Article 49', 'Article 72'],
      classifiedBy: 'rachel-thompson',
      classifiedAt: new Date('2025-01-15'),
    },
  });

  console.log('✅ Lecture 3: HIGH-RISK classification established');
}

async function seedLecture4(aiSystemId: string, organizationId: string) {
  console.log('📖 Lecture 4: Gap Assessment...');

  const gapAssessment = await prisma.gapAssessment.upsert({
    where: { aiSystemId },
    update: {},
    create: {
      aiSystemId,
      overallScore: 37,
      assessmentDate: new Date('2025-01-20'),
      assessedBy: 'jennifer-martinez',
      status: ComplianceStatus.GAP_IDENTIFIED,
      executiveSummary: 'Initial assessment shows 37% compliance across 24 high-risk requirements. Significant gaps in risk management, technical documentation, and post-market monitoring.',
    },
  });

  // Create sample requirement assessments
  const requirements = [
    { article: 'Article 9', name: 'Risk Management System', score: 25, status: 'GAP_IDENTIFIED' as ComplianceStatus },
    { article: 'Article 10', name: 'Data Governance', score: 45, status: 'PARTIALLY_COMPLIANT' as ComplianceStatus },
    { article: 'Article 11', name: 'Technical Documentation', score: 30, status: 'GAP_IDENTIFIED' as ComplianceStatus },
    { article: 'Article 17', name: 'Quality Management', score: 40, status: 'PARTIALLY_COMPLIANT' as ComplianceStatus },
  ];

  for (const req of requirements) {
    await prisma.requirementAssessment.create({
      data: {
        gapAssessmentId: gapAssessment.id,
        ...req,
      },
    });
  }

  console.log('✅ Lecture 4: Gap assessment showing 37% baseline compliance');
}

async function seedLecture5(organizationId: string) {
  console.log('📖 Lecture 5: AI Governance...');

  await prisma.aIGovernance.upsert({
    where: { organizationId },
    update: {},
    create: {
      organizationId,
      committeeChair: 'rachel-thompson',
      members: ['rachel-thompson', 'sarah-chen', 'michael-rodriguez', 'lisa-park', 'jennifer-martinez'],
      meetingFrequency: 'MONTHLY',
      lastMeetingDate: new Date('2025-01-25'),
      nextMeetingDate: new Date('2025-02-25'),
    },
  });

  console.log('✅ Lecture 5: Governance committee established');
}

async function main() {
  const args = process.argv.slice(2);
  const lectureArg = args.find(arg => arg.startsWith('--lecture='));
  const isAll = args.includes('--all');

  let targetLecture = 9; // Default to all lectures

  if (lectureArg) {
    targetLecture = parseInt(lectureArg.split('=')[1]);
  } else if (!isAll) {
    console.log('Usage: npx tsx prisma/seeds/index.ts --lecture=N or --all');
    console.log('Defaulting to --all (seed all lectures)');
  }

  console.log(`🎬 Starting progressive seed up to Lecture ${targetLecture}...`);
  console.log('');

  // Always seed base
  const org = await seedBase();

  // Lecture 2: Scope Assessment
  if (targetLecture >= 2) {
    const aiSystem = await seedLecture2(org.id);

    // Lecture 3: Risk Classification
    if (targetLecture >= 3) {
      await seedLecture3(aiSystem.id);

      // Lecture 4: Gap Assessment
      if (targetLecture >= 4) {
        await seedLecture4(aiSystem.id, org.id);

        // Lecture 5: Governance
        if (targetLecture >= 5) {
          await seedLecture5(org.id);
        }
      }
    }
  }

  console.log('');
  console.log('✨ Progressive seeding complete!');
  console.log(`   Seeded data up to Lecture ${targetLecture}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

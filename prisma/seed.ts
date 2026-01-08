import { PrismaClient, UserRole, RiskCategory, DeploymentStatus, ComplianceStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create TalentTech Solutions organization
  const organization = await prisma.organization.upsert({
    where: { id: 'talenttech-org' },
    update: {},
    create: {
      id: 'talenttech-org',
      name: 'TalentTech Solutions',
      legalName: 'TalentTech Solutions GmbH',
      registrationNumber: 'HRB-123456',
      headquarters: 'Frankfurt, Germany',
      region: 'EU',
      industry: 'TECHNOLOGY',
      size: 'MEDIUM',
      euPresence: true,
      description: 'Germany-based recruitment technology company specializing in AI-powered resume screening and candidate ranking solutions. Operates across 12 EU member states with 50+ enterprise clients.',
    },
  });

  console.log('✅ Created TalentTech organization:', organization.name);

  // Create TalentTech users
  const hashedPassword = await hash('talenttech-demo-2025', 12);

  const rachelThompson = await prisma.user.upsert({
    where: { email: 'rachel.thompson@talenttech.eu' },
    update: {},
    create: {
      email: 'rachel.thompson@talenttech.eu',
      name: 'Rachel Thompson',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      organizationId: organization.id,
    },
  });

  console.log('✅ Created Rachel Thompson (CRO):', rachelThompson.email);

  // Create demo compliance officer
  const complianceOfficer = await prisma.user.upsert({
    where: { email: 'jennifer.martinez@talenttech.eu' },
    update: {},
    create: {
      email: 'jennifer.martinez@talenttech.eu',
      name: 'Jennifer Martinez',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      organizationId: organization.id,
    },
  });

  console.log('✅ Created Jennifer Martinez (Compliance Manager):', complianceOfficer.email);

  // Create AI Recruitment Assistant
  const aiSystem = await prisma.aISystem.upsert({
    where: { id: 'ai-recruitment-assistant' },
    update: {},
    create: {
      id: 'ai-recruitment-assistant',
      name: 'AI Recruitment Assistant',
      businessPurpose: 'Automated resume screening and candidate ranking for enterprise hiring decisions',
      primaryUsers: ['EXTERNAL_CUSTOMERS', 'INTERNAL_EMPLOYEES'],
      deploymentStatus: DeploymentStatus.PRODUCTION,
      dataCategories: ['PERSONAL_DATA', 'BEHAVIORAL_DATA'],
      systemOwner: rachelThompson.name,
      technicalContact: rachelThompson.email,
      organizationId: organization.id,
    },
  });

  console.log('✅ Created AI Recruitment Assistant:', aiSystem.name);

  // Create risk classification
  const riskClassification = await prisma.riskClassification.upsert({
    where: { aiSystemId: aiSystem.id },
    update: {},
    create: {
      aiSystemId: aiSystem.id,
      category: RiskCategory.HIGH_RISK,
      prohibitedPractices: [],
      highRiskCategories: ['EMPLOYMENT'],
      interactsWithPersons: true,
      reasoning: 'Annex III Section 4(a): AI systems intended to be used for recruitment or selection of natural persons. System performs resume screening, filters applications, and generates candidate rankings that directly influence hiring decisions.',
      applicableRequirements: ['Article 9 - Risk Management', 'Article 10 - Data Governance', 'Article 11 - Technical Documentation', 'Article 13 - Transparency', 'Article 14 - Human Oversight', 'Article 15 - Accuracy & Robustness', 'Article 17 - Quality Management', 'Article 43 - Conformity Assessment', 'Article 49 - Registration', 'Article 72 - Post-Market Monitoring'],
    },
  });

  console.log('✅ Created HIGH-RISK classification for employment AI:', riskClassification.category);

  // Create gap assessment
  const gapAssessment = await prisma.gapAssessment.upsert({
    where: { aiSystemId: aiSystem.id },
    update: {},
    create: {
      aiSystemId: aiSystem.id,
      overallScore: 37,
      lastAssessedDate: new Date('2025-01-20'),
    },
  });

  console.log('✅ Created gap assessment with 37% baseline score:', gapAssessment.overallScore);

  // Create some gap assessment requirements
  const gapItems = await prisma.requirementAssessment.createMany({
    data: [
      {
        gapAssessmentId: gapAssessment.id,
        category: 'TRANSPARENCY',
        title: 'User notification of AI interaction',
        description: 'Users must be informed that they are interacting with an AI system',
        regulatoryReference: 'Article 52',
        status: ComplianceStatus.IN_PROGRESS,
        priority: 'HIGH',
        notes: 'Chatbot identifies itself but lacks detailed explanations about capabilities and limitations',
        updatedBy: complianceOfficer.id,
      },
      {
        gapAssessmentId: gapAssessment.id,
        category: 'RECORD_KEEPING',
        title: 'Record keeping',
        description: 'Maintain logs of AI system operations with complete metadata',
        regulatoryReference: 'Article 12',
        status: ComplianceStatus.IN_PROGRESS,
        priority: 'HIGH',
        notes: 'Basic logging exists but needs enhancement for full audit trail',
        updatedBy: complianceOfficer.id,
      },
      {
        gapAssessmentId: gapAssessment.id,
        category: 'HUMAN_OVERSIGHT',
        title: 'Human oversight',
        description: 'Ensure effective human oversight of AI system operations',
        regulatoryReference: 'Article 14',
        status: ComplianceStatus.IN_PROGRESS,
        priority: 'MEDIUM',
        notes: 'Manual intervention possible but needs structured oversight procedures',
        updatedBy: complianceOfficer.id,
      },
    ],
  });

  console.log('✅ Created gap assessment items:', gapItems.count);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 TalentTech Credentials:');
  console.log('   Rachel Thompson (CRO): rachel.thompson@talenttech.eu / talenttech-demo-2025');
  console.log('   Jennifer Martinez (Compliance): jennifer.martinez@talenttech.eu / talenttech-demo-2025');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

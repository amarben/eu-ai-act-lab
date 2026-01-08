import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Database Test Helpers
 *
 * Utilities for managing test data in the database
 */

// Load environment variables
config({ path: '.env.local' });

const prisma = new PrismaClient();

/**
 * Clean up test AI systems by name
 * @param systemName Name of the AI system to delete
 */
export async function cleanupAISystemsByName(systemName: string): Promise<void> {
  await prisma.aISystem.deleteMany({
    where: {
      name: systemName,
    },
  });
}

/**
 * Clean up all AI systems for a specific organization
 * @param organizationId Organization ID
 */
export async function cleanupAISystemsByOrganization(organizationId: string): Promise<void> {
  await prisma.aISystem.deleteMany({
    where: {
      organizationId,
    },
  });
}

/**
 * Get the organization ID for the test user
 * @param userEmail Test user email
 */
export async function getTestUserOrganizationId(userEmail: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { organizationId: true },
  });
  return user?.organizationId || null;
}

/**
 * Clean up all test data for the test user's organization
 * This is useful for starting with a clean slate
 * Default email: rachel.thompson@talenttech.eu (TalentTech Solutions)
 */
export async function cleanupTestData(userEmail: string = 'rachel.thompson@talenttech.eu'): Promise<void> {
  const organizationId = await getTestUserOrganizationId(userEmail);
  if (organizationId) {
    await cleanupAISystemsByOrganization(organizationId);
  }
}

/**
 * Disconnect from the database
 * Call this in afterAll hooks to clean up connections
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Seed a test user with organization
 * Returns the user with organization details
 */
export async function seedTestUser() {
  const email = 'test@example.com';
  const password = 'testpassword123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  });

  if (user) {
    // Update the password hash to ensure it's correct
    user = await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword },
      include: { organization: true },
    });
    return user;
  }

  // Create organization first
  const organization = await prisma.organization.create({
    data: {
      name: 'Test Organization',
    },
  });

  // Create test user
  user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name: 'Test User',
      role: 'ADMIN',
      organizationId: organization.id,
    },
    include: { organization: true },
  });

  return user;
}

/**
 * Seed the admin demo user with organization
 * This is the user used in demo videos and tests
 * Returns the user with organization details
 */
export async function seedAdminDemoUser() {
  const email = 'rachel.thompson@talenttech.eu';
  const password = 'talenttech-demo-2025';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  });

  if (user) {
    // Update the password hash to ensure it's correct
    user = await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword },
      include: { organization: true },
    });
    return user;
  }

  // Create TalentTech Solutions organization first
  const organization = await prisma.organization.create({
    data: {
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

  // Create Rachel Thompson (CRO) as admin demo user
  user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name: 'Rachel Thompson',
      role: 'ADMIN',
      organizationId: organization.id,
      emailVerified: new Date(),
    },
    include: { organization: true },
  });

  return user;
}

/**
 * Create a test AI system
 */
export async function createTestAISystem(
  organizationId: string,
  data: {
    name: string;
    businessPurpose: string;
    deploymentStatus: string;
    primaryUsers: string[];
    dataCategories: string[];
    technicalDescription?: string;
  }
) {
  return await prisma.aISystem.create({
    data: {
      organizationId,
      name: data.name,
      businessPurpose: data.businessPurpose,
      deploymentStatus: data.deploymentStatus as any,
      primaryUsers: data.primaryUsers as any,
      dataCategories: data.dataCategories as any,
      technicalDescription: data.technicalDescription,
    },
  });
}

/**
 * Create a test risk classification
 */
export async function createTestRiskClassification(
  aiSystemId: string,
  data: {
    category: 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK';
    prohibitedPractices: string[];
    highRiskCategories: string[];
    interactsWithPersons: boolean;
    reasoning: string;
    applicableRequirements: string[];
  }
) {
  return await prisma.riskClassification.create({
    data: {
      aiSystemId,
      category: data.category,
      prohibitedPractices: data.prohibitedPractices,
      highRiskCategories: data.highRiskCategories,
      interactsWithPersons: data.interactsWithPersons,
      reasoning: data.reasoning,
      applicableRequirements: data.applicableRequirements,
    },
  });
}

/**
 * Seed demo data for incident management demos
 * Creates a sample AI system to demonstrate incident reporting
 */
export async function seedIncidentDemoData(userEmail: string = 'rachel.thompson@talenttech.eu'): Promise<void> {
  const organizationId = await getTestUserOrganizationId(userEmail);
  if (!organizationId) {
    throw new Error('Organization not found for demo user');
  }

  // Create a sample AI system for incident reporting
  const aiSystem = await prisma.aISystem.create({
    data: {
      organizationId,
      name: 'Authentication AI System',
      businessPurpose: 'AI-powered user authentication and fraud detection system that analyzes user behavior patterns and biometric data to authenticate users and detect fraudulent access attempts',
      deploymentStatus: 'PRODUCTION',
      primaryUsers: ['INTERNAL_EMPLOYEES', 'EXTERNAL_CUSTOMERS'],
      dataCategories: ['BIOMETRIC_DATA', 'BEHAVIORAL_DATA', 'PERSONAL_DATA'],
    },
  });

  // Add risk classification
  await prisma.riskClassification.create({
    data: {
      aiSystemId: aiSystem.id,
      category: 'HIGH_RISK',
      prohibitedPractices: [],
      highRiskCategories: ['Biometric Identification', 'Critical Infrastructure'],
      interactsWithPersons: true,
      reasoning: 'System processes biometric data and controls access to critical systems',
      applicableRequirements: ['Article 9', 'Article 10', 'Article 13', 'Article 14'],
    },
  });

  // Create a sample incident for demonstration
  const incident = await prisma.incident.create({
    data: {
      aiSystemId: aiSystem.id,
      incidentNumber: 'INC-20260104-001',
      title: 'Critical Authentication System Failure - Biometric Module',
      incidentDate: new Date('2026-01-04T14:30:00Z'),
      reportedDate: new Date('2026-01-04T15:00:00Z'),
      reportedBy: 'Admin Demo User',
      description: 'Our AI-powered authentication system experienced a critical failure in the biometric verification module at 14:30 UTC on January 4th, 2026. The system incorrectly rejected legitimate user authentication attempts while simultaneously allowing unauthorized access in several cases. The root cause was identified as a model drift issue in the facial recognition algorithm, likely caused by the recent deployment of updated training data that was not properly validated.',
      severity: 'CRITICAL',
      category: 'System Failure',
      status: 'INVESTIGATING',
      affectedUsersCount: 1247,
      businessImpact: 'Significant service disruption affecting customer authentication across multiple platforms. Estimated financial impact of €45,000 due to service downtime and customer support costs. Brand reputation risk due to security concerns.',
      complianceImpact: 'Potential GDPR Article 32 violation due to inadequate security measures. May trigger Article 62 serious incident notification requirements under the EU AI Act as this is a high-risk AI system that caused harm to fundamental rights (security and data protection).',
      affectedUsers: 'Primarily external customers attempting to access their accounts through biometric authentication. Internal employees using the system for testing were also affected. No sensitive data was exposed, but unauthorized access attempts were successful in 3 documented cases.',
      immediateActions: '1. Immediately rolled back the AI model to the previous stable version at 15:45 UTC\n2. Disabled biometric authentication module and switched to fallback password-based authentication\n3. Notified affected users via email about the incident and temporary authentication changes\n4. Initiated emergency security audit of all access logs\n5. Assembled incident response team including AI technical lead, security officer, and legal counsel',
      rootCauseAnalysis: 'Preliminary investigation indicates the failure was caused by:\n\n1. Insufficient validation of new training dataset before deployment\n2. Lack of proper A/B testing for the updated biometric model\n3. Inadequate monitoring thresholds that failed to detect model performance degradation early\n4. Missing automated rollback procedures for AI model deployments\n\nDetailed technical analysis is ongoing to fully understand the model drift mechanism.',
      preventiveMeasures: '1. Implement mandatory model validation framework with production-like test data before any deployment\n2. Establish A/B testing protocol for all AI model updates affecting critical systems\n3. Enhance monitoring with real-time model performance metrics and automated alerting\n4. Develop automated rollback capabilities triggered by performance degradation\n5. Conduct comprehensive review of all AI system deployment procedures\n6. Increase frequency of model retraining and validation cycles',
    },
  });

  console.log('✅ Demo data seeded: Created Authentication AI System with sample incident');
}

/**
 * Create a test governance structure with roles
 */
export async function createTestGovernance(
  aiSystemId: string,
  roles: Array<{
    roleType: 'SYSTEM_OWNER' | 'RISK_OWNER' | 'HUMAN_OVERSIGHT' | 'DATA_PROTECTION_OFFICER' | 'TECHNICAL_LEAD' | 'COMPLIANCE_OFFICER';
    personName: string;
    email: string;
    department?: string;
    responsibilities?: string;
    assignedDate?: Date;
    isActive?: boolean;
  }>
) {
  // Create the governance structure
  const governance = await prisma.aIGovernance.create({
    data: {
      aiSystemId,
      governanceStructure: 'Test governance structure',
    },
  });

  // Create all roles
  const createdRoles = await Promise.all(
    roles.map((role) =>
      prisma.governanceRole.create({
        data: {
          aiGovernanceId: governance.id,
          roleType: role.roleType,
          personName: role.personName,
          email: role.email,
          department: role.department || 'Test Department',
          responsibilities: role.responsibilities ? [role.responsibilities] : [],
          assignedDate: role.assignedDate || new Date(),
          isActive: role.isActive !== undefined ? role.isActive : true,
        },
      })
    )
  );

  return {
    governance,
    roles: createdRoles,
  };
}

/**
 * Seed comprehensive dashboard demo data
 * Creates a realistic dashboard with multiple AI systems, incidents, governance, and gap assessments
 */
export async function seedDashboardDemoData(userEmail: string = 'rachel.thompson@talenttech.eu'): Promise<void> {
  const organizationId = await getTestUserOrganizationId(userEmail);
  if (!organizationId) {
    throw new Error('Organization not found for demo user');
  }

  console.log('🌱 Seeding dashboard demo data...');

  // Create 5 AI systems with different risk levels

  // 1. HIGH RISK - Customer Service AI
  const customerServiceAI = await prisma.aISystem.create({
    data: {
      organizationId,
      name: 'Customer Service AI Assistant',
      businessPurpose: 'AI-powered customer service chatbot that handles customer inquiries, processes complaints, and provides automated support across multiple channels',
      deploymentStatus: 'PRODUCTION',
      primaryUsers: ['EXTERNAL_CUSTOMERS'],
      dataCategories: ['PERSONAL_DATA', 'BEHAVIORAL_DATA'],
    },
  });

  await prisma.riskClassification.create({
    data: {
      aiSystemId: customerServiceAI.id,
      category: 'HIGH_RISK',
      prohibitedPractices: [],
      highRiskCategories: ['Customer Interaction'],
      interactsWithPersons: true,
      reasoning: 'Processes personal data and directly interacts with customers',
      applicableRequirements: ['Article 9', 'Article 13'],
    },
  });

  await prisma.gapAssessment.create({
    data: {
      aiSystemId: customerServiceAI.id,
      overallScore: 78,
      lastAssessedDate: new Date('2026-01-02'),
    },
  });

  // 2. HIGH RISK - Authentication System (already created in incident seed)
  const authAI = await prisma.aISystem.create({
    data: {
      organizationId,
      name: 'Biometric Authentication System',
      businessPurpose: 'AI-powered biometric authentication and fraud detection system analyzing user behavior patterns and biometric data',
      deploymentStatus: 'PRODUCTION',
      primaryUsers: ['INTERNAL_EMPLOYEES', 'EXTERNAL_CUSTOMERS'],
      dataCategories: ['BIOMETRIC_DATA', 'BEHAVIORAL_DATA', 'PERSONAL_DATA'],
    },
  });

  await prisma.riskClassification.create({
    data: {
      aiSystemId: authAI.id,
      category: 'HIGH_RISK',
      prohibitedPractices: [],
      highRiskCategories: ['Biometric Identification', 'Critical Infrastructure'],
      interactsWithPersons: true,
      reasoning: 'System processes biometric data and controls access to critical systems',
      applicableRequirements: ['Article 9', 'Article 10', 'Article 13', 'Article 14'],
    },
  });

  await prisma.gapAssessment.create({
    data: {
      aiSystemId: authAI.id,
      overallScore: 65,
      lastAssessedDate: new Date('2026-01-03'),
    },
  });

  // Create critical incident for auth system
  await prisma.incident.create({
    data: {
      aiSystemId: authAI.id,
      incidentNumber: 'INC-20260104-001',
      title: 'Critical Authentication System Failure - Biometric Module',
      incidentDate: new Date('2026-01-04T14:30:00Z'),
      reportedDate: new Date('2026-01-04T15:00:00Z'),
      reportedBy: 'Admin Demo User',
      description: 'Critical failure in biometric verification module causing incorrect authentication decisions',
      severity: 'CRITICAL',
      category: 'System Failure',
      status: 'INVESTIGATING',
      affectedUsersCount: 1247,
      affectedUsers: 'Primarily external customers attempting biometric authentication. Internal employees also affected during testing.',
      businessImpact: 'Significant service disruption affecting customer authentication',
      complianceImpact: 'Potential GDPR Article 32 violation and EU AI Act Article 62 notification required',
      immediateActions: 'Rolled back AI model, disabled biometric module, initiated security audit',
      rootCauseAnalysis: 'Model drift in facial recognition algorithm due to unvalidated training data deployment',
      preventiveMeasures: 'Implement mandatory model validation framework and automated rollback procedures',
      notificationRequired: true,
      notificationSubmitted: false,
    },
  });

  // 3. LIMITED RISK - Content Moderation
  const contentAI = await prisma.aISystem.create({
    data: {
      organizationId,
      name: 'Content Moderation AI',
      businessPurpose: 'Automated content filtering and moderation system for user-generated content on company platforms',
      deploymentStatus: 'PRODUCTION',
      primaryUsers: ['INTERNAL_EMPLOYEES'],
      dataCategories: ['PERSONAL_DATA', 'BEHAVIORAL_DATA'],
    },
  });

  await prisma.riskClassification.create({
    data: {
      aiSystemId: contentAI.id,
      category: 'LIMITED_RISK',
      prohibitedPractices: [],
      highRiskCategories: [],
      interactsWithPersons: true,
      reasoning: 'System interacts with users but has limited impact on fundamental rights',
      applicableRequirements: ['Article 52 - Transparency'],
    },
  });

  await prisma.gapAssessment.create({
    data: {
      aiSystemId: contentAI.id,
      overallScore: 85,
      lastAssessedDate: new Date('2026-01-01'),
    },
  });

  // 4. MINIMAL RISK - Inventory Optimization
  const inventoryAI = await prisma.aISystem.create({
    data: {
      organizationId,
      name: 'Inventory Optimization AI',
      businessPurpose: 'AI system for optimizing warehouse inventory levels and predicting stock requirements',
      deploymentStatus: 'PRODUCTION',
      primaryUsers: ['INTERNAL_EMPLOYEES'],
      dataCategories: ['NO_PERSONAL_DATA'],
    },
  });

  await prisma.riskClassification.create({
    data: {
      aiSystemId: inventoryAI.id,
      category: 'MINIMAL_RISK',
      prohibitedPractices: [],
      highRiskCategories: [],
      interactsWithPersons: false,
      reasoning: 'Internal business optimization system with no impact on individuals',
      applicableRequirements: [],
    },
  });

  await prisma.gapAssessment.create({
    data: {
      aiSystemId: inventoryAI.id,
      overallScore: 92,
      lastAssessedDate: new Date('2025-12-28'),
    },
  });

  // 5. MINIMAL RISK - Marketing Analytics (in development)
  const marketingAI = await prisma.aISystem.create({
    data: {
      organizationId,
      name: 'Marketing Analytics AI',
      businessPurpose: 'AI-powered analytics platform for marketing campaign performance analysis and optimization',
      deploymentStatus: 'DEVELOPMENT',
      primaryUsers: ['INTERNAL_EMPLOYEES'],
      dataCategories: ['NO_PERSONAL_DATA'],
    },
  });

  await prisma.riskClassification.create({
    data: {
      aiSystemId: marketingAI.id,
      category: 'MINIMAL_RISK',
      prohibitedPractices: [],
      highRiskCategories: [],
      interactsWithPersons: false,
      reasoning: 'Analytics system using aggregated data with minimal individual impact',
      applicableRequirements: [],
    },
  });

  await prisma.gapAssessment.create({
    data: {
      aiSystemId: marketingAI.id,
      overallScore: 88,
      lastAssessedDate: new Date('2025-12-30'),
    },
  });

  // Create governance structure for high-risk customer service AI
  const governance = await prisma.aIGovernance.create({
    data: {
      aiSystemId: customerServiceAI.id,
      governanceStructure: 'Customer Service AI Governance Framework',
    },
  });

  // Add governance roles
  await prisma.governanceRole.createMany({
    data: [
      {
        aiGovernanceId: governance.id,
        roleType: 'SYSTEM_OWNER',
        personName: 'Sarah Johnson',
        email: 'sarah.johnson@demo.com',
        department: 'Product Management',
        responsibilities: ['Overall system ownership and strategic direction'],
        assignedDate: new Date('2025-11-01'),
        isActive: true,
      },
      {
        aiGovernanceId: governance.id,
        roleType: 'TECHNICAL_LEAD',
        personName: 'Michael Chen',
        email: 'michael.chen@demo.com',
        department: 'Engineering',
        responsibilities: ['Technical implementation and system architecture'],
        assignedDate: new Date('2025-11-01'),
        isActive: true,
      },
      {
        aiGovernanceId: governance.id,
        roleType: 'COMPLIANCE_OFFICER',
        personName: 'Emily Rodriguez',
        email: 'emily.rodriguez@demo.com',
        department: 'Legal & Compliance',
        responsibilities: ['EU AI Act compliance monitoring and reporting'],
        assignedDate: new Date('2025-11-15'),
        isActive: true,
      },
    ],
  });

  // Create a second non-critical incident
  await prisma.incident.create({
    data: {
      aiSystemId: customerServiceAI.id,
      incidentNumber: 'INC-20260102-001',
      title: 'Customer Service AI Inappropriate Response',
      incidentDate: new Date('2026-01-02T10:15:00Z'),
      reportedDate: new Date('2026-01-02T11:30:00Z'),
      reportedBy: 'Customer Support Team',
      description: 'AI chatbot provided inappropriate response to customer inquiry about sensitive medical topic',
      severity: 'MEDIUM',
      category: 'Quality Issue',
      status: 'RESOLVED',
      affectedUsersCount: 3,
      affectedUsers: 'Three external customers who received inappropriate responses regarding medical inquiries',
      businessImpact: 'Minor customer dissatisfaction, no financial impact',
      complianceImpact: 'No regulatory impact, internal quality improvement needed',
      immediateActions: 'Reviewed conversation logs, apologized to affected customers, updated response filters',
      rootCauseAnalysis: 'Insufficient training data for medical topic boundaries',
      preventiveMeasures: 'Enhanced training dataset with medical topic guidelines and improved content filtering',
      notificationRequired: false,
      notificationSubmitted: false,
    },
  });

  console.log('✅ Dashboard demo data seeded successfully');
  console.log(`   - Created 5 AI systems (2 High Risk, 1 Limited Risk, 2 Minimal Risk)`);
  console.log(`   - Created 5 gap assessments (avg score: 81.6)`);
  console.log(`   - Created 2 incidents (1 critical requiring notification, 1 resolved)`);
  console.log(`   - Created 1 governance structure with 3 roles`);
}

/**
 * Seed data for Risk Management demo
 * Creates risk registers with diverse risks and mitigation actions
 */
export async function seedRiskManagementDemoData(userEmail: string = 'rachel.thompson@talenttech.eu'): Promise<void> {
  const organizationId = await getTestUserOrganizationId(userEmail);
  if (!organizationId) {
    throw new Error('Organization not found for demo user');
  }

  console.log('🌱 Seeding risk management demo data...');

  // Find existing AI systems created by seedDashboardDemoData
  const aiSystems = await prisma.aISystem.findMany({
    where: {
      organizationId,
      name: {
        in: [
          'Customer Service AI Assistant',
          'Biometric Authentication System',
          'Content Moderation AI'
        ]
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  if (aiSystems.length < 2) {
    throw new Error('Expected at least 2 AI systems. Please run seedDashboardDemoData first.');
  }

  let totalRisks = 0;
  let totalMitigationActions = 0;

  // ==========================================
  // Risk Register 1: Customer Service AI Assistant
  // ==========================================
  const customerServiceAI = aiSystems[0];

  const riskRegister1 = await prisma.aIRiskRegister.create({
    data: {
      aiSystemId: customerServiceAI.id,
      lastAssessedDate: new Date('2026-01-03'),
      assessedBy: 'Sarah Johnson, Risk Manager',
    }
  });

  // Risk 1.1: Bias Risk (HIGH)
  const risk1_1 = await prisma.risk.create({
    data: {
      riskRegisterId: riskRegister1.id,
      type: 'BIAS',
      title: 'Demographic Bias in Customer Responses',
      description: 'AI chatbot may exhibit demographic bias in responses, providing different quality of service based on user language patterns or cultural background',
      affectedStakeholders: ['External customers', 'Customer support team', 'Marketing department'],
      potentialImpact: 'Discriminatory service quality affecting customer satisfaction and brand reputation. Potential regulatory violations under EU AI Act Article 10 (bias monitoring requirements) and potential discrimination lawsuits.',
      likelihood: 4, // Likely
      impact: 5, // Severe
      inherentRiskScore:20, // 4 × 5
      riskLevel: 'HIGH',
      treatmentDecision: 'MITIGATE',
      treatmentJustification: 'High likelihood due to training data imbalance. Severe impact on brand reputation and regulatory compliance (EU AI Act Art. 10 - bias monitoring)',
      createdBy: 'admin@demo.com',
    }
  });
  totalRisks++;

  await prisma.mitigationAction.create({
    data: {
      riskId: risk1_1.id,
      description: 'Implement comprehensive bias testing framework with diverse test scenarios covering multiple languages, dialects, and cultural contexts',
      responsibleParty: 'AI/ML Team Lead',
      dueDate: new Date('2026-02-15'),
      status: 'IN_PROGRESS',
    }
  });
  totalMitigationActions++;

  await prisma.mitigationAction.create({
    data: {
      riskId: risk1_1.id,
      description: 'Establish regular bias auditing schedule with external third-party evaluation every quarter',
      responsibleParty: 'Compliance Officer',
      dueDate: new Date('2026-03-01'),
      status: 'PLANNED',
    }
  });
  totalMitigationActions++;

  // Risk 1.2: Privacy Risk (MEDIUM)
  const risk1_2 = await prisma.risk.create({
    data: {
      riskRegisterId: riskRegister1.id,
      type: 'PRIVACY',
      title: 'Data Retention and Third-Party Sharing',
      description: 'Customer conversation data may be retained longer than necessary or shared inappropriately with third-party analytics services',
      affectedStakeholders: ['External customers', 'Data Protection Officer', 'Legal team', 'Third-party vendors'],
      potentialImpact: 'Potential GDPR violations leading to regulatory fines up to €20M or 4% of annual turnover. Loss of customer trust and reputational damage. Regulatory investigation by supervisory authority.',
      likelihood: 3, // Possible
      impact: 4, // Major
      inherentRiskScore:12, // 3 × 4
      riskLevel: 'MEDIUM',
      treatmentDecision: 'MITIGATE',
      treatmentJustification: 'GDPR Article 5 requires data minimization and storage limitation. Current retention policy needs review.',
      createdBy: 'admin@demo.com',
    }
  });
  totalRisks++;

  await prisma.mitigationAction.create({
    data: {
      riskId: risk1_2.id,
      description: 'Review and update data retention policy to comply with GDPR principles, implement automated deletion after 90 days',
      responsibleParty: 'Data Protection Officer',
      dueDate: new Date('2026-01-20'),
      status: 'COMPLETED',
      completionDate: new Date('2026-01-05'),
    }
  });
  totalMitigationActions++;

  await prisma.mitigationAction.create({
    data: {
      riskId: risk1_2.id,
      description: 'Conduct privacy impact assessment (PIA) and document data flows to third-party services',
      responsibleParty: 'Data Protection Officer',
      dueDate: new Date('2026-02-01'),
      status: 'IN_PROGRESS',
    }
  });
  totalMitigationActions++;

  // Risk 1.3: Transparency Risk (LOW)
  await prisma.risk.create({
    data: {
      riskRegisterId: riskRegister1.id,
      type: 'TRANSPARENCY',
      title: 'AI Disclosure Visibility',
      description: 'Users may not be adequately informed that they are interacting with an AI system rather than a human agent',
      affectedStakeholders: ['External customers', 'Customer support team', 'Marketing department'],
      potentialImpact: 'Minor user confusion and potential trust issues if users discover they were unknowingly interacting with AI. Potential non-compliance with EU AI Act Article 52 (transparency obligations for certain AI systems).',
      likelihood: 2, // Unlikely
      impact: 3, // Moderate
      inherentRiskScore:6, // 2 × 3
      riskLevel: 'LOW',
      treatmentDecision: 'ACCEPT',
      treatmentJustification: 'Current disclosure messaging is visible but could be more prominent. Low risk given limited impact. Will monitor user feedback.',
      createdBy: 'admin@demo.com',
    }
  });
  totalRisks++;

  // ==========================================
  // Risk Register 2: Biometric Authentication System
  // ==========================================
  const authAI = aiSystems[1];

  const riskRegister2 = await prisma.aIRiskRegister.create({
    data: {
      aiSystemId: authAI.id,
      lastAssessedDate: new Date('2026-01-04'),
      assessedBy: 'Michael Chen, Security Architect',
    }
  });

  // Risk 2.1: Safety Risk (HIGH)
  const risk2_1 = await prisma.risk.create({
    data: {
      riskRegisterId: riskRegister2.id,
      type: 'SAFETY',
      title: 'Authentication Failure Impact',
      description: 'Model failure could result in unauthorized access to sensitive systems or false rejection of legitimate users during emergency situations',
      affectedStakeholders: ['End users', 'Facility security officers', 'Emergency responders', 'IT security team'],
      potentialImpact: 'Potential physical security breaches allowing unauthorized facility access. Risk of locking out legitimate users during emergencies, creating safety hazards. Classification as High-Risk AI system under EU AI Act Annex III (biometric identification and categorization). Potential liability for security incidents.',
      likelihood: 3, // Possible
      impact: 5, // Severe
      inherentRiskScore:15, // 3 × 5
      riskLevel: 'HIGH',
      treatmentDecision: 'MITIGATE',
      treatmentJustification: 'Critical system protecting sensitive data and facilities. Failure modes could have severe security or safety consequences.',
      createdBy: 'admin@demo.com',
    }
  });
  totalRisks++;

  await prisma.mitigationAction.create({
    data: {
      riskId: risk2_1.id,
      description: 'Implement redundant authentication fallback mechanisms including PIN/password backup and manual override procedures',
      responsibleParty: 'Security Architecture Team',
      dueDate: new Date('2026-01-25'),
      status: 'IN_PROGRESS',
    }
  });
  totalMitigationActions++;

  await prisma.mitigationAction.create({
    data: {
      riskId: risk2_1.id,
      description: 'Establish 24/7 monitoring with automated alerts for authentication failure rate anomalies',
      responsibleParty: 'DevOps Team',
      dueDate: new Date('2026-02-10'),
      status: 'PLANNED',
    }
  });
  totalMitigationActions++;

  // Risk 2.2: Cybersecurity Risk (HIGH)
  const risk2_2 = await prisma.risk.create({
    data: {
      riskRegisterId: riskRegister2.id,
      type: 'CYBERSECURITY',
      title: 'Adversarial Attacks on Biometric Data',
      description: 'Biometric data storage and AI model could be targeted by adversarial attacks including model poisoning, data breaches, or spoofing attempts',
      affectedStakeholders: ['End users', 'IT security team', 'Data Protection Officer', 'Legal team', 'External auditors'],
      potentialImpact: 'Massive GDPR breach penalties for biometric data exposure (Article 9 special category data). Identity theft and fraud affecting thousands of users. Irreversible harm as biometric data cannot be reset. Potential criminal liability under cybersecurity laws. Complete loss of system trust and business viability.',
      likelihood: 4, // Likely
      impact: 5, // Severe
      inherentRiskScore:20, // 4 × 5
      riskLevel: 'HIGH',
      treatmentDecision: 'MITIGATE',
      treatmentJustification: 'High-value target for attackers. Biometric data is particularly sensitive and cannot be changed like passwords. ISO 27001 controls required.',
      createdBy: 'admin@demo.com',
    }
  });
  totalRisks++;

  await prisma.mitigationAction.create({
    data: {
      riskId: risk2_2.id,
      description: 'Implement end-to-end encryption for biometric data at rest and in transit using AES-256 and TLS 1.3',
      responsibleParty: 'Security Team',
      dueDate: new Date('2026-01-15'),
      status: 'COMPLETED',
      completionDate: new Date('2026-01-10'),
    }
  });
  totalMitigationActions++;

  await prisma.mitigationAction.create({
    data: {
      riskId: risk2_2.id,
      description: 'Deploy adversarial robustness testing suite and conduct penetration testing focused on spoofing attacks',
      responsibleParty: 'Security Testing Team',
      dueDate: new Date('2026-02-28'),
      status: 'PLANNED',
    }
  });
  totalMitigationActions++;

  // Risk 2.3: Bias Risk (MEDIUM)
  await prisma.risk.create({
    data: {
      riskRegisterId: riskRegister2.id,
      type: 'BIAS',
      title: 'Facial Recognition Demographic Bias',
      description: 'Facial recognition component may have different accuracy rates across demographic groups (age, ethnicity, gender)',
      affectedStakeholders: ['End users from underrepresented demographics', 'HR department', 'Diversity & Inclusion team', 'Legal team'],
      potentialImpact: 'Discriminatory access patterns creating unequal treatment of protected groups under equality law. Violation of EU AI Act Article 10 (bias monitoring and testing requirements). Potential lawsuits and regulatory enforcement. Reputational damage and public backlash. Ethical concerns regarding algorithmic fairness.',
      likelihood: 4, // Likely
      impact: 3, // Moderate
      inherentRiskScore:12, // 4 × 3
      riskLevel: 'MEDIUM',
      treatmentDecision: 'MITIGATE',
      treatmentJustification: 'Well-documented issue in facial recognition systems. EU AI Act Art. 10 requires bias testing. Potential discrimination liability.',
      createdBy: 'admin@demo.com',
    }
  });
  totalRisks++;

  await prisma.mitigationAction.create({
    data: {
      riskId: risk2_1.id,
      description: 'Conduct demographic bias testing across age, gender, and ethnicity using standardized datasets (e.g., NIST FRVT)',
      responsibleParty: 'AI Ethics Team',
      dueDate: new Date('2026-03-15'),
      status: 'PLANNED',
    }
  });
  totalMitigationActions++;

  // ==========================================
  // Risk Register 3: Content Moderation AI (if exists)
  // ==========================================
  if (aiSystems.length >= 3) {
    const contentModerationAI = aiSystems[2];

    const riskRegister3 = await prisma.aIRiskRegister.create({
      data: {
        aiSystemId: contentModerationAI.id,
        lastAssessedDate: new Date('2026-01-02'),
        assessedBy: 'Emma Rodriguez, Content Policy Lead',
      }
    });

    // Risk 3.1: Misuse Risk (MEDIUM)
    const risk3_1 = await prisma.risk.create({
      data: {
        riskRegisterId: riskRegister3.id,
        type: 'MISUSE',
        title: 'Over-Aggressive Content Filtering',
        description: 'Over-aggressive content filtering may suppress legitimate speech and create censorship concerns',
        affectedStakeholders: ['Platform users', 'Content creators', 'Legal team', 'Trust & Safety team', 'Public relations'],
        potentialImpact: 'Suppression of legitimate free speech and creative expression. Potential legal challenges under freedom of expression laws. User backlash and platform abandonment. Regulatory scrutiny from content moderation authorities. Reputational damage from perceived censorship. Loss of diverse content and community engagement.',
        likelihood: 3, // Possible
        impact: 4, // Major
        inherentRiskScore:12, // 3 × 4
        riskLevel: 'MEDIUM',
        treatmentDecision: 'MITIGATE',
        treatmentJustification: 'Balance needed between safety and free expression. Potential legal liability and reputation damage from incorrect removals.',
        createdBy: 'admin@demo.com',
      }
    });
    totalRisks++;

    await prisma.mitigationAction.create({
      data: {
        riskId: risk3_1.id,
        description: 'Implement human review process for borderline cases with clear escalation procedures and appeals mechanism',
        responsibleParty: 'Content Moderation Team',
        dueDate: new Date('2026-02-01'),
        status: 'IN_PROGRESS',
      }
    });
    totalMitigationActions++;

    // Risk 3.2: Bias Risk (LOW)
    await prisma.risk.create({
      data: {
        riskRegisterId: riskRegister3.id,
        type: 'BIAS',
        title: 'Cultural and Linguistic Bias',
        description: 'Content moderation may exhibit cultural or linguistic bias, disproportionately flagging content from certain communities',
        affectedStakeholders: ['International users', 'Non-English speaking communities', 'Content Policy team', 'Diversity & Inclusion team'],
        potentialImpact: 'Minor disparate treatment of content from certain cultural or linguistic groups. Potential user complaints about unfair moderation. Risk of community fragmentation and reduced international engagement. Possible violation of non-discrimination principles if patterns emerge.',
        likelihood: 2, // Unlikely
        impact: 3, // Moderate
        inherentRiskScore:6, // 2 × 3
        riskLevel: 'LOW',
        treatmentDecision: 'ACCEPT',
        treatmentJustification: 'Current model trained on diverse dataset. Regular audits show acceptable performance across demographics. Will continue monitoring.',
        createdBy: 'admin@demo.com',
      }
    });
    totalRisks++;
  }

  console.log('✅ Risk management demo data seeded successfully');
  console.log(`   - Created ${aiSystems.length} risk registers for existing AI systems`);
  console.log(`   - Created ${totalRisks} risks (varied HIGH/MEDIUM/LOW levels)`);
  console.log(`   - Created ${totalMitigationActions} mitigation actions (COMPLETED/IN_PROGRESS/PLANNED)`);
}

/**
 * Seed demo data for technical documentation demos
 * Creates comprehensive technical documentation for AI systems with varied completion levels
 */
export async function seedTechnicalDocumentationDemoData(userEmail: string = 'rachel.thompson@talenttech.eu'): Promise<void> {
  const organizationId = await getTestUserOrganizationId(userEmail);
  if (!organizationId) {
    throw new Error('Organization not found for demo user');
  }

  console.log('🌱 Seeding technical documentation demo data...');

  // Get the user ID for preparedBy, reviewedBy, approvedBy fields
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, name: true },
  });

  if (!user) {
    throw new Error('User not found for demo');
  }

  // Get existing AI systems from the dashboard seed data
  const aiSystems = await prisma.aISystem.findMany({
    where: { organizationId },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  if (aiSystems.length < 2) {
    throw new Error('Not enough AI systems found. Please run seedDashboardDemoData first.');
  }

  let docsCreated = 0;
  let attachmentsCreated = 0;
  let versionsCreated = 0;

  // Documentation 1: COMPLETE AND APPROVED (100% completeness)
  // Customer Service AI Assistant - All 8 sections filled
  if (aiSystems[0]) {
    const doc1 = await prisma.technicalDocumentation.create({
      data: {
        aiSystemId: aiSystems[0].id,
        version: '2.1',
        versionDate: new Date('2025-12-15'),
        versionNotes: 'Major update: Added comprehensive cybersecurity documentation and updated model performance metrics following Q4 2025 evaluation.',
        completenessPercentage: 100,

        // Section 1: Intended Use
        intendedUse: `This AI-powered customer service assistant is designed to provide automated support for customer inquiries across multiple communication channels including web chat, email, and mobile applications. The system is intended to handle routine customer service requests such as account inquiries, order status checks, basic troubleshooting, and FAQ responses.

The primary intended users are external customers of the organization seeking support services. The system operates 24/7 to provide immediate responses and escalates complex issues to human agents when necessary. It is designed to reduce response times, improve customer satisfaction, and optimize customer service team efficiency.

The system processes natural language inputs in English, Spanish, French, and German, with plans to expand to additional languages. It is specifically designed for use in non-critical customer service scenarios where immediate human intervention is not required for safety or compliance reasons.`,

        // Section 2: Foreseeable Misuse
        foreseeableMisuse: `Potential misuse scenarios have been identified and documented as part of the risk assessment process. These include:

1. **Social Engineering Attacks**: Malicious actors may attempt to manipulate the AI system to disclose sensitive customer information or bypass authentication procedures through carefully crafted prompts or conversation flows.

2. **Automated Abuse**: The system could be targeted with high-volume automated requests designed to overwhelm the service, conduct reconnaissance on system capabilities, or extract proprietary information about business processes.

3. **Inappropriate Content Generation**: Users may attempt to elicit inappropriate, offensive, or harmful responses from the system through adversarial prompting techniques.

4. **Privacy Violations**: The system could inadvertently be used to correlate or infer private information about customers through analysis of conversation patterns across multiple interactions.

Mitigation measures include robust input validation, rate limiting, content filtering, regular security audits, and human oversight mechanisms for sensitive operations.`,

        // Section 3: System Architecture
        systemArchitecture: `The customer service AI system is built on a hybrid architecture combining transformer-based language models with rule-based conversation management:

**Core Components:**
- **Natural Language Processing Engine**: Fine-tuned GPT-4-based model for understanding customer intents and generating contextually appropriate responses
- **Conversation Manager**: Orchestrates dialogue flow, maintains context across multi-turn conversations, and handles escalation logic
- **Knowledge Base Integration**: Connects to structured product catalogs, FAQ databases, and policy documentation
- **Authentication Module**: Verifies customer identity for account-specific inquiries while maintaining privacy standards
- **Analytics Pipeline**: Tracks conversation quality metrics, customer satisfaction scores, and system performance indicators

**Infrastructure:**
- Cloud-hosted on AWS with EU data residency compliance
- Microservices architecture using Kubernetes for scalability
- Redis for session management and caching
- PostgreSQL for persistent storage of conversation logs and customer interactions
- Real-time monitoring with Prometheus and Grafana

**Security Features:**
- End-to-end encryption for customer communications
- Role-based access controls for administrative functions
- Automated PII detection and masking
- Regular penetration testing and vulnerability assessments`,

        // Section 4: Training Data
        trainingData: `The AI model was trained using a diverse and representative dataset compiled from multiple sources:

**Data Sources:**
1. **Historical Customer Service Interactions** (60%): 2.3 million anonymized customer service conversations from 2022-2024, covering various product categories and customer demographics
2. **Synthetic Training Data** (25%): 800,000 programmatically generated conversations designed to cover edge cases, rare scenarios, and potential bias testing
3. **Public Domain Customer Service Data** (10%): Curated datasets from public customer service benchmarks and research publications
4. **Expert-Labeled Examples** (5%): 150,000 high-quality conversations labeled by customer service experts for intent classification and quality standards

**Data Quality Measures:**
- Comprehensive PII removal and anonymization process
- Demographic balance auditing to ensure fair representation across age, gender, geographic location, and language
- Regular bias testing using fairness metrics across protected categories
- Manual review of 5% sample for quality assurance

**Data Governance:**
- All training data stored in encrypted, access-controlled environments
- Complete data lineage tracking from source to model deployment
- Regular audits of data usage in compliance with GDPR Article 22 requirements
- Retention policies aligned with legal and ethical guidelines`,

        // Section 5: Model Performance
        modelPerformance: `The system has been extensively evaluated using multiple performance metrics:

**Accuracy Metrics:**
- Intent Classification Accuracy: 94.2% on test set (n=50,000 conversations)
- Response Relevance Score: 4.3/5.0 based on human evaluator ratings
- Customer Satisfaction (CSAT): 87% positive feedback
- First Contact Resolution Rate: 72%

**Fairness and Bias Metrics:**
- Demographic Parity Difference: <0.05 across gender, age groups, and geographic regions
- Equal Opportunity Difference: 0.03 for service quality across customer segments
- No statistically significant performance disparities identified across protected categories

**Robustness Testing:**
- Adversarial robustness: 91% accuracy under adversarial perturbation scenarios
- Out-of-distribution detection: 88% accuracy in identifying requests outside system capabilities
- Language performance: Comparable accuracy across supported languages (±2% variance)

**Operational Metrics:**
- Average Response Time: 1.2 seconds
- System Uptime: 99.7% over past 12 months
- Escalation Rate to Human Agents: 28% of conversations
- False Positive Rate for Sensitive Content Detection: 2.1%

Regular performance monitoring is conducted with monthly reviews and quarterly comprehensive audits.`,

        // Section 6: Validation Testing
        validationTesting: `Comprehensive validation testing has been performed throughout the development lifecycle:

**Pre-Deployment Testing:**
- Unit testing of all system components with 95% code coverage
- Integration testing across all microservices and external dependencies
- End-to-end conversation flow testing covering 500+ user journey scenarios
- Load testing demonstrating capacity for 10,000 concurrent conversations
- Security penetration testing by independent third-party auditors

**User Acceptance Testing:**
- Beta testing with 500 internal employees over 6-week period
- Pilot deployment with 5,000 real customers with enhanced monitoring
- A/B testing comparing AI responses vs. human agent responses for quality benchmarking
- Usability testing across different customer demographics and technical proficiency levels

**Ongoing Validation:**
- Continuous monitoring of conversation quality with automated flagging of anomalies
- Monthly human review of 1,000 randomly selected conversations
- Quarterly customer satisfaction surveys specifically addressing AI interaction quality
- Semi-annual red team exercises simulating adversarial attacks and edge cases

**Validation Results:**
- 94% of beta users rated the experience as "good" or "excellent"
- 89% of pilot customers preferred AI assistance for routine inquiries
- Zero critical security vulnerabilities identified in independent audits
- All usability requirements met or exceeded across diverse user groups`,

        // Section 7: Human Oversight
        humanOversightDoc: `Multiple layers of human oversight ensure responsible AI operation:

**Real-Time Oversight:**
- **Escalation Protocol**: Automated escalation to human agents when:
  - Customer explicitly requests human assistance
  - System confidence score falls below 70%
  - Sensitive topics detected (complaints, legal issues, privacy concerns)
  - Emotional distress indicators in customer language
- **Live Monitoring Dashboard**: Customer service supervisors monitor conversation quality metrics in real-time
- **Emergency Stop Capability**: Supervisors can immediately halt AI responses and transfer to human agents

**Governance Structure:**
- **AI Ethics Review Board**: Quarterly reviews of system performance, bias metrics, and incident reports
- **Technical Oversight Team**: Weekly reviews of model behavior, performance degradation, and emerging risks
- **Customer Service Quality Team**: Daily sampling and review of AI conversations for quality assurance
- **Data Protection Officer**: Regular audits of data handling and privacy compliance

**Intervention Mechanisms:**
- Human agents can override or correct AI responses with feedback loop to improve future performance
- Customers can rate AI interactions, triggering review for low-rated conversations
- Automated alerts for unusual patterns, potential bias issues, or performance anomalies
- Incident response team for handling AI-related customer complaints or safety concerns

**Training and Accountability:**
- All oversight personnel receive specialized training on AI system capabilities, limitations, and ethical considerations
- Clear accountability framework with defined roles and responsibilities
- Regular competency assessments for human oversight team members
- Documented procedures for all oversight activities and decision-making processes`,

        // Section 8: Cybersecurity
        cybersecurity: `Comprehensive cybersecurity measures protect the system and customer data:

**Security Architecture:**
- **Defense in Depth**: Multiple layers of security controls including network segmentation, application firewalls, and endpoint protection
- **Zero Trust Model**: All system components authenticate and authorize every request regardless of network location
- **Encryption**: Data encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Secrets Management**: API keys and credentials stored in HashiCorp Vault with automatic rotation

**Threat Protection:**
- **DDoS Protection**: CloudFlare enterprise protection with traffic filtering and rate limiting
- **Input Validation**: Comprehensive sanitization of all user inputs to prevent injection attacks
- **Adversarial Defense**: Monitoring for prompt injection, jailbreaking attempts, and other AI-specific attack vectors
- **Intrusion Detection**: 24/7 security monitoring with automated alerting for suspicious activities

**Vulnerability Management:**
- **Regular Scanning**: Automated weekly vulnerability scans of all system components
- **Patch Management**: Critical security patches applied within 24 hours; high-priority within 7 days
- **Dependency Monitoring**: Continuous scanning of open-source dependencies for known vulnerabilities
- **Security Audits**: Annual comprehensive security audits by accredited third-party firms

**Incident Response:**
- **Incident Response Plan**: Documented procedures for detecting, responding to, and recovering from security incidents
- **Breach Notification**: Processes aligned with GDPR Article 33 requirements for breach notification within 72 hours
- **Forensics Capability**: Comprehensive logging and audit trails for security investigation and analysis
- **Business Continuity**: Disaster recovery procedures with RTO of 4 hours and RPO of 1 hour

**Access Controls:**
- **Principle of Least Privilege**: Users and services granted minimum necessary permissions
- **Multi-Factor Authentication**: Required for all administrative access
- **Audit Logging**: All access and modifications logged with tamper-evident storage
- **Regular Access Reviews**: Quarterly reviews of user permissions and access rights`,

        preparedBy: user.id,
        reviewedBy: user.id,
        approvedBy: user.id,
        approvalDate: new Date('2026-01-01'),
        updatedBy: user.id,
      },
    });
    docsCreated++;

    // Add sample attachments for Documentation 1
    await prisma.documentAttachment.createMany({
      data: [
        {
          technicalDocumentationId: doc1.id,
          section: 'SYSTEM_ARCHITECTURE',
          fileName: 'architecture-diagram-v2.1.pdf',
          fileType: 'application/pdf',
          fileSize: 2457600, // 2.4 MB
          fileUrl: '/uploads/architecture-diagram-v2.1.pdf',
          uploadedBy: user.id,
        },
        {
          technicalDocumentationId: doc1.id,
          section: 'MODEL_PERFORMANCE',
          fileName: 'performance-metrics-q4-2025.xlsx',
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileSize: 524288, // 512 KB
          fileUrl: '/uploads/performance-metrics-q4-2025.xlsx',
          uploadedBy: user.id,
        },
        {
          technicalDocumentationId: doc1.id,
          section: 'VALIDATION_TESTING',
          fileName: 'penetration-test-report-2025.pdf',
          fileType: 'application/pdf',
          fileSize: 3145728, // 3 MB
          fileUrl: '/uploads/penetration-test-report-2025.pdf',
          uploadedBy: user.id,
        },
      ],
    });
    attachmentsCreated += 3;

    // Add version history for Documentation 1
    await prisma.documentVersion.create({
      data: {
        technicalDocumentationId: doc1.id,
        version: '2.0',
        versionNotes: 'Initial comprehensive documentation covering all required sections per EU AI Act Article 11',
        savedBy: user.id,
        snapshotData: JSON.stringify({
          version: '2.0',
          completenessPercentage: 87.5,
          versionNotes: 'Initial comprehensive version',
        }),
      },
    });
    versionsCreated++;
  }

  // Documentation 2: UNDER REVIEW (75% completeness)
  // Biometric Authentication System - 6 of 8 sections filled
  if (aiSystems[1]) {
    const doc2 = await prisma.technicalDocumentation.create({
      data: {
        aiSystemId: aiSystems[1].id,
        version: '1.5',
        versionDate: new Date('2025-12-20'),
        versionNotes: 'Draft version pending review - cybersecurity and human oversight sections to be completed',
        completenessPercentage: 75,

        // Sections 1-6 filled, sections 7-8 missing
        intendedUse: `This biometric authentication system is designed to provide secure, frictionless user authentication for both internal employees and external customers accessing critical systems and services. The system uses AI-powered facial recognition and behavioral biometrics to verify user identity.

The intended use cases include:
- Employee access to internal systems and facilities
- Customer authentication for high-security account access
- Multi-factor authentication for sensitive transactions
- Fraud detection and prevention in real-time

The system is designed to operate in controlled environments with adequate lighting and camera positioning. It processes biometric data in compliance with GDPR Article 9 requirements for special categories of personal data.`,

        foreseeableMisuse: `Potential misuse scenarios include:

1. **Deepfake Attacks**: Adversaries may attempt to use synthetic media (deepfakes) to impersonate legitimate users and bypass authentication controls.

2. **Presentation Attacks**: Physical spoofing attempts using photographs, videos, or masks to fool the biometric system.

3. **Privacy Violations**: Unauthorized collection or use of biometric data beyond the intended authentication purpose.

4. **Discriminatory Profiling**: Potential misuse for unauthorized surveillance or profiling of individuals based on biometric characteristics.

Mitigation strategies include liveness detection, anti-spoofing algorithms, strict data minimization policies, and comprehensive audit logging of all authentication attempts.`,

        systemArchitecture: `The biometric authentication system consists of the following components:

**Core Biometric Processing:**
- Facial recognition engine based on deep convolutional neural networks trained on diverse facial datasets
- Behavioral biometrics analyzer tracking keystroke dynamics, mouse movement patterns, and device interaction characteristics
- Multi-modal fusion engine combining facial and behavioral signals for enhanced security

**Security Infrastructure:**
- Encrypted biometric template storage using homomorphic encryption
- Secure enclave processing for sensitive biometric operations
- Tamper-detection mechanisms and audit logging
- Integration with existing identity and access management (IAM) systems

**Performance Optimization:**
- Edge computing capabilities for low-latency local processing
- Cloud-based model updates and threat intelligence integration
- Load balancing across distributed authentication nodes
- Real-time monitoring and alerting infrastructure`,

        trainingData: `The facial recognition model was trained on:

**Primary Training Datasets:**
- 15 million facial images from diverse demographic groups (age, gender, ethnicity, lighting conditions)
- Synthetic data augmentation to address underrepresented demographics and improve fairness
- Balanced representation across age ranges (18-80+), skin tones (Fitzpatrick scale 1-6), and gender identities

**Behavioral Biometrics Training:**
- 5 million user interaction sessions capturing keystroke dynamics and mouse behavior
- Temporal data spanning different times of day, device types, and user contexts
- Attack simulation data including known fraud patterns and adversarial behaviors

**Data Governance:**
- All training data collected with explicit informed consent
- Comprehensive documentation of data sources, collection methods, and quality controls
- Regular audits to ensure continued demographic balance and fairness
- Strict access controls and encryption for all biometric training data`,

        modelPerformance: `Performance metrics for the biometric authentication system:

**Accuracy Metrics:**
- False Acceptance Rate (FAR): 0.01% (1 in 10,000)
- False Rejection Rate (FRR): 2.5%
- True Match Rate: 97.5% at decision threshold
- Liveness Detection Accuracy: 99.2%

**Fairness Metrics:**
- Equalized odds across demographic groups within ±0.03 threshold
- No statistically significant performance disparities across skin tone (Fitzpatrick scale)
- Consistent FRR and FAR across age groups (±0.5%)
- Gender parity in authentication performance

**Security Metrics:**
- Presentation Attack Detection Rate: 98.5%
- Deepfake Detection Rate: 96.8%
- Zero successful unauthorized access in 6-month production trial
- Average authentication time: 1.8 seconds

**Operational Metrics:**
- System uptime: 99.95%
- Scalability: Supports 50,000 concurrent authentication requests
- Fallback to alternative authentication: 2.3% of attempts`,

        validationTesting: `Validation testing included:

**Pre-Deployment Testing:**
- Algorithm validation on independent test sets with >50,000 authentication attempts
- Adversarial testing including presentation attacks (photos, videos, masks)
- Deepfake attack simulations using state-of-the-art synthetic media
- Cross-demographic performance testing across all user segments
- Security penetration testing by certified ethical hackers

**Pilot Deployment:**
- 3-month controlled pilot with 1,000 employee volunteers
- 6-week limited customer trial with 500 participants
- Continuous monitoring for performance degradation or bias
- User experience surveys and feedback collection
- Incident reporting and resolution tracking

**Regulatory Compliance Testing:**
- GDPR Article 9 compliance verification for biometric data processing
- GDPR Article 22 automated decision-making safeguards validation
- Accessibility testing for users with disabilities
- Third-party audit of data protection impact assessment (DPIA)

**Results:**
- Zero critical security vulnerabilities
- 92% user satisfaction rating
- All fairness requirements met or exceeded
- Full compliance with data protection regulations`,

        humanOversightDoc: null, // TO BE COMPLETED
        cybersecurity: null, // TO BE COMPLETED

        preparedBy: user.id,
        reviewedBy: user.id,
        approvedBy: null, // Not approved yet
        approvalDate: null,
        updatedBy: user.id,
      },
    });
    docsCreated++;

    // Add one attachment for Documentation 2
    await prisma.documentAttachment.create({
      data: {
        technicalDocumentationId: doc2.id,
        section: 'TRAINING_DATA',
        fileName: 'training-data-demographics-report.pdf',
        fileType: 'application/pdf',
        fileSize: 1048576, // 1 MB
        fileUrl: '/uploads/training-data-demographics-report.pdf',
        uploadedBy: user.id,
      },
    });
    attachmentsCreated++;
  }

  // Documentation 3: DRAFT (40% completeness)
  // Content Moderation AI - Only 3 of 8 sections filled (bare minimum)
  if (aiSystems[2]) {
    const doc3 = await prisma.technicalDocumentation.create({
      data: {
        aiSystemId: aiSystems[2].id,
        version: '1.0',
        versionDate: new Date('2026-01-02'),
        versionNotes: 'Initial draft - work in progress',
        completenessPercentage: 37.5, // 3 of 8 sections

        // Only first 3 sections filled
        intendedUse: `The Content Moderation AI system is designed to automatically detect and flag inappropriate, harmful, or policy-violating content posted by users on the company's online platforms. The system is intended to assist human moderators by pre-screening user-generated content and prioritizing items for manual review.

Intended use cases:
- Automated detection of spam, adult content, violence, and hate speech
- Proactive identification of potential policy violations before content reaches wide audiences
- Efficiency improvement for human moderation teams through intelligent prioritization
- Consistency in content policy enforcement across large volumes of user submissions

The system is intended as a decision support tool with human moderators making final content decisions.`,

        foreseeableMisuse: `Potential misuse scenarios under investigation:

1. **Censorship**: The system could be misused to suppress legitimate speech, political dissent, or minority viewpoints under the guise of content moderation.

2. **Bias Amplification**: Algorithmic biases could result in disproportionate flagging or removal of content from specific demographic groups or cultural perspectives.

3. **Chilling Effects**: Overly aggressive moderation may discourage users from posting legitimate content due to fear of erroneous removal.

4. **Adversarial Gaming**: Bad actors may attempt to manipulate the system through adversarial techniques to evade detection or cause false positives.

Mitigation approaches are currently being designed and will be documented in subsequent versions.`,

        systemArchitecture: `High-level system architecture:

**Core Components:**
- Multi-label classification model for content categorization
- Toxicity detection using transformer-based language models
- Image and video analysis for visual content moderation
- Text analysis for multiple languages

**Infrastructure:**
- Cloud-based microservices architecture
- Queue-based processing for scalability
- Human review interface for moderator decisions
- Analytics dashboard for performance monitoring

Detailed architecture documentation to be completed in next version.`,

        trainingData: null, // TO BE COMPLETED
        modelPerformance: null, // TO BE COMPLETED
        validationTesting: null, // TO BE COMPLETED
        humanOversightDoc: null, // TO BE COMPLETED
        cybersecurity: null, // TO BE COMPLETED

        preparedBy: user.id,
        reviewedBy: null, // Not reviewed yet
        approvedBy: null, // Not approved yet
        approvalDate: null,
        updatedBy: user.id,
      },
    });
    docsCreated++;
  }

  console.log('✅ Technical documentation demo data seeded successfully');
  console.log(`   - Created ${docsCreated} technical documentation records`);
  console.log(`   - Completeness levels: 100% (approved), 75% (under review), 37.5% (draft)`);
  console.log(`   - Created ${attachmentsCreated} document attachments`);
  console.log(`   - Created ${versionsCreated} version history records`);
}

import { z } from 'zod';
import { RiskCategory, DeploymentStatus, ComplianceStatus } from '@prisma/client';

export const aiSystemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessPurpose: z.string().min(10, 'Business purpose must be at least 10 characters'),
  description: z.string().optional(),
  technicalApproach: z.string().optional(),
  primaryUsers: z.array(z.string()).min(1, 'Select at least one user type'),
  deploymentStatus: z.nativeEnum(DeploymentStatus),
  deploymentDate: z.date().optional(),
  dataProcessed: z.array(z.string()).min(1, 'Specify at least one type of data processed'),
  thirdPartyProviders: z.array(z.string()).optional(),
});

export const riskClassificationSchema = z.object({
  primaryCategory: z.nativeEnum(RiskCategory),
  rationale: z.string().min(20, 'Rationale must be at least 20 characters'),
  affectedPersonsCount: z.number().int().min(0, 'Must be a positive number'),
  affectedPersonsDescription: z.string().min(10, 'Description must be at least 10 characters'),
  vulnerableGroups: z.boolean(),
  safetyImpact: z.boolean(),
  fundamentalRightsImpact: z.boolean(),
  useInCriticalInfrastructure: z.boolean(),
  lawEnforcementUse: z.boolean(),
  migrationUse: z.boolean(),
  justiceUse: z.boolean(),
  employmentUse: z.boolean(),
  educationUse: z.boolean(),
  biometricIdentification: z.boolean(),
  emotionRecognition: z.boolean(),
  socialScoring: z.boolean(),
});

export const gapAssessmentSchema = z.object({
  overallStatus: z.nativeEnum(ComplianceStatus),
  overallScore: z.number().min(0).max(100),
  findings: z.string().min(20, 'Findings must be at least 20 characters'),
  recommendations: z.string().min(20, 'Recommendations must be at least 20 characters'),
});

export const gapAssessmentItemSchema = z.object({
  requirement: z.string().min(5, 'Requirement must be at least 5 characters'),
  articleReference: z.string().min(3, 'Article reference is required'),
  currentState: z.string().min(10, 'Current state description required'),
  desiredState: z.string().min(10, 'Desired state description required'),
  gapDescription: z.string().min(10, 'Gap description required'),
  complianceStatus: z.nativeEnum(ComplianceStatus),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  estimatedEffort: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
  dependencies: z.string().optional(),
});

export type AISystemInput = z.infer<typeof aiSystemSchema>;
export type RiskClassificationInput = z.infer<typeof riskClassificationSchema>;
export type GapAssessmentInput = z.infer<typeof gapAssessmentSchema>;
export type GapAssessmentItemInput = z.infer<typeof gapAssessmentItemSchema>;

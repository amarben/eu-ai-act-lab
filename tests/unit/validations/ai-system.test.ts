/**
 * Unit Tests: AI System Validation Schemas
 *
 * Tests for Zod validation schemas used in AI system data validation.
 */

import { describe, it, expect } from 'vitest';
import {
  aiSystemSchema,
  riskClassificationSchema,
  gapAssessmentSchema,
  gapAssessmentItemSchema,
} from '@/lib/validations/ai-system';
import { RiskCategory, DeploymentStatus, ComplianceStatus } from '@prisma/client';

describe('AI System Validation Schemas', () => {
  describe('aiSystemSchema', () => {
    // Minimum required fields for valid AI system
    const validAISystem = {
      name: 'TalentMatch AI',
      businessPurpose: 'Automated recruitment screening to reduce manual review time',
      primaryUsers: ['HR managers', 'Recruiters'],
      deploymentStatus: DeploymentStatus.PRODUCTION,
      dataProcessed: ['CVs', 'Cover letters', 'Employment history'],
    };

    it('should validate correct AI system data', () => {
      const result = aiSystemSchema.safeParse(validAISystem);
      expect(result.success).toBe(true);
    });

    it('should reject missing required name field', () => {
      const invalid = { ...validAISystem };
      delete (invalid as any).name;

      const result = aiSystemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('should reject name shorter than 2 characters', () => {
      const invalid = { ...validAISystem, name: 'A' };

      const result = aiSystemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject missing business purpose', () => {
      const invalid = { ...validAISystem };
      delete (invalid as any).businessPurpose;

      const result = aiSystemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('businessPurpose');
      }
    });

    it('should reject business purpose shorter than 10 characters', () => {
      const invalid = { ...validAISystem, businessPurpose: 'Short' };

      const result = aiSystemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 10 characters');
      }
    });

    it('should accept optional description field', () => {
      const withDescription = { ...validAISystem, description: 'Machine learning system for candidate screening' };

      const result = aiSystemSchema.safeParse(withDescription);
      expect(result.success).toBe(true);
    });

    it('should accept optional technicalApproach field', () => {
      const withTechnical = { ...validAISystem, technicalApproach: 'Neural network with NLP processing' };

      const result = aiSystemSchema.safeParse(withTechnical);
      expect(result.success).toBe(true);
    });

    it('should reject empty primaryUsers array', () => {
      const invalid = { ...validAISystem, primaryUsers: [] };

      const result = aiSystemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least one user type');
      }
    });

    it('should validate all DeploymentStatus enum values', () => {
      Object.values(DeploymentStatus).forEach((status) => {
        const data = { ...validAISystem, deploymentStatus: status };
        const result = aiSystemSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid deployment status', () => {
      const invalid = { ...validAISystem, deploymentStatus: 'INVALID_STATUS' };

      const result = aiSystemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept optional deploymentDate', () => {
      const withDate = { ...validAISystem, deploymentDate: new Date('2024-03-15') };

      const result = aiSystemSchema.safeParse(withDate);
      expect(result.success).toBe(true);
    });

    it('should reject empty dataProcessed array', () => {
      const invalid = { ...validAISystem, dataProcessed: [] };

      const result = aiSystemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least one');
      }
    });

    it('should accept optional thirdPartyProviders', () => {
      const withProviders = { ...validAISystem, thirdPartyProviders: ['AWS', 'Google Cloud'] };

      const result = aiSystemSchema.safeParse(withProviders);
      expect(result.success).toBe(true);
    });

    it('should accept empty thirdPartyProviders array', () => {
      const withEmptyProviders = { ...validAISystem, thirdPartyProviders: [] };

      const result = aiSystemSchema.safeParse(withEmptyProviders);
      expect(result.success).toBe(true);
    });
  });

  describe('riskClassificationSchema', () => {
    const validRiskClassification = {
      primaryCategory: RiskCategory.HIGH_RISK,
      rationale: 'System is used for employment decisions which falls under Annex III',
      affectedPersonsCount: 10000,
      affectedPersonsDescription: 'Job applicants and candidates across EU',
      vulnerableGroups: false,
      safetyImpact: false,
      fundamentalRightsImpact: true,
      useInCriticalInfrastructure: false,
      lawEnforcementUse: false,
      migrationUse: false,
      justiceUse: false,
      employmentUse: true,
      educationUse: false,
      biometricIdentification: false,
      emotionRecognition: false,
      socialScoring: false,
    };

    it('should validate correct risk classification data', () => {
      const result = riskClassificationSchema.safeParse(validRiskClassification);
      expect(result.success).toBe(true);
    });

    it('should validate all RiskCategory enum values', () => {
      Object.values(RiskCategory).forEach((category) => {
        const data = { ...validRiskClassification, primaryCategory: category };
        const result = riskClassificationSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid risk category', () => {
      const invalid = { ...validRiskClassification, primaryCategory: 'INVALID_CATEGORY' };

      const result = riskClassificationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject rationale shorter than 20 characters', () => {
      const invalid = { ...validRiskClassification, rationale: 'Too short' };

      const result = riskClassificationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 20 characters');
      }
    });

    it('should reject negative affectedPersonsCount', () => {
      const invalid = { ...validRiskClassification, affectedPersonsCount: -100 };

      const result = riskClassificationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive number');
      }
    });

    it('should reject non-integer affectedPersonsCount', () => {
      const invalid = { ...validRiskClassification, affectedPersonsCount: 100.5 };

      const result = riskClassificationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept zero affectedPersonsCount', () => {
      const data = { ...validRiskClassification, affectedPersonsCount: 0 };

      const result = riskClassificationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject affectedPersonsDescription shorter than 10 characters', () => {
      const invalid = { ...validRiskClassification, affectedPersonsDescription: 'Short' };

      const result = riskClassificationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 10 characters');
      }
    });

    it('should validate all boolean fields', () => {
      const booleanFields = [
        'vulnerableGroups',
        'safetyImpact',
        'fundamentalRightsImpact',
        'useInCriticalInfrastructure',
        'lawEnforcementUse',
        'migrationUse',
        'justiceUse',
        'employmentUse',
        'educationUse',
        'biometricIdentification',
        'emotionRecognition',
        'socialScoring',
      ];

      booleanFields.forEach((field) => {
        const dataTrue = { ...validRiskClassification, [field]: true };
        const dataFalse = { ...validRiskClassification, [field]: false };

        expect(riskClassificationSchema.safeParse(dataTrue).success).toBe(true);
        expect(riskClassificationSchema.safeParse(dataFalse).success).toBe(true);
      });
    });

    it('should reject non-boolean values for boolean fields', () => {
      const invalid = { ...validRiskClassification, employmentUse: 'yes' };

      const result = riskClassificationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('gapAssessmentSchema', () => {
    const validGapAssessment = {
      overallStatus: ComplianceStatus.IN_PROGRESS,
      overallScore: 45.5,
      findings: 'Multiple compliance gaps identified in risk management and data governance',
      recommendations: 'Prioritize implementation of risk management system and complete data governance framework',
    };

    it('should validate correct gap assessment data', () => {
      const result = gapAssessmentSchema.safeParse(validGapAssessment);
      expect(result.success).toBe(true);
    });

    it('should validate all ComplianceStatus enum values', () => {
      Object.values(ComplianceStatus).forEach((status) => {
        const data = { ...validGapAssessment, overallStatus: status };
        const result = gapAssessmentSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject score below 0', () => {
      const invalid = { ...validGapAssessment, overallScore: -10 };

      const result = gapAssessmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject score above 100', () => {
      const invalid = { ...validGapAssessment, overallScore: 150 };

      const result = gapAssessmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept score of 0', () => {
      const data = { ...validGapAssessment, overallScore: 0 };

      const result = gapAssessmentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept score of 100', () => {
      const data = { ...validGapAssessment, overallScore: 100 };

      const result = gapAssessmentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept decimal scores', () => {
      const data = { ...validGapAssessment, overallScore: 67.3 };

      const result = gapAssessmentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject findings shorter than 20 characters', () => {
      const invalid = { ...validGapAssessment, findings: 'Too short' };

      const result = gapAssessmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 20');
      }
    });

    it('should reject recommendations shorter than 20 characters', () => {
      const invalid = { ...validGapAssessment, recommendations: 'Too short' };

      const result = gapAssessmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 20');
      }
    });
  });

  describe('gapAssessmentItemSchema', () => {
    const validGapAssessmentItem = {
      requirement: 'Article 9: Risk Management System',
      articleReference: 'Art. 9',
      currentState: 'No formal risk management system in place',
      desiredState: 'Comprehensive risk management system with continuous monitoring',
      gapDescription: 'Missing complete risk management framework and documentation',
      complianceStatus: ComplianceStatus.NOT_STARTED,
      priority: 'CRITICAL' as const,
      estimatedEffort: 'HIGH' as const,
      dependencies: 'Requires technical documentation completion first',
    };

    it('should validate correct gap assessment item data', () => {
      const result = gapAssessmentItemSchema.safeParse(validGapAssessmentItem);
      expect(result.success).toBe(true);
    });

    it('should reject requirement shorter than 5 characters', () => {
      const invalid = { ...validGapAssessmentItem, requirement: 'Art' };

      const result = gapAssessmentItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 5 characters');
      }
    });

    it('should reject articleReference shorter than 3 characters', () => {
      const invalid = { ...validGapAssessmentItem, articleReference: 'A9' };

      const result = gapAssessmentItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Article reference is required');
      }
    });

    it('should reject currentState shorter than 10 characters', () => {
      const invalid = { ...validGapAssessmentItem, currentState: 'Missing' };

      const result = gapAssessmentItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Current state description required');
      }
    });

    it('should reject desiredState shorter than 10 characters', () => {
      const invalid = { ...validGapAssessmentItem, desiredState: 'Complete' };

      const result = gapAssessmentItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Desired state description required');
      }
    });

    it('should reject gapDescription shorter than 10 characters', () => {
      const invalid = { ...validGapAssessmentItem, gapDescription: 'Gap' };

      const result = gapAssessmentItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Gap description required');
      }
    });

    it('should validate all ComplianceStatus values', () => {
      Object.values(ComplianceStatus).forEach((status) => {
        const data = { ...validGapAssessmentItem, complianceStatus: status };
        const result = gapAssessmentItemSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should validate all priority enum values', () => {
      const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

      priorities.forEach((priority) => {
        const data = { ...validGapAssessmentItem, priority };
        const result = gapAssessmentItemSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid priority value', () => {
      const invalid = { ...validGapAssessmentItem, priority: 'URGENT' };

      const result = gapAssessmentItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate all estimatedEffort enum values', () => {
      const efforts = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const;

      efforts.forEach((effort) => {
        const data = { ...validGapAssessmentItem, estimatedEffort: effort };
        const result = gapAssessmentItemSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid estimatedEffort value', () => {
      const invalid = { ...validGapAssessmentItem, estimatedEffort: 'EXTREME' };

      const result = gapAssessmentItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept optional dependencies field', () => {
      const withoutDependencies = { ...validGapAssessmentItem };
      delete withoutDependencies.dependencies;

      const result = gapAssessmentItemSchema.safeParse(withoutDependencies);
      expect(result.success).toBe(true);
    });

    it('should accept empty string for dependencies', () => {
      const data = { ...validGapAssessmentItem, dependencies: '' };

      const result = gapAssessmentItemSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

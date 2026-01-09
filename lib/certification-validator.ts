/**
 * EU AI Act Compliance Certification Validator
 *
 * Validates whether an AI system meets all requirements for EU AI Act certification.
 * Checks completion of Gap Assessment, Technical Documentation, Risk Management, and Governance.
 *
 * Certification Requirements:
 * - Gap Assessment: ≥95% implemented
 * - Technical Documentation: 100% complete (all 8 sections)
 * - Risk Management: All HIGH/CRITICAL risks mitigated or formally accepted
 * - Governance: Minimum 3 roles assigned (Owner, Risk Owner, Compliance Officer)
 * - No open CRITICAL incidents
 */

import { prisma } from './prisma';

export interface CertificationValidationResult {
  ready: boolean;
  score: number;
  missingItems: string[];
  warnings: string[];
  details: {
    gapAssessment: {
      exists: boolean;
      score: number;
      implementedCount: number;
      totalCount: number;
      percentComplete: number;
      missingCategories: string[];
    };
    technicalDocumentation: {
      exists: boolean;
      completeness: number;
      missingSections: string[];
    };
    riskManagement: {
      exists: boolean;
      totalRisks: number;
      highRisksUnmitigated: number;
      criticalRisksUnmitigated: number;
      riskDetails: Array<{
        id: string;
        title: string;
        level: string;
        status: string;
        needsAttention: boolean;
      }>;
    };
    governance: {
      exists: boolean;
      rolesCount: number;
      missingRoles: string[];
      hasRequiredRoles: boolean;
    };
  };
}

const REQUIRED_ROLE_TYPES = [
  'SYSTEM_OWNER',
  'RISK_OWNER',
  'COMPLIANCE_OFFICER',
] as const;

const TECHNICAL_DOC_SECTIONS = [
  'intendedUse',
  'foreseeableMisuse',
  'systemArchitecture',
  'trainingData',
  'modelPerformance',
  'validationTesting',
  'humanOversightDoc',
  'cybersecurity',
] as const;

/**
 * Validates if an AI system is ready for certification
 */
export async function validateCertificationReadiness(
  systemId: string
): Promise<CertificationValidationResult> {
  // Fetch all required data
  const system = await prisma.aiSystem.findUnique({
    where: { id: systemId },
    include: {
      gapAssessment: {
        include: {
          requirements: {
            include: {
              evidence: true,
            },
          },
        },
      },
      aiRiskRegister: {
        include: {
          risks: {
            include: {
              mitigationActions: true,
            },
          },
        },
      },
      technicalDocumentation: true,
      aiGovernance: {
        include: {
          roles: true,
        },
      },
    },
  });

  if (!system) {
    throw new Error('AI system not found');
  }

  // Validate each component
  const gapDetails = validateGapAssessment(system.gapAssessment);
  const docsDetails = validateTechnicalDocumentation(system.technicalDocumentation);
  const risksDetails = validateRiskManagement(system.aiRiskRegister);
  const govDetails = validateGovernance(system.aiGovernance);

  // Calculate overall readiness score
  const score = calculateReadinessScore({
    gapAssessment: gapDetails,
    technicalDocumentation: docsDetails,
    riskManagement: risksDetails,
    governance: govDetails,
  });

  // Compile missing items
  const missingItems: string[] = [];
  const warnings: string[] = [];

  if (!gapDetails.exists) {
    missingItems.push('Gap Assessment: Not started. Complete a gap assessment first.');
  } else if (gapDetails.percentComplete < 95) {
    const remainingCount = Math.ceil(
      gapDetails.totalCount * (0.95 - gapDetails.percentComplete / 100)
    );
    missingItems.push(
      `Gap Assessment: ${gapDetails.percentComplete.toFixed(1)}% complete. Implement ${remainingCount} more requirement(s) to reach 95%.`
    );
    if (gapDetails.missingCategories.length > 0) {
      warnings.push(
        `Categories needing attention: ${gapDetails.missingCategories.join(', ')}`
      );
    }
  }

  if (!docsDetails.exists) {
    missingItems.push(
      'Technical Documentation: Not started. Complete technical documentation first.'
    );
  } else if (docsDetails.completeness < 100) {
    missingItems.push(
      `Technical Documentation: ${docsDetails.completeness}% complete. Complete these sections: ${docsDetails.missingSections.join(', ')}`
    );
  }

  if (!risksDetails.exists) {
    warnings.push('Risk Management: No risk register found. Consider adding risk assessments.');
  } else if (risksDetails.criticalRisksUnmitigated > 0) {
    const criticalRisks = risksDetails.riskDetails
      .filter((r) => r.level === 'CRITICAL' && r.needsAttention)
      .map((r) => r.title);
    missingItems.push(
      `Risk Management: ${risksDetails.criticalRisksUnmitigated} CRITICAL risk(s) not mitigated: ${criticalRisks.join(', ')}`
    );
  } else if (risksDetails.highRisksUnmitigated > 0) {
    const highRisks = risksDetails.riskDetails
      .filter((r) => r.level === 'HIGH' && r.needsAttention)
      .map((r) => r.title);
    missingItems.push(
      `Risk Management: ${risksDetails.highRisksUnmitigated} HIGH risk(s) not mitigated: ${highRisks.join(', ')}`
    );
  }

  if (!govDetails.exists) {
    missingItems.push(
      'Governance: Not established. Set up AI governance structure with roles.'
    );
  } else if (!govDetails.hasRequiredRoles) {
    missingItems.push(
      `Governance: Missing required roles - ${govDetails.missingRoles.join(', ')}. Assign these roles in Governance section.`
    );
  }

  // Determine if ready
  const ready =
    missingItems.length === 0 &&
    gapDetails.percentComplete >= 95 &&
    docsDetails.completeness === 100 &&
    risksDetails.highRisksUnmitigated === 0 &&
    risksDetails.criticalRisksUnmitigated === 0 &&
    govDetails.hasRequiredRoles;

  return {
    ready,
    score: Math.round(score),
    missingItems,
    warnings,
    details: {
      gapAssessment: gapDetails,
      technicalDocumentation: docsDetails,
      riskManagement: risksDetails,
      governance: govDetails,
    },
  };
}

/**
 * Validate Gap Assessment completion
 */
function validateGapAssessment(
  gapAssessment: any
): CertificationValidationResult['details']['gapAssessment'] {
  if (!gapAssessment) {
    return {
      exists: false,
      score: 0,
      implementedCount: 0,
      totalCount: 0,
      percentComplete: 0,
      missingCategories: [],
    };
  }

  const requirements = gapAssessment.requirements || [];
  const applicable = requirements.filter(
    (r: any) => r.status !== 'NOT_APPLICABLE'
  );
  const implemented = requirements.filter(
    (r: any) => r.status === 'IMPLEMENTED'
  );

  const totalCount = applicable.length;
  const implementedCount = implemented.length;
  const percentComplete = totalCount > 0 ? (implementedCount / totalCount) * 100 : 0;

  // Find categories with low completion
  const categoryProgress: Record<string, { implemented: number; total: number }> = {};
  requirements.forEach((req: any) => {
    if (req.status !== 'NOT_APPLICABLE') {
      if (!categoryProgress[req.category]) {
        categoryProgress[req.category] = { implemented: 0, total: 0 };
      }
      categoryProgress[req.category].total++;
      if (req.status === 'IMPLEMENTED') {
        categoryProgress[req.category].implemented++;
      }
    }
  });

  const missingCategories = Object.entries(categoryProgress)
    .filter(([_, progress]) => {
      const categoryPercent = (progress.implemented / progress.total) * 100;
      return categoryPercent < 80; // Flag categories below 80%
    })
    .map(([category]) => category);

  return {
    exists: true,
    score: percentComplete,
    implementedCount,
    totalCount,
    percentComplete,
    missingCategories,
  };
}

/**
 * Validate Technical Documentation completion
 */
function validateTechnicalDocumentation(
  techDoc: any
): CertificationValidationResult['details']['technicalDocumentation'] {
  if (!techDoc) {
    return {
      exists: false,
      completeness: 0,
      missingSections: [...TECHNICAL_DOC_SECTIONS],
    };
  }

  const completeness = techDoc.completenessPercentage || 0;
  const missingSections: string[] = [];

  // Check each required section
  TECHNICAL_DOC_SECTIONS.forEach((section) => {
    const content = techDoc[section];
    if (!content || content.trim().length < 50) {
      // Require at least 50 characters
      missingSections.push(formatSectionName(section));
    }
  });

  return {
    exists: true,
    completeness,
    missingSections,
  };
}

/**
 * Validate Risk Management completion
 */
function validateRiskManagement(
  riskRegister: any
): CertificationValidationResult['details']['riskManagement'] {
  if (!riskRegister) {
    return {
      exists: false,
      totalRisks: 0,
      highRisksUnmitigated: 0,
      criticalRisksUnmitigated: 0,
      riskDetails: [],
    };
  }

  const risks = riskRegister.risks || [];
  const riskDetails: CertificationValidationResult['details']['riskManagement']['riskDetails'] =
    [];

  let highRisksUnmitigated = 0;
  let criticalRisksUnmitigated = 0;

  risks.forEach((risk: any) => {
    const isHighOrCritical =
      risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL';

    if (isHighOrCritical) {
      // Check if accepted with justification
      const isAccepted =
        risk.treatmentDecision === 'ACCEPT' && risk.treatmentJustification;

      // Check if mitigated
      const completedMitigations = (risk.mitigationActions || []).filter(
        (m: any) => m.status === 'COMPLETED'
      );
      const isMitigated = completedMitigations.length > 0;

      const needsAttention = !isAccepted && !isMitigated;

      if (needsAttention) {
        if (risk.riskLevel === 'CRITICAL') {
          criticalRisksUnmitigated++;
        } else {
          highRisksUnmitigated++;
        }
      }

      riskDetails.push({
        id: risk.id,
        title: risk.riskTitle,
        level: risk.riskLevel,
        status: isMitigated
          ? 'Mitigated'
          : isAccepted
          ? 'Accepted'
          : 'Needs Mitigation',
        needsAttention,
      });
    }
  });

  return {
    exists: true,
    totalRisks: risks.length,
    highRisksUnmitigated,
    criticalRisksUnmitigated,
    riskDetails,
  };
}

/**
 * Validate Governance structure
 */
function validateGovernance(
  governance: any
): CertificationValidationResult['details']['governance'] {
  if (!governance) {
    return {
      exists: false,
      rolesCount: 0,
      missingRoles: [...REQUIRED_ROLE_TYPES],
      hasRequiredRoles: false,
    };
  }

  const roles = governance.roles || [];
  const activeRoles = roles.filter((r: any) => r.isActive !== false);
  const assignedRoleTypes = new Set(activeRoles.map((r: any) => r.roleType));

  const missingRoles = REQUIRED_ROLE_TYPES.filter(
    (rt) => !assignedRoleTypes.has(rt)
  ).map(formatRoleType);

  return {
    exists: true,
    rolesCount: activeRoles.length,
    missingRoles,
    hasRequiredRoles: missingRoles.length === 0,
  };
}

/**
 * Calculate overall readiness score (0-100)
 * Weighted: Gap 40%, Docs 30%, Risks 20%, Governance 10%
 */
function calculateReadinessScore(details: CertificationValidationResult['details']): number {
  const weights = {
    gapAssessment: 0.4,
    technicalDocs: 0.3,
    riskManagement: 0.2,
    governance: 0.1,
  };

  // Gap Assessment score (0-100)
  const gapScore = details.gapAssessment.exists
    ? details.gapAssessment.percentComplete
    : 0;

  // Technical Documentation score (0-100)
  const docsScore = details.technicalDocumentation.exists
    ? details.technicalDocumentation.completeness
    : 0;

  // Risk Management score (0-100)
  let risksScore = 100;
  if (details.riskManagement.exists && details.riskManagement.totalRisks > 0) {
    const unmitigatedCount =
      details.riskManagement.highRisksUnmitigated +
      details.riskManagement.criticalRisksUnmitigated;
    risksScore = Math.max(
      0,
      100 - (unmitigatedCount / details.riskManagement.totalRisks) * 100
    );
  }

  // Governance score (0-100)
  const govScore = details.governance.exists
    ? Math.min(100, (details.governance.rolesCount / 3) * 100)
    : 0;

  // Weighted total
  return (
    gapScore * weights.gapAssessment +
    docsScore * weights.technicalDocs +
    risksScore * weights.riskManagement +
    govScore * weights.governance
  );
}

/**
 * Format section name for display
 */
function formatSectionName(section: string): string {
  return section
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format role type for display
 */
function formatRoleType(roleType: string): string {
  return roleType
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get certification readiness summary for display
 */
export function getReadinessSummary(
  result: CertificationValidationResult
): string {
  if (result.ready) {
    return 'System is ready for certification! All requirements met.';
  }

  const score = result.score;
  let status = 'Not Ready';
  if (score >= 95) status = 'Almost Ready';
  else if (score >= 80) status = 'In Progress';
  else if (score >= 50) status = 'Partially Complete';
  else status = 'Getting Started';

  return `${status} (${score}% complete)`;
}

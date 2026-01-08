import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { UnauthorizedError } from '@/lib/errors';
import { generateExecutiveSummaryReport } from '@/lib/document-generators/executive-summary';
import { convertDocument } from '@/lib/pdf-converter';

/**
 * GET /api/export/executive-summary
 * Export organization-wide executive summary as Word document (.docx) or PDF
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf'; // pdf or docx

    // Fetch organization data
    const organization = await prisma.organization.findUnique({
      where: {
        id: session.user.organizationId,
      },
      select: {
        name: true,
        industry: true,
        region: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      throw new UnauthorizedError('Organization not found');
    }

    // Fetch all AI systems with related data
    const systems = await prisma.aiSystem.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        riskClassification: true,
        gapAssessment: {
          include: {
            requirements: true,
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
        incidents: true,
      },
    });

    // Calculate overall statistics
    const systemSummaries = systems.map((system) => {
      const gapAssessment = system.gapAssessment;
      let complianceScore = 0;
      let lastAssessed = system.updatedAt;

      if (gapAssessment) {
        const requirements = gapAssessment.requirements;
        const applicable = requirements.filter((r) => r.status !== 'NOT_APPLICABLE');
        const implemented = requirements.filter((r) => r.status === 'IMPLEMENTED');
        complianceScore = applicable.length > 0 ? (implemented.length / applicable.length) * 100 : 0;
        lastAssessed = gapAssessment.lastAssessedDate;
      }

      return {
        id: system.id,
        name: system.name,
        riskCategory: system.riskClassification?.category || 'NOT_CLASSIFIED',
        deploymentStatus: system.deploymentStatus,
        complianceScore,
        lastAssessed,
      };
    });

    // Calculate overall readiness
    const avgCompliance =
      systemSummaries.length > 0
        ? systemSummaries.reduce((sum, s) => sum + s.complianceScore, 0) /
          systemSummaries.length
        : 0;

    // Aggregate gap data
    const allGaps: Record<
      string,
      { implemented: number; total: number }
    > = {};

    systems.forEach((system) => {
      if (system.gapAssessment) {
        system.gapAssessment.requirements.forEach((req) => {
          if (!allGaps[req.category]) {
            allGaps[req.category] = { implemented: 0, total: 0 };
          }
          if (req.status !== 'NOT_APPLICABLE') {
            allGaps[req.category].total++;
            if (req.status === 'IMPLEMENTED') {
              allGaps[req.category].implemented++;
            }
          }
        });
      }
    });

    const gapSummaries = Object.entries(allGaps).map(([category, data]) => ({
      category: getCategoryTitle(category),
      implemented: data.implemented,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.implemented / data.total) * 100) : 0,
    }));

    // Aggregate risk data
    const allRisks = systems.flatMap((system) =>
      system.aiRiskRegister
        ? system.aiRiskRegister.risks.map((risk) => ({
            id: risk.id,
            title: risk.title,
            type: risk.type,
            riskLevel: risk.riskLevel,
            residualRiskLevel: risk.residualRiskLevel,
          }))
        : []
    );

    // Aggregate incident data
    const allIncidents = systems.flatMap((system) =>
      system.incidents.map((incident) => ({
        id: incident.id,
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
        occurredAt: incident.occurredAt,
      }))
    );

    // Sort incidents by date (most recent first)
    allIncidents.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    // Generate executive summary document
    const docxBuffer = await generateExecutiveSummaryReport({
      organization: {
        name: organization.name,
        industry: organization.industry || 'Not specified',
        region: organization.region || 'Not specified',
      },
      overallReadiness: avgCompliance,
      systems: systemSummaries,
      gaps: gapSummaries,
      risks: allRisks,
      incidents: allIncidents.slice(0, 10), // Last 10 incidents
      lastUpdated: organization.updatedAt,
    });

    // Convert to requested format
    const { buffer, extension, mimeType } = await convertDocument(
      docxBuffer,
      `Executive_Summary_${organization.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      format === 'pdf'
    );

    // Generate safe filename
    const orgName = organization.name.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const filename = `Executive_Summary_${orgName}_${date}.${extension}`;

    // Return document as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    RISK_MANAGEMENT: 'Risk Management System',
    DATA_GOVERNANCE: 'Data Governance & Quality',
    TECHNICAL_DOCUMENTATION: 'Technical Documentation',
    RECORD_KEEPING: 'Record-Keeping & Logging',
    TRANSPARENCY: 'Transparency & User Information',
    HUMAN_OVERSIGHT: 'Human Oversight & Control',
    ACCURACY_ROBUSTNESS: 'Accuracy, Robustness & Cybersecurity',
    CYBERSECURITY: 'Cybersecurity Measures',
  };
  return titles[category] || category;
}

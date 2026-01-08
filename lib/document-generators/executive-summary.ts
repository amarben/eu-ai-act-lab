import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';
import { generateExecutiveSummary, isGeminiConfigured } from '@/lib/gemini';

interface SystemSummary {
  id: string;
  name: string;
  riskCategory: string;
  deploymentStatus: string;
  complianceScore: number;
  lastAssessed: Date;
}

interface RiskSummary {
  id: string;
  title: string;
  type: string;
  riskLevel: string;
  residualRiskLevel: string | null;
}

interface GapSummary {
  category: string;
  implemented: number;
  total: number;
  percentage: number;
}

interface IncidentSummary {
  id: string;
  title: string;
  severity: string;
  status: string;
  occurredAt: Date;
}

interface ExecutiveSummaryData {
  organization: {
    name: string;
    industry: string;
    region: string;
  };
  overallReadiness: number;
  systems: SystemSummary[];
  gaps: GapSummary[];
  risks: RiskSummary[];
  incidents: IncidentSummary[];
  lastUpdated: Date;
}

// Document styling constants
const COLORS = {
  PRIMARY: '1E40AF',
  SECONDARY: '6B7280',
  SUCCESS: '10B981',
  WARNING: 'F59E0B',
  DANGER: 'EF4444',
  CRITICAL: 'DC2626',
  HEADER_BG: 'E5E7EB',
};

function createTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32,
        color: COLORS.PRIMARY,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  });
}

function createSubtitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 24,
        color: COLORS.SECONDARY,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });
}

function createHeading1(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });
}

function createHeading2(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });
}

function createParagraph(text: string, options: { bold?: boolean; indent?: number; italic?: boolean; color?: string; } = {}): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options.bold,
        italics: options.italic,
        color: options.color,
      }),
    ],
    spacing: { after: 120 },
    indent: options.indent ? { left: convertInchesToTwip(options.indent) } : undefined,
  });
}

function createBulletPoint(text: string, level: number = 0): Paragraph {
  return new Paragraph({
    text,
    bullet: { level },
    spacing: { after: 120 },
  });
}

function getComplianceColor(score: number): string {
  if (score >= 80) return COLORS.SUCCESS;
  if (score >= 60) return COLORS.WARNING;
  return COLORS.DANGER;
}

function getReadinessAssessment(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Critical';
}

function createSystemsTable(systems: SystemSummary[]): Table {
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'AI System', bold: true })],
          shading: { fill: COLORS.HEADER_BG },
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Risk Category', bold: true })],
          shading: { fill: COLORS.HEADER_BG },
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Status', bold: true })],
          shading: { fill: COLORS.HEADER_BG },
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Compliance', bold: true })],
          shading: { fill: COLORS.HEADER_BG },
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Last Assessed', bold: true })],
          shading: { fill: COLORS.HEADER_BG },
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
      ],
    })
  );

  // Data rows
  systems.forEach((system) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(system.name)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(system.riskCategory)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(system.deploymentStatus)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${Math.round(system.complianceScore)}%`,
                    color: getComplianceColor(system.complianceScore),
                    bold: true,
                  }),
                ],
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(system.lastAssessed.toLocaleDateString())],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
    },
  });
}

function createGapsTable(gaps: GapSummary[]): Table {
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Compliance Category', bold: true })],
          shading: { fill: COLORS.HEADER_BG },
          width: { size: 50, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Implemented', bold: true })],
          shading: { fill: COLORS.HEADER_BG },
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Total', bold: true })],
          shading: { fill: COLORS.HEADER_BG },
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Progress', bold: true })],
          shading: { fill: COLORS.HEADER_BG },
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
      ],
    })
  );

  // Data rows
  gaps.forEach((gap) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(gap.category)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(gap.implemented.toString())],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(gap.total.toString())],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${gap.percentage}%`,
                    color: getComplianceColor(gap.percentage),
                    bold: true,
                  }),
                ],
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

export async function generateExecutiveSummaryReport(data: ExecutiveSummaryData): Promise<Buffer> {
  const { organization, overallReadiness, systems, gaps, risks, incidents, lastUpdated } = data;

  // Calculate statistics
  const highRiskSystems = systems.filter((s) => s.riskCategory === 'HIGH_RISK').length;
  const criticalRisks = risks.filter((r) => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH').length;
  const openIncidents = incidents.filter((i) => i.status !== 'CLOSED' && i.status !== 'RESOLVED').length;

  // Get top gaps (lowest scoring categories)
  const topGaps = gaps
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3)
    .map((g) => `${g.category} (${g.percentage}%)`);

  // Get top risks
  const topRisks = risks
    .filter((r) => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH')
    .slice(0, 5)
    .map((r) => `${r.title} (${r.type})`);

  // Generate AI content if available
  let aiGeneratedSummary = '';
  if (isGeminiConfigured()) {
    try {
      aiGeneratedSummary = await generateExecutiveSummary({
        organizationName: organization.name,
        overallReadiness,
        systemsCount: systems.length,
        highRiskSystems,
        topGaps,
        topRisks,
      });
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      aiGeneratedSummary = 'AI-generated summary unavailable. See detailed compliance status below.';
    }
  } else {
    aiGeneratedSummary =
      'AI-generated summary unavailable (Gemini API not configured). See detailed compliance status below.';
  }

  // Build document sections
  const sections: Paragraph[] = [];

  // Cover Page
  sections.push(createTitle('EU AI Act Compliance'));
  sections.push(createSubtitle('Executive Summary'));
  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  sections.push(createParagraph(organization.name, { bold: true }));
  sections.push(createParagraph(`Industry: ${organization.industry}`));
  sections.push(createParagraph(`Region: ${organization.region}`));
  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  sections.push(createParagraph(`Report Date: ${new Date().toLocaleDateString()}`, { italic: true }));
  sections.push(createParagraph(`Last Updated: ${lastUpdated.toLocaleDateString()}`, { italic: true }));
  sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));

  // Compliance Readiness Score
  sections.push(createHeading1('Overall Compliance Readiness'));
  sections.push(
    createParagraph(
      `${Math.round(overallReadiness)}% - ${getReadinessAssessment(overallReadiness)}`,
      { bold: true, color: getComplianceColor(overallReadiness) }
    )
  );
  sections.push(createParagraph(`Total AI Systems: ${systems.length}`));
  sections.push(createParagraph(`High-Risk Systems: ${highRiskSystems}`));
  sections.push(createParagraph(`Critical/High Risks: ${criticalRisks}`));
  sections.push(createParagraph(`Open Incidents: ${openIncidents}`));

  // AI-Generated Executive Summary
  sections.push(createHeading1('Executive Summary'));
  aiGeneratedSummary.split('\n\n').forEach((para) => {
    if (para.trim()) {
      sections.push(createParagraph(para.trim()));
    }
  });

  // AI Systems Status
  sections.push(createHeading1('AI Systems Portfolio'));
  sections.push(createParagraph(`The organization manages ${systems.length} AI systems:`));
  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  sections.push(new Paragraph({ children: [createSystemsTable(systems)] }));

  // Compliance Progress
  if (gaps.length > 0) {
    sections.push(createHeading1('Compliance Progress by Category'));
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    sections.push(new Paragraph({ children: [createGapsTable(gaps)] }));
  }

  // Top Risks
  if (risks.length > 0) {
    sections.push(createHeading1('Key Risks'));
    const highPriorityRisks = risks.filter(
      (r) => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH'
    );

    if (highPriorityRisks.length > 0) {
      sections.push(createHeading2('Critical & High Risks'));
      highPriorityRisks.slice(0, 5).forEach((risk, idx) => {
        const riskColor = risk.riskLevel === 'CRITICAL' ? COLORS.CRITICAL : COLORS.DANGER;
        sections.push(
          createParagraph(
            `${idx + 1}. ${risk.title} (${risk.type}) - ${risk.riskLevel}`,
            { bold: true, color: riskColor }
          )
        );
        if (risk.residualRiskLevel) {
          sections.push(
            createParagraph(`   Residual Risk: ${risk.residualRiskLevel}`, {
              indent: 0.3,
              color: COLORS.SECONDARY,
            })
          );
        }
      });
    }
  }

  // Recent Incidents
  if (incidents.length > 0) {
    sections.push(createHeading1('Recent Incidents'));
    const recentIncidents = incidents.slice(0, 5);
    recentIncidents.forEach((incident) => {
      const severityColor =
        incident.severity === 'CRITICAL' || incident.severity === 'HIGH'
          ? COLORS.DANGER
          : incident.severity === 'MEDIUM'
          ? COLORS.WARNING
          : COLORS.SECONDARY;

      sections.push(
        createParagraph(
          `${incident.title} - ${incident.severity} (${incident.status})`,
          { bold: true, color: severityColor }
        )
      );
      sections.push(
        createParagraph(`Occurred: ${incident.occurredAt.toLocaleDateString()}`, {
          indent: 0.3,
        })
      );
    });
  }

  // Next Steps
  sections.push(createHeading1('Recommended Next Steps'));
  sections.push(createBulletPoint('Complete gap assessments for all high-risk systems'));
  sections.push(createBulletPoint('Implement mitigation actions for critical and high-priority risks'));
  sections.push(
    createBulletPoint('Address compliance categories scoring below 70%')
  );
  sections.push(createBulletPoint('Establish continuous monitoring and review processes'));
  sections.push(createBulletPoint('Prepare for upcoming EU AI Act enforcement deadlines'));

  // Footer
  sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  sections.push(createParagraph('---'));
  sections.push(
    createParagraph(
      `This executive summary was generated by the EU AI Act Implementation Lab on ${new Date().toLocaleDateString()}.`,
      { italic: true, color: COLORS.SECONDARY }
    )
  );
  sections.push(
    createParagraph('Confidential - For internal use and audit purposes only.', {
      bold: true,
      color: COLORS.DANGER,
    })
  );

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  // Generate buffer
  return await Packer.toBuffer(doc);
}

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
  BorderStyle,
  convertInchesToTwip,
  VerticalAlign,
} from 'docx';
import {
  generateRiskAssessmentNarrative,
  isGeminiConfigured,
} from '@/lib/gemini';

interface MitigationAction {
  id: string;
  description: string;
  responsibleParty: string;
  dueDate: Date | null;
  status: string;
  effectivenessRating: number | null;
  completionDate: Date | null;
  notes: string | null;
}

interface HumanOversight {
  id: string;
  monitoringFrequency: string;
  oversightMethod: string;
  escalationTriggers: string[];
  overrideCapability: boolean;
  responsiblePerson: string;
  effectivenessNotes: string | null;
}

interface RiskData {
  id: string;
  title: string;
  type: string;
  description: string;
  affectedStakeholders: string[];
  potentialImpact: string;
  likelihood: number;
  impact: number;
  inherentRiskScore: number;
  riskLevel: string;
  treatmentDecision: string | null;
  treatmentJustification: string | null;
  residualLikelihood: number | null;
  residualImpact: number | null;
  residualRiskScore: number | null;
  residualRiskLevel: string | null;
  mitigationActions: MitigationAction[];
  humanOversight: HumanOversight | null;
}

interface AIRiskRegisterData {
  id: string;
  lastAssessedDate: Date;
  assessedBy: string;
  aiSystem: {
    id: string;
    name: string;
    businessPurpose: string;
    deploymentStatus: string;
  };
  risks: RiskData[];
}

// Document styling constants
const COLORS = {
  PRIMARY: '1E40AF', // Blue 800
  SECONDARY: '6B7280', // Gray 500
  SUCCESS: '10B981', // Green 500
  WARNING: 'F59E0B', // Amber 500
  DANGER: 'EF4444', // Red 500
  CRITICAL: 'DC2626', // Red 600
};

function createTitle(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
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

function createHeading3(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
  });
}

function createParagraph(text: string, options: { bold?: boolean; indent?: number; color?: string } = {}): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options.bold,
        color: options.color,
      }),
    ],
    spacing: { after: 120 },
    indent: options.indent ? { left: convertInchesToTwip(options.indent) } : undefined,
  });
}

function createBulletPoint(text: string): Paragraph {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 120 },
  });
}

function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'CRITICAL':
      return COLORS.CRITICAL;
    case 'HIGH':
      return COLORS.DANGER;
    case 'MEDIUM':
      return COLORS.WARNING;
    case 'LOW':
      return COLORS.SUCCESS;
    default:
      return COLORS.SECONDARY;
  }
}

function getRiskTypeName(type: string): string {
  const types: Record<string, string> = {
    BIAS: 'Bias & Discrimination',
    SAFETY: 'Safety & Harm',
    MISUSE: 'Misuse & Abuse',
    TRANSPARENCY: 'Transparency & Explainability',
    PRIVACY: 'Privacy & Data Protection',
    CYBERSECURITY: 'Cybersecurity',
  };
  return types[type] || type;
}

function getRiskLevelBadge(level: string): string {
  const badges: Record<string, string> = {
    CRITICAL: '🔴 Critical',
    HIGH: '🟠 High',
    MEDIUM: '🟡 Medium',
    LOW: '🟢 Low',
  };
  return badges[level] || level;
}

function createRiskSummaryTable(risks: RiskData[]): Table {
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Risk Title', bold: true })],
          shading: { fill: 'E5E7EB' },
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Type', bold: true })],
          shading: { fill: 'E5E7EB' },
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Inherent Risk', bold: true })],
          shading: { fill: 'E5E7EB' },
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Residual Risk', bold: true })],
          shading: { fill: 'E5E7EB' },
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Mitigations', bold: true })],
          shading: { fill: 'E5E7EB' },
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
      ],
    })
  );

  // Data rows
  risks.forEach((risk) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(risk.title)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(getRiskTypeName(risk.type))],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: getRiskLevelBadge(risk.riskLevel),
                    color: getRiskLevelColor(risk.riskLevel),
                  }),
                ],
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: risk.residualRiskLevel
                      ? getRiskLevelBadge(risk.residualRiskLevel)
                      : 'Not assessed',
                    color: risk.residualRiskLevel
                      ? getRiskLevelColor(risk.residualRiskLevel)
                      : COLORS.SECONDARY,
                  }),
                ],
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(risk.mitigationActions.length.toString())],
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

export async function generateRiskRegisterReport(data: AIRiskRegisterData): Promise<Buffer> {
  const { aiSystem, risks, lastAssessedDate, assessedBy } = data;

  // Calculate statistics
  const risksByLevel = risks.reduce((acc, risk) => {
    acc[risk.riskLevel] = (acc[risk.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalMitigations = risks.reduce(
    (sum, risk) => sum + risk.mitigationActions.length,
    0
  );

  const risksWithOversight = risks.filter((r) => r.humanOversight).length;

  // Generate AI content if available
  let executiveSummary = '';
  if (isGeminiConfigured()) {
    try {
      executiveSummary = await generateRiskAssessmentNarrative({
        systemName: aiSystem.name,
        risks: risks.map((r) => ({
          title: r.title,
          type: r.type,
          inherentScore: r.inherentRiskScore,
          residualScore: r.residualRiskScore || r.inherentRiskScore,
          mitigations: r.mitigationActions.map((m) => m.description),
          oversight: r.humanOversight?.oversightMethod || 'Not defined',
        })),
      });
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      executiveSummary =
        'AI-generated summary unavailable. See detailed risk assessment below.';
    }
  } else {
    executiveSummary =
      'AI-generated summary unavailable (Gemini API not configured). See detailed risk assessment below.';
  }

  // Build document sections
  const sections: Paragraph[] = [];

  // Cover page
  sections.push(createTitle('AI Risk Register'));
  sections.push(createParagraph(`AI System: ${aiSystem.name}`, { bold: true }));
  sections.push(createParagraph(`Assessment Date: ${lastAssessedDate.toLocaleDateString()}`));
  sections.push(createParagraph(`Assessed By: ${assessedBy}`));
  sections.push(createParagraph(`Total Risks Identified: ${risks.length}`, { bold: true }));
  sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));

  // Executive Summary
  sections.push(createHeading1('Executive Summary'));
  executiveSummary.split('\n\n').forEach((para) => {
    if (para.trim()) {
      sections.push(createParagraph(para.trim()));
    }
  });

  // System Information
  sections.push(createHeading1('AI System Information'));
  sections.push(createBulletPoint(`Name: ${aiSystem.name}`));
  sections.push(createBulletPoint(`Business Purpose: ${aiSystem.businessPurpose}`));
  sections.push(createBulletPoint(`Deployment Status: ${aiSystem.deploymentStatus}`));

  // Risk Overview
  sections.push(createHeading1('Risk Overview'));
  sections.push(createParagraph(`Total Risks: ${risks.length}`, { bold: true }));
  sections.push(createBulletPoint(`Critical Risks: ${risksByLevel['CRITICAL'] || 0}`));
  sections.push(createBulletPoint(`High Risks: ${risksByLevel['HIGH'] || 0}`));
  sections.push(createBulletPoint(`Medium Risks: ${risksByLevel['MEDIUM'] || 0}`));
  sections.push(createBulletPoint(`Low Risks: ${risksByLevel['LOW'] || 0}`));
  sections.push(createParagraph(`Total Mitigation Actions: ${totalMitigations}`));
  sections.push(createParagraph(`Risks with Human Oversight: ${risksWithOversight}`));

  // Risk Summary Table
  sections.push(createHeading2('Risk Summary'));
  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  sections.push(new Paragraph({ children: [createRiskSummaryTable(risks)] }));

  // Detailed Risk Assessment
  sections.push(createHeading1('Detailed Risk Assessment'));

  risks.forEach((risk, index) => {
    sections.push(createHeading2(`${index + 1}. ${risk.title}`));

    // Basic Information
    sections.push(createParagraph(`Type: ${getRiskTypeName(risk.type)}`, { bold: true }));
    sections.push(createParagraph(`Description:`, { bold: true }));
    sections.push(createParagraph(risk.description, { indent: 0.3 }));

    sections.push(createParagraph(`Affected Stakeholders:`, { bold: true }));
    risk.affectedStakeholders.forEach((stakeholder) => {
      sections.push(createBulletPoint(stakeholder));
    });

    sections.push(createParagraph(`Potential Impact:`, { bold: true }));
    sections.push(createParagraph(risk.potentialImpact, { indent: 0.3 }));

    // Risk Scoring
    sections.push(createHeading3('Risk Scoring'));
    sections.push(createParagraph(`Likelihood: ${risk.likelihood}/5`));
    sections.push(createParagraph(`Impact: ${risk.impact}/5`));
    sections.push(
      createParagraph(
        `Inherent Risk Score: ${risk.inherentRiskScore} (${getRiskLevelBadge(risk.riskLevel)})`,
        { bold: true, color: getRiskLevelColor(risk.riskLevel) }
      )
    );

    if (risk.residualRiskScore) {
      sections.push(
        createParagraph(
          `Residual Risk Score: ${risk.residualRiskScore} (${getRiskLevelBadge(risk.residualRiskLevel || '')})`,
          { bold: true, color: getRiskLevelColor(risk.residualRiskLevel || 'LOW') }
        )
      );
    }

    // Treatment Decision
    if (risk.treatmentDecision) {
      sections.push(createHeading3('Risk Treatment'));
      sections.push(createParagraph(`Decision: ${risk.treatmentDecision}`, { bold: true }));
      if (risk.treatmentJustification) {
        sections.push(createParagraph(risk.treatmentJustification, { indent: 0.3 }));
      }
    }

    // Mitigation Actions
    if (risk.mitigationActions.length > 0) {
      sections.push(createHeading3('Mitigation Actions'));
      risk.mitigationActions.forEach((action, idx) => {
        sections.push(createParagraph(`${idx + 1}. ${action.description}`, { bold: true }));
        sections.push(createParagraph(`Responsible: ${action.responsibleParty}`, { indent: 0.3 }));
        sections.push(
          createParagraph(`Status: ${action.status}`, { indent: 0.3 })
        );
        if (action.dueDate) {
          sections.push(
            createParagraph(`Due Date: ${action.dueDate.toLocaleDateString()}`, { indent: 0.3 })
          );
        }
        if (action.effectivenessRating) {
          sections.push(
            createParagraph(`Effectiveness Rating: ${action.effectivenessRating}/10`, { indent: 0.3 })
          );
        }
        if (action.notes) {
          sections.push(createParagraph(`Notes: ${action.notes}`, { indent: 0.3 }));
        }
      });
    }

    // Human Oversight
    if (risk.humanOversight) {
      sections.push(createHeading3('Human Oversight'));
      sections.push(
        createParagraph(`Monitoring Frequency: ${risk.humanOversight.monitoringFrequency}`)
      );
      sections.push(createParagraph(`Oversight Method:`, { bold: true }));
      sections.push(createParagraph(risk.humanOversight.oversightMethod, { indent: 0.3 }));
      sections.push(
        createParagraph(`Responsible Person: ${risk.humanOversight.responsiblePerson}`)
      );
      sections.push(
        createParagraph(
          `Override Capability: ${risk.humanOversight.overrideCapability ? 'Yes' : 'No'}`
        )
      );
      if (risk.humanOversight.escalationTriggers.length > 0) {
        sections.push(createParagraph(`Escalation Triggers:`, { bold: true }));
        risk.humanOversight.escalationTriggers.forEach((trigger) => {
          sections.push(createBulletPoint(trigger));
        });
      }
      if (risk.humanOversight.effectivenessNotes) {
        sections.push(createParagraph(`Effectiveness Notes:`, { bold: true }));
        sections.push(
          createParagraph(risk.humanOversight.effectivenessNotes, { indent: 0.3 })
        );
      }
    }

    sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  });

  // Footer
  sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  sections.push(createParagraph('---'));
  sections.push(
    createParagraph(
      `This risk register was generated by the EU AI Act Implementation Lab on ${new Date().toLocaleDateString()}.`,
      { bold: false }
    )
  );
  sections.push(createParagraph('For audit and compliance purposes only.', { bold: false }));

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

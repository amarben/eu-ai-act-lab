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
} from 'docx';
import {
  generateGapAssessmentSummary,
  generateCategoryGapAnalysis,
  generateComplianceRecommendations,
  isGeminiConfigured,
} from '@/lib/gemini';

interface Evidence {
  id: string;
  type: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  linkUrl: string | null;
  textContent: string | null;
}

interface RequirementAssessment {
  id: string;
  category: string;
  title: string;
  description: string;
  regulatoryReference: string;
  status: string;
  priority: string;
  notes: string | null;
  evidence: Evidence[];
}

interface GapAssessmentData {
  id: string;
  overallScore: number;
  lastAssessedDate: Date;
  aiSystem: {
    id: string;
    name: string;
    businessPurpose: string;
    deploymentStatus: string;
  };
  requirements: RequirementAssessment[];
}

// Document styling constants
const COLORS = {
  PRIMARY: '1E40AF', // Blue 800
  SECONDARY: '6B7280', // Gray 500
  SUCCESS: '10B981', // Green 500
  WARNING: 'F59E0B', // Amber 500
  DANGER: 'EF4444', // Red 500
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

function createParagraph(text: string, options: { bold?: boolean; indent?: number } = {}): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options.bold,
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

function getScoreColor(score: number): string {
  if (score >= 80) return COLORS.SUCCESS;
  if (score >= 60) return COLORS.WARNING;
  return COLORS.DANGER;
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

function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    IMPLEMENTED: '✓ Implemented',
    IN_PROGRESS: '⋯ In Progress',
    NOT_STARTED: '○ Not Started',
    NOT_APPLICABLE: '– N/A',
  };
  return badges[status] || status;
}

export async function generateGapAssessmentReport(data: GapAssessmentData): Promise<Buffer> {
  const { aiSystem, requirements, overallScore, lastAssessedDate } = data;

  // Group requirements by category
  const categories = requirements.reduce((acc, req) => {
    if (!acc[req.category]) {
      acc[req.category] = [];
    }
    acc[req.category].push(req);
    return acc;
  }, {} as Record<string, RequirementAssessment[]>);

  // Calculate category scores
  const categoryScores = Object.entries(categories).map(([category, reqs]) => {
    const applicable = reqs.filter((r) => r.status !== 'NOT_APPLICABLE');
    const implemented = reqs.filter((r) => r.status === 'IMPLEMENTED');
    const score = applicable.length > 0 ? (implemented.length / applicable.length) * 100 : 0;
    return {
      name: getCategoryTitle(category),
      category,
      score: implemented.length,
      total: applicable.length,
      percentage: Math.round(score),
      requirements: reqs,
    };
  });

  // Generate AI content if available
  let executiveSummary = '';
  let recommendations = '';
  const categoryAnalyses: Record<string, string> = {};

  if (isGeminiConfigured()) {
    try {
      // Generate executive summary
      executiveSummary = await generateGapAssessmentSummary({
        systemName: aiSystem.name,
        overallScore,
        categories: categoryScores.map((cat) => ({
          name: cat.name,
          score: cat.score,
          total: cat.total,
          requirements: cat.requirements.map((req) => ({
            requirement: req.title,
            status: req.status,
            notes: req.notes || undefined,
          })),
        })),
      });

      // Generate recommendations
      recommendations = await generateComplianceRecommendations({
        systemName: aiSystem.name,
        riskCategory: 'HIGH_RISK',
        overallScore,
        categories: categoryScores.map((cat) => ({
          name: cat.name,
          score: cat.score,
          total: cat.total,
        })),
      });

      // Generate category-specific analyses
      for (const cat of categoryScores) {
        categoryAnalyses[cat.category] = await generateCategoryGapAnalysis({
          categoryName: cat.name,
          requirements: cat.requirements.map((req) => ({
            requirement: req.title,
            status: req.status,
            notes: req.notes || undefined,
            evidence: req.evidence.map((e) => ({ fileName: e.title })),
          })),
        });
      }
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      executiveSummary = 'AI-generated summary unavailable. See detailed assessment below.';
    }
  } else {
    executiveSummary = 'AI-generated summary unavailable (Gemini API not configured). See detailed assessment below.';
  }

  // Build document sections
  const sections: Paragraph[] = [];

  // Cover page
  sections.push(createTitle('EU AI Act Gap Assessment Report'));
  sections.push(createParagraph(`AI System: ${aiSystem.name}`, { bold: true }));
  sections.push(createParagraph(`Assessment Date: ${lastAssessedDate.toLocaleDateString()}`));
  sections.push(createParagraph(`Overall Compliance Score: ${Math.round(overallScore)}%`, { bold: true }));
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

  // Compliance Overview
  sections.push(createHeading1('Compliance Overview'));
  sections.push(createParagraph(`Overall Compliance Score: ${Math.round(overallScore)}%`, { bold: true }));

  categoryScores.forEach((cat) => {
    sections.push(createBulletPoint(`${cat.name}: ${cat.score}/${cat.total} (${cat.percentage}%)`));
  });

  // Detailed Assessment by Category
  sections.push(createHeading1('Detailed Gap Assessment'));

  categoryScores.forEach((cat) => {
    sections.push(createHeading2(cat.name));
    sections.push(createParagraph(`Compliance: ${cat.score}/${cat.total} requirements (${cat.percentage}%)`));

    // Add AI-generated analysis if available
    if (categoryAnalyses[cat.category]) {
      sections.push(createParagraph('Analysis:', { bold: true }));
      categoryAnalyses[cat.category].split('\n\n').forEach((para) => {
        if (para.trim()) {
          sections.push(createParagraph(para.trim()));
        }
      });
    }

    // List requirements
    cat.requirements.forEach((req) => {
      sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      sections.push(createParagraph(`${getStatusBadge(req.status)} ${req.title}`, { bold: true }));
      sections.push(createParagraph(req.description, { indent: 0.3 }));
      sections.push(createParagraph(`Regulatory Reference: ${req.regulatoryReference}`, { indent: 0.3 }));

      if (req.notes) {
        sections.push(createParagraph(`Notes: ${req.notes}`, { indent: 0.3 }));
      }

      if (req.evidence.length > 0) {
        sections.push(createParagraph(`Evidence (${req.evidence.length}):`, { indent: 0.3, bold: true }));
        req.evidence.forEach((ev) => {
          sections.push(createParagraph(`• ${ev.title}`, { indent: 0.5 }));
        });
      }
    });
  });

  // Recommendations
  if (recommendations) {
    sections.push(createHeading1('Compliance Recommendations'));
    recommendations.split('\n').forEach((line) => {
      if (line.trim()) {
        if (line.match(/^\d+\./)) {
          sections.push(createParagraph(line.trim(), { bold: true }));
        } else {
          sections.push(createParagraph(line.trim(), { indent: 0.3 }));
        }
      }
    });
  }

  // Footer
  sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  sections.push(createParagraph('---'));
  sections.push(
    createParagraph(
      `This report was generated by the EU AI Act Implementation Lab on ${new Date().toLocaleDateString()}.`,
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

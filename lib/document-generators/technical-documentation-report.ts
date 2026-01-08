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
  generateTechnicalDocumentation,
  isGeminiConfigured,
} from '@/lib/gemini';

interface DocumentAttachment {
  id: string;
  fileName: string;
  fileType: string;
  section: string;
  description: string | null;
  uploadedAt: Date;
}

interface TechnicalDocumentationData {
  id: string;
  version: string;
  versionDate: Date;
  versionNotes: string | null;
  completenessPercentage: number;
  intendedUse: string | null;
  foreseeableMisuse: string | null;
  systemArchitecture: string | null;
  trainingData: string | null;
  modelPerformance: string | null;
  validationTesting: string | null;
  humanOversightDoc: string | null;
  cybersecurity: string | null;
  preparedBy: string;
  reviewedBy: string | null;
  approvedBy: string | null;
  approvalDate: Date | null;
  aiSystem: {
    id: string;
    name: string;
    businessPurpose: string;
    deploymentStatus: string;
    dataCategories: string[];
    userTypes: string[];
  };
  attachments: DocumentAttachment[];
}

// Document styling constants
const COLORS = {
  PRIMARY: '1E40AF', // Blue 800
  SECONDARY: '6B7280', // Gray 500
  SUCCESS: '10B981', // Green 500
  WARNING: 'F59E0B', // Amber 500
  DANGER: 'EF4444', // Red 500
  HEADER_BG: 'E5E7EB', // Gray 200
};

function createTitle(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.TITLE,
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

function createParagraph(text: string, options: { bold?: boolean; indent?: number; italic?: boolean; color?: string } = {}): Paragraph {
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

function createDocumentControlTable(data: {
  documentId: string;
  version: string;
  effectiveDate: string;
  preparedBy: string;
  reviewedBy: string;
  approvedBy: string;
}): Table {
  const createRow = (label: string, value: string) => new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: label, bold: true })],
        shading: { fill: COLORS.HEADER_BG },
        verticalAlign: VerticalAlign.CENTER,
        width: { size: 30, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
      }),
      new TableCell({
        children: [new Paragraph({ text: value })],
        verticalAlign: VerticalAlign.CENTER,
        width: { size: 70, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.SECONDARY },
    },
    rows: [
      createRow('Document ID', data.documentId),
      createRow('Version', data.version),
      createRow('Effective Date', data.effectiveDate),
      createRow('Prepared By', data.preparedBy),
      createRow('Reviewed By', data.reviewedBy),
      createRow('Approved By', data.approvedBy),
    ],
  });
}

function getSectionTitle(section: string): string {
  const titles: Record<string, string> = {
    INTENDED_USE: '1. Intended Purpose and Foreseeable Misuse',
    FORESEEABLE_MISUSE: '1.2 Foreseeable Misuse Scenarios',
    SYSTEM_ARCHITECTURE: '2. System Architecture and Design',
    TRAINING_DATA: '3. Training Data Governance',
    MODEL_PERFORMANCE: '4. Performance Metrics and Limitations',
    VALIDATION_TESTING: '5. Validation and Testing Procedures',
    HUMAN_OVERSIGHT: '6. Human Oversight Mechanisms',
    CYBERSECURITY: '7. Cybersecurity Measures',
  };
  return titles[section] || section;
}

export async function generateTechnicalDocumentationReport(data: TechnicalDocumentationData): Promise<Buffer> {
  const { aiSystem, version, versionDate, completenessPercentage, attachments } = data;

  // Generate AI-enhanced content if available
  let aiGenerated = {
    introduction: '',
    conclusion: '',
  };

  if (isGeminiConfigured()) {
    try {
      const sections = {
        intendedUse: data.intendedUse || undefined,
        foreseeableMisuse: data.foreseeableMisuse || undefined,
        architecture: data.systemArchitecture || undefined,
        trainingData: data.trainingData || undefined,
        performance: data.modelPerformance || undefined,
        testing: data.validationTesting || undefined,
        oversight: data.humanOversightDoc || undefined,
        cybersecurity: data.cybersecurity || undefined,
      };

      const generated = await generateTechnicalDocumentation({
        systemName: aiSystem.name,
        sections,
      });

      aiGenerated.introduction = generated.introduction;
      aiGenerated.conclusion = generated.conclusion;
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      aiGenerated.introduction = `This document provides comprehensive technical documentation for the ${aiSystem.name} AI system in accordance with Article 11 of the EU AI Act. It describes the system's intended purpose, technical specifications, and compliance measures.`;
      aiGenerated.conclusion = 'This documentation will be regularly reviewed and updated to reflect system changes and ensure ongoing compliance with the EU AI Act.';
    }
  } else {
    aiGenerated.introduction = `This document provides comprehensive technical documentation for the ${aiSystem.name} AI system in accordance with Article 11 of the EU AI Act. It describes the system's intended purpose, technical specifications, and compliance measures.`;
    aiGenerated.conclusion = 'This documentation will be regularly reviewed and updated to reflect system changes and ensure ongoing compliance with the EU AI Act.';
  }

  // Build document sections
  const sections: Paragraph[] = [];

  // Cover Page
  sections.push(createTitle('Technical Documentation'));
  sections.push(createSubtitle('EU AI Act Article 11 Compliance'));
  sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  sections.push(createParagraph(`AI System: ${aiSystem.name}`, { bold: true }));
  sections.push(createParagraph(`Version: ${version}`));
  sections.push(createParagraph(`Date: ${versionDate.toLocaleDateString()}`));
  sections.push(createParagraph(`Completeness: ${Math.round(completenessPercentage)}%`, {
    bold: true,
    color: completenessPercentage >= 80 ? COLORS.SUCCESS : completenessPercentage >= 50 ? COLORS.WARNING : COLORS.DANGER
  }));
  sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));

  // Document Control
  sections.push(createHeading1('Document Control'));
  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  sections.push(new Paragraph({
    children: [
      createDocumentControlTable({
        documentId: data.id.substring(0, 8).toUpperCase(),
        version: version,
        effectiveDate: versionDate.toLocaleDateString(),
        preparedBy: data.preparedBy,
        reviewedBy: data.reviewedBy || 'Pending',
        approvedBy: data.approvedBy || 'Pending',
      }),
    ],
  }));

  // Introduction
  sections.push(createHeading1('Introduction'));
  aiGenerated.introduction.split('\n\n').forEach((para) => {
    if (para.trim()) {
      sections.push(createParagraph(para.trim()));
    }
  });

  // AI System Overview
  sections.push(createHeading1('AI System Overview'));
  sections.push(createHeading2('System Information'));
  sections.push(createBulletPoint(`Name: ${aiSystem.name}`));
  sections.push(createBulletPoint(`Business Purpose: ${aiSystem.businessPurpose}`));
  sections.push(createBulletPoint(`Deployment Status: ${aiSystem.deploymentStatus}`));

  if (aiSystem.dataCategories && aiSystem.dataCategories.length > 0) {
    sections.push(createHeading2('Data Categories'));
    aiSystem.dataCategories.forEach((category) => {
      sections.push(createBulletPoint(category));
    });
  }

  if (aiSystem.userTypes && aiSystem.userTypes.length > 0) {
    sections.push(createHeading2('User Types'));
    aiSystem.userTypes.forEach((userType) => {
      sections.push(createBulletPoint(userType));
    });
  }

  // Section 1: Intended Use
  if (data.intendedUse) {
    sections.push(createHeading1(getSectionTitle('INTENDED_USE')));
    sections.push(createHeading2('Regulatory Reference'));
    sections.push(createParagraph('EU AI Act Article 11(1)(a) - Description of the intended purpose'));
    sections.push(createHeading2('Description'));
    data.intendedUse.split('\n\n').forEach((para) => {
      if (para.trim()) {
        sections.push(createParagraph(para.trim()));
      }
    });

    // Attachments for this section
    const sectionAttachments = attachments.filter((a) => a.section === 'INTENDED_USE');
    if (sectionAttachments.length > 0) {
      sections.push(createHeading2('Supporting Documentation'));
      sectionAttachments.forEach((att) => {
        sections.push(createBulletPoint(`${att.fileName} ${att.description ? `- ${att.description}` : ''}`));
      });
    }
  }

  // Section 2: Foreseeable Misuse
  if (data.foreseeableMisuse) {
    sections.push(createHeading1('Foreseeable Misuse Scenarios'));
    sections.push(createHeading2('Regulatory Reference'));
    sections.push(createParagraph('EU AI Act Article 11(1)(a) - Foreseeable misuse'));
    sections.push(createHeading2('Identified Misuse Scenarios'));
    data.foreseeableMisuse.split('\n\n').forEach((para) => {
      if (para.trim()) {
        sections.push(createParagraph(para.trim()));
      }
    });

    const sectionAttachments = attachments.filter((a) => a.section === 'FORESEEABLE_MISUSE');
    if (sectionAttachments.length > 0) {
      sections.push(createHeading2('Supporting Documentation'));
      sectionAttachments.forEach((att) => {
        sections.push(createBulletPoint(`${att.fileName} ${att.description ? `- ${att.description}` : ''}`));
      });
    }
  }

  // Section 3: System Architecture
  if (data.systemArchitecture) {
    sections.push(createHeading1(getSectionTitle('SYSTEM_ARCHITECTURE')));
    sections.push(createHeading2('Regulatory Reference'));
    sections.push(createParagraph('EU AI Act Article 11(1)(b) - System design and architecture'));
    sections.push(createHeading2('Architecture Description'));
    data.systemArchitecture.split('\n\n').forEach((para) => {
      if (para.trim()) {
        sections.push(createParagraph(para.trim()));
      }
    });

    const sectionAttachments = attachments.filter((a) => a.section === 'SYSTEM_ARCHITECTURE');
    if (sectionAttachments.length > 0) {
      sections.push(createHeading2('Supporting Documentation'));
      sectionAttachments.forEach((att) => {
        sections.push(createBulletPoint(`${att.fileName} ${att.description ? `- ${att.description}` : ''}`));
      });
    }
  }

  // Section 4: Training Data
  if (data.trainingData) {
    sections.push(createHeading1(getSectionTitle('TRAINING_DATA')));
    sections.push(createHeading2('Regulatory Reference'));
    sections.push(createParagraph('EU AI Act Article 10 - Data and data governance, Article 11(1)(c)'));
    sections.push(createHeading2('Training Data Documentation'));
    data.trainingData.split('\n\n').forEach((para) => {
      if (para.trim()) {
        sections.push(createParagraph(para.trim()));
      }
    });

    const sectionAttachments = attachments.filter((a) => a.section === 'TRAINING_DATA');
    if (sectionAttachments.length > 0) {
      sections.push(createHeading2('Supporting Documentation'));
      sectionAttachments.forEach((att) => {
        sections.push(createBulletPoint(`${att.fileName} ${att.description ? `- ${att.description}` : ''}`));
      });
    }
  }

  // Section 5: Model Performance
  if (data.modelPerformance) {
    sections.push(createHeading1(getSectionTitle('MODEL_PERFORMANCE')));
    sections.push(createHeading2('Regulatory Reference'));
    sections.push(createParagraph('EU AI Act Article 15 - Accuracy, robustness, and cybersecurity'));
    sections.push(createHeading2('Performance Metrics'));
    data.modelPerformance.split('\n\n').forEach((para) => {
      if (para.trim()) {
        sections.push(createParagraph(para.trim()));
      }
    });

    const sectionAttachments = attachments.filter((a) => a.section === 'MODEL_PERFORMANCE');
    if (sectionAttachments.length > 0) {
      sections.push(createHeading2('Supporting Documentation'));
      sectionAttachments.forEach((att) => {
        sections.push(createBulletPoint(`${att.fileName} ${att.description ? `- ${att.description}` : ''}`));
      });
    }
  }

  // Section 6: Validation and Testing
  if (data.validationTesting) {
    sections.push(createHeading1(getSectionTitle('VALIDATION_TESTING')));
    sections.push(createHeading2('Regulatory Reference'));
    sections.push(createParagraph('EU AI Act Article 9(2) - Risk management system, testing'));
    sections.push(createHeading2('Testing Procedures'));
    data.validationTesting.split('\n\n').forEach((para) => {
      if (para.trim()) {
        sections.push(createParagraph(para.trim()));
      }
    });

    const sectionAttachments = attachments.filter((a) => a.section === 'VALIDATION_TESTING');
    if (sectionAttachments.length > 0) {
      sections.push(createHeading2('Supporting Documentation'));
      sectionAttachments.forEach((att) => {
        sections.push(createBulletPoint(`${att.fileName} ${att.description ? `- ${att.description}` : ''}`));
      });
    }
  }

  // Section 7: Human Oversight
  if (data.humanOversightDoc) {
    sections.push(createHeading1(getSectionTitle('HUMAN_OVERSIGHT')));
    sections.push(createHeading2('Regulatory Reference'));
    sections.push(createParagraph('EU AI Act Article 14 - Human oversight'));
    sections.push(createHeading2('Oversight Mechanisms'));
    data.humanOversightDoc.split('\n\n').forEach((para) => {
      if (para.trim()) {
        sections.push(createParagraph(para.trim()));
      }
    });

    const sectionAttachments = attachments.filter((a) => a.section === 'HUMAN_OVERSIGHT');
    if (sectionAttachments.length > 0) {
      sections.push(createHeading2('Supporting Documentation'));
      sectionAttachments.forEach((att) => {
        sections.push(createBulletPoint(`${att.fileName} ${att.description ? `- ${att.description}` : ''}`));
      });
    }
  }

  // Section 8: Cybersecurity
  if (data.cybersecurity) {
    sections.push(createHeading1(getSectionTitle('CYBERSECURITY')));
    sections.push(createHeading2('Regulatory Reference'));
    sections.push(createParagraph('EU AI Act Article 15 - Accuracy, robustness, and cybersecurity'));
    sections.push(createHeading2('Security Measures'));
    data.cybersecurity.split('\n\n').forEach((para) => {
      if (para.trim()) {
        sections.push(createParagraph(para.trim()));
      }
    });

    const sectionAttachments = attachments.filter((a) => a.section === 'CYBERSECURITY');
    if (sectionAttachments.length > 0) {
      sections.push(createHeading2('Supporting Documentation'));
      sectionAttachments.forEach((att) => {
        sections.push(createBulletPoint(`${att.fileName} ${att.description ? `- ${att.description}` : ''}`));
      });
    }
  }

  // Conclusion
  sections.push(createHeading1('Conclusion'));
  aiGenerated.conclusion.split('\n\n').forEach((para) => {
    if (para.trim()) {
      sections.push(createParagraph(para.trim()));
    }
  });

  // Version Notes
  if (data.versionNotes) {
    sections.push(createHeading1('Version Notes'));
    sections.push(createParagraph(data.versionNotes));
  }

  // Footer
  sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  sections.push(createParagraph('---'));
  sections.push(
    createParagraph(
      `This technical documentation was generated by the EU AI Act Implementation Lab on ${new Date().toLocaleDateString()}.`,
      { italic: true, color: COLORS.SECONDARY }
    )
  );
  sections.push(
    createParagraph('Confidential - For audit and compliance purposes only.', {
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

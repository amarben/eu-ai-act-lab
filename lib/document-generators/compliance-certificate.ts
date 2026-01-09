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
import { generateCertificationNarrative, isGeminiConfigured } from '@/lib/gemini';
import {
  validateCertificationReadiness,
  type CertificationValidationResult,
} from '@/lib/certification-validator';

interface ComplianceCertificateData {
  aiSystem: {
    id: string;
    name: string;
    businessPurpose: string;
    riskCategory: string;
    organizationName: string;
  };
  validationResult: CertificationValidationResult;
  harmonizedStandards?: string[];
}

// Document styling constants
const COLORS = {
  PRIMARY: '1E40AF', // Blue 800
  SECONDARY: '6B7280', // Gray 500
  SUCCESS: '10B981', // Green 500
  WARNING: 'F59E0B', // Amber 500
  DANGER: 'EF4444', // Red 500
  GOLD: 'D97706', // Amber 600
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
        size: 28,
        color: COLORS.SECONDARY,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
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

function createParagraph(
  text: string,
  options: { bold?: boolean; indent?: number; alignment?: AlignmentType; size?: number } = {}
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options.bold,
        size: options.size,
      }),
    ],
    spacing: { after: 120 },
    indent: options.indent ? { left: convertInchesToTwip(options.indent) } : undefined,
    alignment: options.alignment,
  });
}

function createBulletPoint(text: string): Paragraph {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 120 },
  });
}

function createDocumentControlTable(data: {
  documentId: string;
  version: string;
  issueDate: Date;
  validUntil: Date;
}): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Document ID:', bold: true })],
              }),
            ],
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: data.documentId })],
            width: { size: 70, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Version:', bold: true })],
              }),
            ],
          }),
          new TableCell({
            children: [new Paragraph({ text: data.version })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Issue Date:', bold: true })],
              }),
            ],
          }),
          new TableCell({
            children: [new Paragraph({ text: data.issueDate.toLocaleDateString() })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Valid Until:', bold: true })],
              }),
            ],
          }),
          new TableCell({
            children: [new Paragraph({ text: data.validUntil.toLocaleDateString() })],
          }),
        ],
      }),
    ],
  });
}

function createCertificationMetricsTable(result: CertificationValidationResult): Table {
  const { details } = result;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
    rows: [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Compliance Area', bold: true })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: { fill: 'E5E7EB' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Status', bold: true })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'E5E7EB' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Score', bold: true })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'E5E7EB' },
          }),
        ],
      }),
      // Gap Assessment row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Gap Assessment (Article 9)' })],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: details.gapAssessment.percentComplete >= 95 ? '✓ Compliant' : '⚠ Needs Work',
                    color:
                      details.gapAssessment.percentComplete >= 95 ? COLORS.SUCCESS : COLORS.WARNING,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: `${Math.round(details.gapAssessment.percentComplete)}%`,
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
      // Technical Documentation row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Technical Documentation (Article 11)' })],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text:
                      details.technicalDocumentation.completeness === 100
                        ? '✓ Compliant'
                        : '⚠ Needs Work',
                    color:
                      details.technicalDocumentation.completeness === 100
                        ? COLORS.SUCCESS
                        : COLORS.WARNING,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: `${details.technicalDocumentation.completeness}%`,
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
      // Risk Management row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Risk Management (Article 9)' })],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text:
                      details.riskManagement.highRisksUnmitigated === 0 &&
                      details.riskManagement.criticalRisksUnmitigated === 0
                        ? '✓ Compliant'
                        : '⚠ Needs Work',
                    color:
                      details.riskManagement.highRisksUnmitigated === 0 &&
                      details.riskManagement.criticalRisksUnmitigated === 0
                        ? COLORS.SUCCESS
                        : COLORS.WARNING,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: `${details.riskManagement.totalRisks - details.riskManagement.highRisksUnmitigated - details.riskManagement.criticalRisksUnmitigated}/${details.riskManagement.totalRisks} mitigated`,
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
      // Governance row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Governance Structure (Article 17)' })],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: details.governance.hasRequiredRoles ? '✓ Compliant' : '⚠ Needs Work',
                    color: details.governance.hasRequiredRoles ? COLORS.SUCCESS : COLORS.WARNING,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: `${details.governance.rolesCount} roles`,
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
      // Overall Score row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Overall Compliance Score', bold: true })],
              }),
            ],
            shading: { fill: 'F3F4F6' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: result.ready ? '✓ CERTIFIED' : '⚠ NOT READY',
                    bold: true,
                    color: result.ready ? COLORS.SUCCESS : COLORS.WARNING,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { fill: 'F3F4F6' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${result.score}%`,
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { fill: 'F3F4F6' },
          }),
        ],
      }),
    ],
  });
}

export async function generateComplianceCertificate(
  data: ComplianceCertificateData
): Promise<Buffer> {
  const { aiSystem, validationResult, harmonizedStandards = [] } = data;
  const certificationDate = new Date();
  const validUntil = new Date(certificationDate);
  validUntil.setFullYear(validUntil.getFullYear() + 1); // Valid for 1 year

  // Generate AI content if available and system is ready
  let certificationNarrative = '';

  if (validationResult.ready && isGeminiConfigured()) {
    try {
      certificationNarrative = await generateCertificationNarrative({
        systemName: aiSystem.name,
        riskCategory: aiSystem.riskCategory,
        organizationName: aiSystem.organizationName,
        complianceScore: validationResult.score,
        gapAssessmentScore: validationResult.details.gapAssessment.percentComplete,
        technicalDocsCompleteness: validationResult.details.technicalDocumentation.completeness,
        risksCount: validationResult.details.riskManagement.totalRisks,
        mitigatedRisksCount:
          validationResult.details.riskManagement.totalRisks -
          validationResult.details.riskManagement.highRisksUnmitigated -
          validationResult.details.riskManagement.criticalRisksUnmitigated,
        governanceRolesCount: validationResult.details.governance.rolesCount,
        harmonizedStandards: harmonizedStandards,
        certificationDate,
      });
    } catch (error) {
      console.error('Failed to generate AI certification narrative:', error);
      certificationNarrative = '';
    }
  }

  // Build document sections
  const sections: Paragraph[] = [];

  // Cover page - Formal certificate header
  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          color: COLORS.GOLD,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'EU AI ACT COMPLIANCE CERTIFICATE',
          bold: true,
          size: 36,
          color: COLORS.PRIMARY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  sections.push(
    createSubtitle('Declaration of Conformity - Regulation (EU) 2024/1689')
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          color: COLORS.GOLD,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Certificate status banner
  if (validationResult.ready) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '✓ CERTIFIED COMPLIANT',
            bold: true,
            size: 32,
            color: COLORS.SUCCESS,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  } else {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '⚠ COMPLIANCE IN PROGRESS',
            bold: true,
            size: 32,
            color: COLORS.WARNING,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // AI System Identification
  sections.push(createHeading1('AI System Identification'));
  sections.push(createBulletPoint(`AI System Name: ${aiSystem.name}`));
  sections.push(createBulletPoint(`Organization: ${aiSystem.organizationName}`));
  sections.push(createBulletPoint(`Risk Classification: ${aiSystem.riskCategory}`));
  sections.push(createBulletPoint(`Business Purpose: ${aiSystem.businessPurpose}`));
  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Document Control Information
  sections.push(createHeading1('Document Control'));
  sections.push(
    createDocumentControlTable({
      documentId: `EU-AI-CERT-${aiSystem.id.substring(0, 8).toUpperCase()}`,
      version: '1.0',
      issueDate: certificationDate,
      validUntil: validUntil,
    })
  );
  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Compliance Assessment Summary
  sections.push(createHeading1('Compliance Assessment Summary'));
  sections.push(
    createParagraph(
      `Overall Compliance Score: ${validationResult.score}%`,
      { bold: true, size: 28 }
    )
  );
  sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  sections.push(createCertificationMetricsTable(validationResult));
  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Certification Narrative (AI-Generated)
  if (certificationNarrative && validationResult.ready) {
    sections.push(createHeading1('Declaration of Conformity'));
    sections.push(
      createParagraph(
        'Pursuant to Article 48 of Regulation (EU) 2024/1689 (EU AI Act)',
        { bold: true }
      )
    );
    sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));

    certificationNarrative.split('\n\n').forEach((para) => {
      if (para.trim()) {
        sections.push(createParagraph(para.trim()));
      }
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Detailed Compliance Breakdown
  sections.push(createHeading1('Detailed Compliance Breakdown'));

  // Gap Assessment Details
  sections.push(createHeading2('1. Gap Assessment (Article 9 Requirements)'));
  sections.push(
    createParagraph(
      `Implementation Status: ${validationResult.details.gapAssessment.implementedCount} of ${validationResult.details.gapAssessment.totalCount} requirements (${Math.round(validationResult.details.gapAssessment.percentComplete)}%)`
    )
  );
  if (validationResult.details.gapAssessment.percentComplete >= 95) {
    sections.push(createParagraph('✓ Meets certification threshold (≥95%)', { bold: true }));
  } else {
    sections.push(
      createParagraph(
        `⚠ Below certification threshold. Implement ${Math.ceil(validationResult.details.gapAssessment.totalCount * 0.95 - validationResult.details.gapAssessment.implementedCount)} more requirement(s) to reach 95%.`,
        { bold: true }
      )
    );
  }
  sections.push(new Paragraph({ text: '', spacing: { after: 150 } }));

  // Technical Documentation Details
  sections.push(createHeading2('2. Technical Documentation (Article 11)'));
  sections.push(
    createParagraph(
      `Completeness: ${validationResult.details.technicalDocumentation.completeness}%`
    )
  );
  if (validationResult.details.technicalDocumentation.completeness === 100) {
    sections.push(createParagraph('✓ All 8 required sections complete', { bold: true }));
  } else {
    sections.push(
      createParagraph(
        `⚠ Missing sections: ${validationResult.details.technicalDocumentation.missingSections.join(', ')}`,
        { bold: true }
      )
    );
  }
  sections.push(new Paragraph({ text: '', spacing: { after: 150 } }));

  // Risk Management Details
  sections.push(createHeading2('3. Risk Management System (Article 9)'));
  sections.push(
    createParagraph(`Total Risks Identified: ${validationResult.details.riskManagement.totalRisks}`)
  );
  sections.push(
    createParagraph(
      `High Risks Unmitigated: ${validationResult.details.riskManagement.highRisksUnmitigated}`
    )
  );
  sections.push(
    createParagraph(
      `Critical Risks Unmitigated: ${validationResult.details.riskManagement.criticalRisksUnmitigated}`
    )
  );
  if (
    validationResult.details.riskManagement.highRisksUnmitigated === 0 &&
    validationResult.details.riskManagement.criticalRisksUnmitigated === 0
  ) {
    sections.push(
      createParagraph('✓ All HIGH and CRITICAL risks mitigated or accepted', { bold: true })
    );
  } else {
    sections.push(
      createParagraph('⚠ Outstanding HIGH or CRITICAL risks require mitigation', { bold: true })
    );
  }
  sections.push(new Paragraph({ text: '', spacing: { after: 150 } }));

  // Governance Details
  sections.push(createHeading2('4. Governance Structure (Article 17)'));
  sections.push(
    createParagraph(`Assigned Roles: ${validationResult.details.governance.rolesCount}`)
  );
  if (validationResult.details.governance.hasRequiredRoles) {
    sections.push(
      createParagraph(
        '✓ All required roles assigned (System Owner, Risk Owner, Compliance Officer)',
        { bold: true }
      )
    );
  } else {
    sections.push(
      createParagraph(
        `⚠ Missing required roles: ${validationResult.details.governance.missingRoles.join(', ')}`,
        { bold: true }
      )
    );
  }
  sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Harmonized Standards
  if (harmonizedStandards.length > 0) {
    sections.push(createHeading1('Harmonized Standards Applied'));
    harmonizedStandards.forEach((standard) => {
      sections.push(createBulletPoint(standard));
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Outstanding Items (if not ready)
  if (!validationResult.ready && validationResult.missingItems.length > 0) {
    sections.push(createHeading1('Outstanding Compliance Items'));
    sections.push(
      createParagraph(
        'The following items must be addressed to achieve certification:',
        { bold: true }
      )
    );
    validationResult.missingItems.forEach((item, index) => {
      sections.push(createParagraph(`${index + 1}. ${item}`, { indent: 0.3 }));
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Warnings
  if (validationResult.warnings.length > 0) {
    sections.push(createHeading1('Advisory Notices'));
    validationResult.warnings.forEach((warning) => {
      sections.push(createBulletPoint(warning));
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Certification Statement (only if ready)
  if (validationResult.ready) {
    sections.push(createHeading1('Certification Statement'));
    sections.push(
      createParagraph(
        `This certificate confirms that the AI system "${aiSystem.name}" operated by ${aiSystem.organizationName} has demonstrated conformity with the applicable requirements of Regulation (EU) 2024/1689 (EU Artificial Intelligence Act) as a ${aiSystem.riskCategory} AI system.`,
        { bold: true }
      )
    );
    sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    sections.push(
      createParagraph(
        'This certification is valid for one year from the issue date and is subject to ongoing monitoring and periodic reassessment as required by Article 61 of the EU AI Act.'
      )
    );
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Footer
  sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  sections.push(createParagraph('───────────────────────────────────────'));
  sections.push(
    createParagraph(
      `This ${validationResult.ready ? 'certificate' : 'compliance assessment report'} was generated by the EU AI Act Implementation Lab`,
      { alignment: AlignmentType.CENTER }
    )
  );
  sections.push(
    createParagraph(
      `Generated: ${certificationDate.toLocaleDateString()} at ${certificationDate.toLocaleTimeString()}`,
      { alignment: AlignmentType.CENTER }
    )
  );
  sections.push(
    createParagraph(
      'For audit, compliance, and regulatory purposes',
      { alignment: AlignmentType.CENTER }
    )
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

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError, AppError } from '@/lib/errors';
import { validateCertificationReadiness } from '@/lib/certification-validator';
import { generateComplianceCertificate } from '@/lib/document-generators/compliance-certificate';
import { convertDocument } from '@/lib/pdf-converter';

/**
 * GET /api/certification/[systemId]/export
 * Export EU AI Act compliance certificate as PDF or DOCX
 *
 * Query params:
 * - format: 'pdf' (default) or 'docx'
 * - allowDraft: 'true' to export even if not fully ready (default: false)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { systemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const systemId = params.systemId;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf'; // pdf or docx
    const allowDraft = searchParams.get('allowDraft') === 'true'; // Allow export of non-ready systems

    // Fetch AI system with organization data and risk classification
    const aiSystem = await prisma.aISystem.findFirst({
      where: {
        id: systemId,
        organizationId: session.user.organizationId,
      },
      include: {
        organization: {
          select: {
            name: true,
            industry: true,
          },
        },
        riskClassification: {
          select: {
            category: true,
          },
        },
      },
    });

    if (!aiSystem) {
      throw new ValidationError('AI system not found');
    }

    // Validate certification readiness
    const validationResult = await validateCertificationReadiness(systemId);

    // Block export if not ready (unless allowDraft is true)
    if (!validationResult.ready && !allowDraft) {
      throw new ValidationError(
        'AI system is not ready for certification. Complete all requirements first. ' +
        `Missing items: ${validationResult.missingItems.join('; ')}`
      );
    }

    // Get harmonized standards from organization or system metadata
    // For now, we'll use common EU AI Act harmonized standards
    const harmonizedStandards = [
      'ISO/IEC 42001:2023 - AI Management System',
      'ISO/IEC 23894:2023 - AI Risk Management',
      'ISO/IEC 27001:2022 - Information Security Management',
      'ISO/IEC 27701:2019 - Privacy Information Management',
    ];

    // Generate compliance certificate
    const docxBuffer = await generateComplianceCertificate({
      aiSystem: {
        id: aiSystem.id,
        name: aiSystem.name,
        businessPurpose: aiSystem.businessPurpose,
        riskCategory: aiSystem.riskClassification?.category || 'UNKNOWN',
        organizationName: aiSystem.organization.name,
      },
      validationResult,
      harmonizedStandards,
    });

    // Convert to requested format
    const { buffer, extension, mimeType } = await convertDocument(
      docxBuffer,
      `EU_AI_Act_Certificate_${aiSystem.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      format === 'pdf'
    );

    // Generate safe filename
    const systemName = aiSystem.name.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const certificateType = validationResult.ready ? 'Certificate' : 'Assessment';
    const filename = `EU_AI_Act_${certificateType}_${systemName}_${date}.${extension}`;

    // Return document as downloadable file
    return new NextResponse(new Uint8Array(buffer), {
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

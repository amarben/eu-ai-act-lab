import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { generateGapAssessmentReport } from '@/lib/document-generators/gap-assessment-report';
import { convertDocument } from '@/lib/pdf-converter';

/**
 * GET /api/gap-assessment/[id]/export
 * Export gap assessment as Word document (.docx) or PDF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const assessmentId = params.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf'; // pdf or docx

    // Fetch gap assessment with all related data
    const gapAssessment = await prisma.gapAssessment.findFirst({
      where: {
        id: assessmentId,
        aiSystem: {
          organizationId: session.user.organizationId,
        },
      },
      include: {
        aiSystem: {
          select: {
            id: true,
            name: true,
            businessPurpose: true,
            deploymentStatus: true,
          },
        },
        requirements: {
          include: {
            evidence: {
              select: {
                id: true,
                type: true,
                title: true,
                description: true,
                fileUrl: true,
                linkUrl: true,
                textContent: true,
              },
            },
          },
          orderBy: {
            category: 'asc',
          },
        },
      },
    });

    if (!gapAssessment) {
      throw new ValidationError('Gap assessment not found');
    }

    // Generate Word document
    const docxBuffer = await generateGapAssessmentReport(gapAssessment as any);

    // Convert to requested format
    const { buffer, extension, mimeType } = await convertDocument(
      docxBuffer,
      `Gap_Assessment_${gapAssessment.aiSystem.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      format === 'pdf'
    );

    // Generate safe filename
    const systemName = gapAssessment.aiSystem.name.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const filename = `Gap_Assessment_${systemName}_${date}.${extension}`;

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

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { generateTechnicalDocumentationReport } from '@/lib/document-generators/technical-documentation-report';
import { convertDocument } from '@/lib/pdf-converter';

/**
 * GET /api/technical-documentation/[id]/export
 * Export technical documentation as Word document (.docx) or PDF
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

    const documentationId = params.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf'; // pdf or docx

    // Fetch technical documentation with all related data
    const documentation = await prisma.technicalDocumentation.findFirst({
      where: {
        id: documentationId,
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
            dataCategories: true,
            userTypes: true,
          },
        },
        attachments: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    });

    if (!documentation) {
      throw new ValidationError('Technical documentation not found');
    }

    // Generate Word document
    const docxBuffer = await generateTechnicalDocumentationReport(documentation as any);

    // Convert to requested format
    const { buffer, extension, mimeType } = await convertDocument(
      docxBuffer,
      `Technical_Documentation_${documentation.aiSystem.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      format === 'pdf'
    );

    // Generate safe filename
    const systemName = documentation.aiSystem.name.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const filename = `Technical_Documentation_${systemName}_v${documentation.version}_${date}.${extension}`;

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

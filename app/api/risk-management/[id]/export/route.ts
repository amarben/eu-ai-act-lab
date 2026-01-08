import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { generateRiskRegisterReport } from '@/lib/document-generators/risk-register-report';
import { convertDocument } from '@/lib/pdf-converter';

/**
 * GET /api/risk-management/[id]/export
 * Export risk register as Word document (.docx) or PDF
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

    const riskRegisterId = params.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf'; // pdf or docx

    // Fetch risk register with all related data
    const riskRegister = await prisma.aIRiskRegister.findFirst({
      where: {
        id: riskRegisterId,
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
        risks: {
          include: {
            mitigationActions: {
              orderBy: {
                createdAt: 'asc',
              },
            },
            humanOversight: true,
          },
          orderBy: {
            inherentRiskScore: 'desc',
          },
        },
      },
    });

    if (!riskRegister) {
      throw new ValidationError('Risk register not found');
    }

    // Generate Word document
    const docxBuffer = await generateRiskRegisterReport(riskRegister as any);

    // Convert to requested format
    const { buffer, extension, mimeType } = await convertDocument(
      docxBuffer,
      `Risk_Register_${riskRegister.aiSystem.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      format === 'pdf'
    );

    // Generate safe filename
    const systemName = riskRegister.aiSystem.name.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const filename = `Risk_Register_${systemName}_${date}.${extension}`;

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

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { validateCertificationReadiness } from '@/lib/certification-validator';

/**
 * GET /api/certification/[systemId]/readiness
 * Check if an AI system is ready for EU AI Act certification
 * Returns validation result with detailed compliance breakdown
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

    // Verify system belongs to user's organization
    const aiSystem = await prisma.aISystem.findFirst({
      where: {
        id: systemId,
        organizationId: session.user.organizationId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!aiSystem) {
      throw new ValidationError('AI system not found');
    }

    // Validate certification readiness
    const validationResult = await validateCertificationReadiness(systemId);

    // Return validation result
    return NextResponse.json({
      success: true,
      data: {
        systemId: aiSystem.id,
        systemName: aiSystem.name,
        ...validationResult,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

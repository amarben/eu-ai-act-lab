import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiSystemSchema } from '@/lib/validations/ai-system';
import { successResponse, errorResponse, createdResponse } from '@/lib/api-response';
import { ValidationError, AuthenticationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new AuthenticationError();
    }

    const systems = await prisma.aISystem.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        riskClassification: {
          select: { category: true },
        },
        gapAssessment: {
          select: { overallStatus: true, overallScore: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(systems);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId || !session?.user?.id) {
      throw new AuthenticationError();
    }

    const body = await request.json();

    // Validate input
    const validation = aiSystemSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        'Validation failed',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validation.data;

    // Create AI system
    const system = await prisma.aISystem.create({
      data: {
        name: data.name,
        businessPurpose: data.businessPurpose,
        primaryUsers: data.primaryUsers,
        deploymentStatus: data.deploymentStatus,
        dataCategories: data.dataProcessed || [], // Map dataProcessed to dataCategories
        organizationId: session.user.organizationId,
      },
    });

    return createdResponse(system);
  } catch (error) {
    return errorResponse(error);
  }
}

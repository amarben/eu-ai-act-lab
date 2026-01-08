import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { z } from 'zod';

const riskClassificationSchema = z.object({
  aiSystemId: z.string(),
  category: z.enum(['PROHIBITED', 'HIGH_RISK', 'LIMITED_RISK', 'MINIMAL_RISK']),
  prohibitedPractices: z.array(z.string()),
  highRiskCategories: z.array(z.string()),
  interactsWithPersons: z.boolean(),
  reasoning: z.string().min(50),
  applicableRequirements: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();

    // Validate input
    const validation = riskClassificationSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        'Validation failed',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const {
      aiSystemId,
      category,
      prohibitedPractices,
      highRiskCategories,
      interactsWithPersons,
      reasoning,
      applicableRequirements,
    } = validation.data;

    // Verify the AI system belongs to the user's organization
    const aiSystem = await prisma.aISystem.findFirst({
      where: {
        id: aiSystemId,
        organizationId: session.user.organizationId,
      },
    });

    if (!aiSystem) {
      throw new ValidationError('AI system not found or access denied');
    }

    // Check if classification already exists
    const existingClassification = await prisma.riskClassification.findUnique({
      where: { aiSystemId },
    });

    if (existingClassification) {
      throw new ValidationError('This AI system already has a risk classification');
    }

    // Create risk classification
    const classification = await prisma.riskClassification.create({
      data: {
        aiSystemId,
        category,
        prohibitedPractices,
        highRiskCategories,
        interactsWithPersons,
        reasoning,
        applicableRequirements,
        classificationDate: new Date(),
      },
      include: {
        aiSystem: {
          select: {
            name: true,
          },
        },
      },
    });

    return successResponse(
      {
        message: 'Risk classification created successfully',
        classification,
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const { searchParams } = new URL(request.url);
    const aiSystemId = searchParams.get('aiSystemId');

    if (aiSystemId) {
      // Get specific classification
      const classification = await prisma.riskClassification.findFirst({
        where: {
          aiSystemId,
          aiSystem: {
            organizationId: session.user.organizationId,
          },
        },
        include: {
          aiSystem: {
            select: {
              name: true,
              businessPurpose: true,
              deploymentStatus: true,
            },
          },
        },
      });

      if (!classification) {
        throw new ValidationError('Risk classification not found');
      }

      return successResponse({ classification });
    }

    // Get all classifications for the organization
    const classifications = await prisma.riskClassification.findMany({
      where: {
        aiSystem: {
          organizationId: session.user.organizationId,
        },
      },
      include: {
        aiSystem: {
          select: {
            name: true,
            deploymentStatus: true,
          },
        },
      },
      orderBy: {
        classificationDate: 'desc',
      },
    });

    return successResponse({ classifications });
  } catch (error) {
    return errorResponse(error);
  }
}

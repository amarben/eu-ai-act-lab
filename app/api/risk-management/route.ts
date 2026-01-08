import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { z } from 'zod';

const riskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['BIAS', 'SAFETY', 'MISUSE', 'TRANSPARENCY', 'PRIVACY', 'CYBERSECURITY', 'OTHER']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  affectedStakeholders: z.array(z.string()),
  potentialImpact: z.string().min(10, 'Potential impact must be at least 10 characters'),
  likelihood: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
});

const riskRegisterSchema = z.object({
  aiSystemId: z.string(),
  risks: z.array(riskSchema).min(1, 'At least one risk is required'),
});

/**
 * POST /api/risk-management
 * Create a new risk register for an AI system
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();

    // Validate input
    const validation = riskRegisterSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        'Validation failed',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { aiSystemId, risks } = validation.data;

    // Verify the AI system belongs to the user's organization
    const aiSystem = await prisma.aISystem.findFirst({
      where: {
        id: aiSystemId,
        organizationId: session.user.organizationId,
      },
      include: {
        riskClassification: true,
      },
    });

    if (!aiSystem) {
      throw new ValidationError('AI system not found or access denied');
    }

    // Check if risk register already exists
    const existingRegister = await prisma.aIRiskRegister.findUnique({
      where: { aiSystemId },
    });

    if (existingRegister) {
      throw new ValidationError('This AI system already has a risk register');
    }

    // Calculate risk levels based on likelihood × impact
    const processedRisks = risks.map((risk) => {
      const inherentRiskScore = risk.likelihood * risk.impact;
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';

      if (inherentRiskScore <= 6) {
        riskLevel = 'LOW';
      } else if (inherentRiskScore <= 15) {
        riskLevel = 'MEDIUM';
      } else {
        riskLevel = 'HIGH';
      }

      return {
        ...risk,
        inherentRiskScore,
        riskLevel,
        createdBy: session.user.id!,
      };
    });

    // Create risk register with risks
    const riskRegister = await prisma.aIRiskRegister.create({
      data: {
        aiSystemId,
        assessedBy: session.user.id!,
        risks: {
          create: processedRisks,
        },
      },
      include: {
        aiSystem: {
          select: {
            name: true,
          },
        },
        risks: {
          orderBy: {
            inherentRiskScore: 'desc',
          },
        },
      },
    });

    return successResponse(
      {
        message: 'Risk register created successfully',
        riskRegister,
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * GET /api/risk-management
 * Get risk register(s) for an AI system or all systems in organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const { searchParams } = new URL(request.url);
    const aiSystemId = searchParams.get('aiSystemId');
    const registerId = searchParams.get('id');

    if (registerId) {
      // Get specific risk register by ID
      const riskRegister = await prisma.aIRiskRegister.findFirst({
        where: {
          id: registerId,
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
            orderBy: {
              inherentRiskScore: 'desc',
            },
            include: {
              mitigationActions: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
              humanOversight: true,
            },
          },
        },
      });

      if (!riskRegister) {
        throw new ValidationError('Risk register not found');
      }

      return successResponse({ riskRegister });
    }

    if (aiSystemId) {
      // Get risk register for specific AI system
      const riskRegister = await prisma.aIRiskRegister.findFirst({
        where: {
          aiSystemId,
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
            orderBy: {
              inherentRiskScore: 'desc',
            },
            include: {
              mitigationActions: true,
              humanOversight: true,
            },
          },
        },
      });

      if (!riskRegister) {
        throw new ValidationError('Risk register not found for this AI system');
      }

      return successResponse({ riskRegister });
    }

    // Get all risk registers for the organization
    const riskRegisters = await prisma.aIRiskRegister.findMany({
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
        risks: {
          select: {
            riskLevel: true,
            treatmentDecision: true,
          },
        },
      },
      orderBy: {
        lastAssessedDate: 'desc',
      },
    });

    return successResponse({ riskRegisters });
  } catch (error) {
    return errorResponse(error);
  }
}

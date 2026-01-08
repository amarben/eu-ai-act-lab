import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { z } from 'zod';

const requirementAssessmentSchema = z.object({
  category: z.enum([
    'RISK_MANAGEMENT',
    'DATA_GOVERNANCE',
    'TECHNICAL_DOCUMENTATION',
    'RECORD_KEEPING',
    'TRANSPARENCY',
    'HUMAN_OVERSIGHT',
    'ACCURACY_ROBUSTNESS',
    'CYBERSECURITY',
  ]),
  title: z.string().min(3),
  description: z.string().min(10),
  regulatoryReference: z.string().min(3),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'IMPLEMENTED', 'NOT_APPLICABLE']).default('NOT_STARTED'),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(), // ISO date string
});

const gapAssessmentSchema = z.object({
  aiSystemId: z.string(),
  requirements: z.array(requirementAssessmentSchema),
});

const updateRequirementSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'IMPLEMENTED', 'NOT_APPLICABLE']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

/**
 * POST /api/gap-assessment
 * Create a new gap assessment for an AI system
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();

    // Validate input
    const validation = gapAssessmentSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        'Validation failed',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { aiSystemId, requirements } = validation.data;

    // Verify the AI system belongs to the user's organization and has a HIGH_RISK classification
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

    if (aiSystem.riskClassification?.category !== 'HIGH_RISK') {
      throw new ValidationError('Gap assessment is only available for high-risk AI systems');
    }

    // Check if gap assessment already exists
    const existingAssessment = await prisma.gapAssessment.findUnique({
      where: { aiSystemId },
    });

    if (existingAssessment) {
      throw new ValidationError('This AI system already has a gap assessment');
    }

    // Calculate initial overall score (0-100)
    const overallScore = 0;

    // Create gap assessment with requirements
    const gapAssessment = await prisma.gapAssessment.create({
      data: {
        aiSystemId,
        overallScore,
        requirements: {
          create: requirements.map((req) => ({
            ...req,
            dueDate: req.dueDate ? new Date(req.dueDate) : null,
            updatedBy: session.user.id!,
          })),
        },
      },
      include: {
        aiSystem: {
          select: {
            name: true,
          },
        },
        requirements: {
          orderBy: {
            category: 'asc',
          },
        },
      },
    });

    return successResponse(
      {
        message: 'Gap assessment created successfully',
        gapAssessment,
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * GET /api/gap-assessment
 * Get gap assessment(s) for an AI system or all systems in organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const { searchParams } = new URL(request.url);
    const aiSystemId = searchParams.get('aiSystemId');
    const assessmentId = searchParams.get('id');

    if (assessmentId) {
      // Get specific gap assessment by ID
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
            orderBy: {
              category: 'asc',
            },
            include: {
              evidence: true,
            },
          },
        },
      });

      if (!gapAssessment) {
        throw new ValidationError('Gap assessment not found');
      }

      return successResponse({ gapAssessment });
    }

    if (aiSystemId) {
      // Get gap assessment for specific AI system
      const gapAssessment = await prisma.gapAssessment.findFirst({
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
          requirements: {
            orderBy: {
              category: 'asc',
            },
            include: {
              evidence: true,
            },
          },
        },
      });

      if (!gapAssessment) {
        throw new ValidationError('Gap assessment not found for this AI system');
      }

      return successResponse({ gapAssessment });
    }

    // Get all gap assessments for the organization
    const gapAssessments = await prisma.gapAssessment.findMany({
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
        requirements: {
          select: {
            status: true,
            priority: true,
          },
        },
      },
      orderBy: {
        lastAssessedDate: 'desc',
      },
    });

    return successResponse({ gapAssessments });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/gap-assessment
 * Update an existing gap assessment or requirement
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();
    const { assessmentId, requirementId, ...updateData } = body;

    if (requirementId) {
      // Update a specific requirement
      const validation = updateRequirementSchema.safeParse(updateData);
      if (!validation.success) {
        throw new ValidationError(
          'Validation failed',
          validation.error.flatten().fieldErrors as Record<string, string[]>
        );
      }

      // Verify the requirement belongs to the user's organization
      const requirement = await prisma.requirementAssessment.findFirst({
        where: {
          id: requirementId,
          gapAssessment: {
            aiSystem: {
              organizationId: session.user.organizationId,
            },
          },
        },
        include: {
          gapAssessment: true,
        },
      });

      if (!requirement) {
        throw new ValidationError('Requirement not found or access denied');
      }

      // Update the requirement
      const updatedRequirement = await prisma.requirementAssessment.update({
        where: { id: requirementId },
        data: {
          ...validation.data,
          dueDate: validation.data.dueDate ? new Date(validation.data.dueDate) : undefined,
          updatedBy: session.user.id!,
        },
      });

      // Recalculate overall score
      const allRequirements = await prisma.requirementAssessment.findMany({
        where: { gapAssessmentId: requirement.gapAssessmentId },
      });

      const implementedCount = allRequirements.filter((r) => r.status === 'IMPLEMENTED').length;
      const totalCount = allRequirements.filter((r) => r.status !== 'NOT_APPLICABLE').length;
      const overallScore = totalCount > 0 ? (implementedCount / totalCount) * 100 : 0;

      // Update gap assessment score and timestamp
      await prisma.gapAssessment.update({
        where: { id: requirement.gapAssessmentId },
        data: {
          overallScore,
          lastAssessedDate: new Date(),
        },
      });

      return successResponse({
        message: 'Requirement updated successfully',
        requirement: updatedRequirement,
        overallScore,
      });
    }

    throw new ValidationError('Either requirementId must be provided');
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { z } from 'zod';

const createRiskSchema = z.object({
  riskRegisterId: z.string(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['BIAS', 'SAFETY', 'MISUSE', 'TRANSPARENCY', 'PRIVACY', 'CYBERSECURITY', 'OTHER']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  affectedStakeholders: z.array(z.string()),
  potentialImpact: z.string().min(10, 'Potential impact must be at least 10 characters'),
  likelihood: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
});

const updateRiskSchema = z.object({
  title: z.string().min(3).optional(),
  type: z.enum(['BIAS', 'SAFETY', 'MISUSE', 'TRANSPARENCY', 'PRIVACY', 'CYBERSECURITY', 'OTHER']).optional(),
  description: z.string().min(10).optional(),
  affectedStakeholders: z.array(z.string()).optional(),
  potentialImpact: z.string().min(10).optional(),
  likelihood: z.number().min(1).max(5).optional(),
  impact: z.number().min(1).max(5).optional(),
  treatmentDecision: z.enum(['ACCEPT', 'MITIGATE', 'TRANSFER', 'AVOID']).optional(),
  treatmentJustification: z.string().optional(),
  residualLikelihood: z.number().min(1).max(5).optional(),
  residualImpact: z.number().min(1).max(5).optional(),
});

/**
 * POST /api/risks
 * Add a new risk to a risk register
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();

    // Validate input
    const validation = createRiskSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        'Validation failed',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { riskRegisterId, ...riskData } = validation.data;

    // Verify the risk register belongs to the user's organization
    const riskRegister = await prisma.aIRiskRegister.findFirst({
      where: {
        id: riskRegisterId,
        aiSystem: {
          organizationId: session.user.organizationId,
        },
      },
    });

    if (!riskRegister) {
      throw new ValidationError('Risk register not found or access denied');
    }

    // Calculate risk level
    const inherentRiskScore = riskData.likelihood * riskData.impact;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';

    if (inherentRiskScore <= 6) {
      riskLevel = 'LOW';
    } else if (inherentRiskScore <= 15) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'HIGH';
    }

    // Create the risk
    const risk = await prisma.risk.create({
      data: {
        ...riskData,
        riskRegisterId,
        inherentRiskScore,
        riskLevel,
        createdBy: session.user.id!,
      },
      include: {
        mitigationActions: true,
        humanOversight: true,
      },
    });

    // Update risk register timestamp
    await prisma.aIRiskRegister.update({
      where: { id: riskRegisterId },
      data: {
        lastAssessedDate: new Date(),
        assessedBy: session.user.id!,
      },
    });

    return successResponse(
      {
        message: 'Risk added successfully',
        risk,
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/risks
 * Update an existing risk
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();
    const { riskId, ...updateData } = body;

    if (!riskId) {
      throw new ValidationError('Risk ID is required');
    }

    // Validate input
    const validation = updateRiskSchema.safeParse(updateData);
    if (!validation.success) {
      throw new ValidationError(
        'Validation failed',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Verify the risk belongs to the user's organization
    const risk = await prisma.risk.findFirst({
      where: {
        id: riskId,
        riskRegister: {
          aiSystem: {
            organizationId: session.user.organizationId,
          },
        },
      },
    });

    if (!risk) {
      throw new ValidationError('Risk not found or access denied');
    }

    // Recalculate risk scores if likelihood or impact changed
    let updates: any = { ...validation.data };

    if (validation.data.likelihood !== undefined || validation.data.impact !== undefined) {
      const newLikelihood = validation.data.likelihood ?? risk.likelihood;
      const newImpact = validation.data.impact ?? risk.impact;
      const inherentRiskScore = newLikelihood * newImpact;

      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      if (inherentRiskScore <= 6) {
        riskLevel = 'LOW';
      } else if (inherentRiskScore <= 15) {
        riskLevel = 'MEDIUM';
      } else {
        riskLevel = 'HIGH';
      }

      updates.inherentRiskScore = inherentRiskScore;
      updates.riskLevel = riskLevel;
    }

    if (validation.data.residualLikelihood !== undefined && validation.data.residualImpact !== undefined) {
      updates.residualRiskScore = validation.data.residualLikelihood * validation.data.residualImpact;
    }

    // Update the risk
    const updatedRisk = await prisma.risk.update({
      where: { id: riskId },
      data: updates,
      include: {
        mitigationActions: true,
        humanOversight: true,
      },
    });

    // Update risk register timestamp
    await prisma.aIRiskRegister.update({
      where: { id: risk.riskRegisterId },
      data: {
        lastAssessedDate: new Date(),
        assessedBy: session.user.id!,
      },
    });

    return successResponse({
      message: 'Risk updated successfully',
      risk: updatedRisk,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/risks
 * Delete a risk
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const { searchParams } = new URL(request.url);
    const riskId = searchParams.get('id');

    if (!riskId) {
      throw new ValidationError('Risk ID is required');
    }

    // Verify the risk belongs to the user's organization
    const risk = await prisma.risk.findFirst({
      where: {
        id: riskId,
        riskRegister: {
          aiSystem: {
            organizationId: session.user.organizationId,
          },
        },
      },
    });

    if (!risk) {
      throw new ValidationError('Risk not found or access denied');
    }

    // Delete the risk (cascade will delete mitigation actions and oversight)
    await prisma.risk.delete({
      where: { id: riskId },
    });

    return successResponse({
      message: 'Risk deleted successfully',
    });
  } catch (error) {
    return errorResponse(error);
  }
}

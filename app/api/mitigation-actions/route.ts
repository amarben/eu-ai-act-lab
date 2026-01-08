import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { z } from 'zod';

const createMitigationActionSchema = z.object({
  riskId: z.string(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  responsibleParty: z.string().min(2, 'Responsible party is required'),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional().default('PLANNED'),
});

const updateMitigationActionSchema = z.object({
  description: z.string().min(10).optional(),
  responsibleParty: z.string().min(2).optional(),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  effectivenessRating: z.number().min(1).max(5).optional(),
  completionDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  notes: z.string().optional(),
});

/**
 * POST /api/mitigation-actions
 * Add a new mitigation action to a risk
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();

    // Validate input
    const validation = createMitigationActionSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        'Validation failed',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { riskId, ...actionData } = validation.data;

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
      include: {
        riskRegister: true,
      },
    });

    if (!risk) {
      throw new ValidationError('Risk not found or access denied');
    }

    // Create the mitigation action
    const mitigationAction = await prisma.mitigationAction.create({
      data: {
        ...actionData,
        riskId,
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

    return successResponse(
      {
        message: 'Mitigation action added successfully',
        mitigationAction,
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/mitigation-actions
 * Update an existing mitigation action
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();
    const { actionId, ...updateData } = body;

    if (!actionId) {
      throw new ValidationError('Action ID is required');
    }

    // Validate input
    const validation = updateMitigationActionSchema.safeParse(updateData);
    if (!validation.success) {
      throw new ValidationError(
        'Validation failed',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Verify the mitigation action belongs to the user's organization
    const mitigationAction = await prisma.mitigationAction.findFirst({
      where: {
        id: actionId,
        risk: {
          riskRegister: {
            aiSystem: {
              organizationId: session.user.organizationId,
            },
          },
        },
      },
      include: {
        risk: {
          include: {
            riskRegister: true,
          },
        },
      },
    });

    if (!mitigationAction) {
      throw new ValidationError('Mitigation action not found or access denied');
    }

    // Auto-set completion date if status is being set to COMPLETED
    let updates: any = { ...validation.data };
    if (validation.data.status === 'COMPLETED' && !mitigationAction.completionDate) {
      updates.completionDate = new Date();
    }

    // Update the mitigation action
    const updatedAction = await prisma.mitigationAction.update({
      where: { id: actionId },
      data: updates,
    });

    // Update risk register timestamp
    await prisma.aIRiskRegister.update({
      where: { id: mitigationAction.risk.riskRegisterId },
      data: {
        lastAssessedDate: new Date(),
        assessedBy: session.user.id!,
      },
    });

    return successResponse({
      message: 'Mitigation action updated successfully',
      mitigationAction: updatedAction,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/mitigation-actions
 * Delete a mitigation action
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const { searchParams } = new URL(request.url);
    const actionId = searchParams.get('id');

    if (!actionId) {
      throw new ValidationError('Action ID is required');
    }

    // Verify the mitigation action belongs to the user's organization
    const mitigationAction = await prisma.mitigationAction.findFirst({
      where: {
        id: actionId,
        risk: {
          riskRegister: {
            aiSystem: {
              organizationId: session.user.organizationId,
            },
          },
        },
      },
      include: {
        risk: {
          include: {
            riskRegister: true,
          },
        },
      },
    });

    if (!mitigationAction) {
      throw new ValidationError('Mitigation action not found or access denied');
    }

    // Delete the mitigation action
    await prisma.mitigationAction.delete({
      where: { id: actionId },
    });

    // Update risk register timestamp
    await prisma.aIRiskRegister.update({
      where: { id: mitigationAction.risk.riskRegisterId },
      data: {
        lastAssessedDate: new Date(),
        assessedBy: session.user.id!,
      },
    });

    return successResponse({
      message: 'Mitigation action deleted successfully',
    });
  } catch (error) {
    return errorResponse(error);
  }
}

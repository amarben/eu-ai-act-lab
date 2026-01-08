import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createIncidentSchema = z.object({
  aiSystemId: z.string(),
  title: z.string().min(1, 'Title is required'),
  incidentDate: z.string(), // ISO date string
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  category: z.string().min(1, 'Category is required'),
  affectedUsersCount: z.string().optional(),
  businessImpact: z.string().min(1, 'Business impact is required'),
  complianceImpact: z.string().optional(),
  affectedUsers: z.string().min(1, 'Affected users description is required'),
  immediateActions: z.string().min(1, 'Immediate actions are required'),
  rootCauseAnalysis: z.string().optional(),
  preventiveMeasures: z.string().optional(),
});

const updateIncidentSchema = z.object({
  incidentId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  impact: z.string().optional(),
  affectedUsers: z.string().optional(),
  immediateActions: z.string().optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED']).optional(),
  rootCause: z.string().optional(),
  resolutionSummary: z.string().optional(),
  lessonsLearned: z.string().optional(),
  resolvedDate: z.string().optional(),
  closedDate: z.string().optional(),
  notificationSubmitted: z.boolean().optional(),
  notificationDate: z.string().optional(),
  authorityResponse: z.string().optional(),
  // Notification Assessment
  notificationAssessment: z.object({
    isSeriousIncident: z.boolean(),
    hasHealthSafetyImpact: z.boolean(),
    hasFundamentalRightsViolation: z.boolean(),
    affectsHighRiskSystem: z.boolean(),
    notificationRequired: z.boolean(),
    assessedBy: z.string(),
    notificationTemplate: z.string().optional(),
    authorityContact: z.string().optional(),
  }).optional(),
  // Action Items
  actionItems: z.array(z.object({
    id: z.string().optional(), // If present, update; if not, create
    description: z.string(),
    assignedTo: z.string(),
    dueDate: z.string().optional(),
    status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    completionDate: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
});

const deleteIncidentSchema = z.object({
  incidentId: z.string(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function generateIncidentNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD

  // Find the highest incident number for today
  const lastIncident = await prisma.incident.findFirst({
    where: {
      incidentNumber: {
        startsWith: `INC-${dateStr}`,
      },
    },
    orderBy: {
      incidentNumber: 'desc',
    },
  });

  let sequence = 1;
  if (lastIncident) {
    // Extract the sequence number from the last incident (INC-YYYYMMDD-XXX)
    const parts = lastIncident.incidentNumber.split('-');
    if (parts.length === 3) {
      sequence = parseInt(parts[2], 10) + 1;
    }
  }

  return `INC-${dateStr}-${sequence.toString().padStart(3, '0')}`;
}

// ============================================================================
// POST - Create New Incident
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createIncidentSchema.parse(body);

    // Verify AI system belongs to the user's organization
    const aiSystem = await prisma.aISystem.findUnique({
      where: { id: validatedData.aiSystemId },
      select: { organizationId: true },
    });

    if (!aiSystem || aiSystem.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'AI System not found or access denied' } },
        { status: 403 }
      );
    }

    // Generate unique incident number
    const incidentNumber = await generateIncidentNumber();

    // Create the incident
    const incident = await prisma.incident.create({
      data: {
        incidentNumber,
        aiSystemId: validatedData.aiSystemId,
        title: validatedData.title,
        incidentDate: new Date(validatedData.incidentDate),
        reportedDate: new Date(),
        reportedBy: session.user.name || session.user.email,
        description: validatedData.description,
        severity: validatedData.severity,
        category: validatedData.category,
        affectedUsersCount: validatedData.affectedUsersCount ? parseInt(validatedData.affectedUsersCount, 10) : null,
        businessImpact: validatedData.businessImpact,
        complianceImpact: validatedData.complianceImpact,
        affectedUsers: validatedData.affectedUsers,
        immediateActions: validatedData.immediateActions,
        rootCauseAnalysis: validatedData.rootCauseAnalysis,
        preventiveMeasures: validatedData.preventiveMeasures,
        status: 'OPEN',
      },
      include: {
        aiSystem: {
          select: {
            name: true,
            riskClassification: {
              select: {
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: incident,
    });
  } catch (error) {
    console.error('Error creating incident:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create incident' } },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - List Incidents
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const aiSystemId = searchParams.get('aiSystemId');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const notificationRequired = searchParams.get('notificationRequired');

    const where: any = {
      aiSystem: {
        organizationId: session.user.organizationId,
      },
    };

    if (aiSystemId) {
      where.aiSystemId = aiSystemId;
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    if (notificationRequired === 'true') {
      where.notificationRequired = true;
    }

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        aiSystem: {
          select: {
            name: true,
            riskClassification: {
              select: {
                category: true,
              },
            },
          },
        },
        notificationAssessment: true,
        actionItems: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        incidentDate: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: incidents,
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incidents' } },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update Incident
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateIncidentSchema.parse(body);

    // Verify incident belongs to the user's organization
    const existingIncident = await prisma.incident.findUnique({
      where: { id: validatedData.incidentId },
      include: {
        aiSystem: {
          select: {
            organizationId: true,
          },
        },
        notificationAssessment: true,
        actionItems: true,
      },
    });

    if (!existingIncident || existingIncident.aiSystem.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Incident not found or access denied' } },
        { status: 403 }
      );
    }

    // Use transaction to update incident, notification assessment, and action items atomically
    const updatedIncident = await prisma.$transaction(async (tx) => {
      // Update incident base fields
      const incident = await tx.incident.update({
        where: { id: validatedData.incidentId },
        data: {
          ...(validatedData.title && { title: validatedData.title }),
          ...(validatedData.description && { description: validatedData.description }),
          ...(validatedData.severity && { severity: validatedData.severity }),
          ...(validatedData.impact && { impact: validatedData.impact }),
          ...(validatedData.affectedUsers && { affectedUsers: validatedData.affectedUsers }),
          ...(validatedData.immediateActions && { immediateActions: validatedData.immediateActions }),
          ...(validatedData.status && { status: validatedData.status }),
          ...(validatedData.rootCause !== undefined && { rootCause: validatedData.rootCause }),
          ...(validatedData.resolutionSummary !== undefined && { resolutionSummary: validatedData.resolutionSummary }),
          ...(validatedData.lessonsLearned !== undefined && { lessonsLearned: validatedData.lessonsLearned }),
          ...(validatedData.resolvedDate && { resolvedDate: new Date(validatedData.resolvedDate) }),
          ...(validatedData.closedDate && { closedDate: new Date(validatedData.closedDate) }),
          ...(validatedData.notificationSubmitted !== undefined && { notificationSubmitted: validatedData.notificationSubmitted }),
          ...(validatedData.notificationDate && { notificationDate: new Date(validatedData.notificationDate) }),
          ...(validatedData.authorityResponse !== undefined && { authorityResponse: validatedData.authorityResponse }),
        },
      });

      // Update or create notification assessment if provided
      if (validatedData.notificationAssessment) {
        const assessment = validatedData.notificationAssessment;

        if (existingIncident.notificationAssessment) {
          // Update existing assessment
          await tx.notificationAssessment.update({
            where: { incidentId: validatedData.incidentId },
            data: {
              isSeriousIncident: assessment.isSeriousIncident,
              hasHealthSafetyImpact: assessment.hasHealthSafetyImpact,
              hasFundamentalRightsViolation: assessment.hasFundamentalRightsViolation,
              affectsHighRiskSystem: assessment.affectsHighRiskSystem,
              notificationRequired: assessment.notificationRequired,
              assessedBy: assessment.assessedBy,
              notificationTemplate: assessment.notificationTemplate,
              authorityContact: assessment.authorityContact,
            },
          });
        } else {
          // Create new assessment
          await tx.notificationAssessment.create({
            data: {
              incidentId: validatedData.incidentId,
              isSeriousIncident: assessment.isSeriousIncident,
              hasHealthSafetyImpact: assessment.hasHealthSafetyImpact,
              hasFundamentalRightsViolation: assessment.hasFundamentalRightsViolation,
              affectsHighRiskSystem: assessment.affectsHighRiskSystem,
              notificationRequired: assessment.notificationRequired,
              assessedBy: assessment.assessedBy,
              notificationTemplate: assessment.notificationTemplate,
              authorityContact: assessment.authorityContact,
            },
          });
        }

        // Update incident notification fields based on assessment
        await tx.incident.update({
          where: { id: validatedData.incidentId },
          data: {
            notificationRequired: assessment.notificationRequired,
          },
        });
      }

      // Update action items if provided
      if (validatedData.actionItems) {
        const actionItemsToUpdate = validatedData.actionItems.filter(item => item.id);
        const actionItemsToCreate = validatedData.actionItems.filter(item => !item.id);
        const actionItemIdsToKeep = actionItemsToUpdate.map(item => item.id!);

        // Delete action items not in the list
        await tx.actionItem.deleteMany({
          where: {
            incidentId: validatedData.incidentId,
            id: { notIn: actionItemIdsToKeep },
          },
        });

        // Update existing action items
        for (const item of actionItemsToUpdate) {
          await tx.actionItem.update({
            where: { id: item.id },
            data: {
              description: item.description,
              assignedTo: item.assignedTo,
              dueDate: item.dueDate ? new Date(item.dueDate) : null,
              status: item.status,
              completionDate: item.completionDate ? new Date(item.completionDate) : null,
              notes: item.notes,
            },
          });
        }

        // Create new action items
        for (const item of actionItemsToCreate) {
          await tx.actionItem.create({
            data: {
              incidentId: validatedData.incidentId,
              description: item.description,
              assignedTo: item.assignedTo,
              dueDate: item.dueDate ? new Date(item.dueDate) : null,
              status: item.status,
              completionDate: item.completionDate ? new Date(item.completionDate) : null,
              notes: item.notes,
            },
          });
        }
      }

      // Return updated incident with relations
      return tx.incident.findUnique({
        where: { id: validatedData.incidentId },
        include: {
          aiSystem: {
            select: {
              name: true,
              riskClassification: {
                select: {
                  category: true,
                },
              },
            },
          },
          notificationAssessment: true,
          actionItems: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedIncident,
    });
  } catch (error) {
    console.error('Error updating incident:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update incident' } },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Delete Incident
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = deleteIncidentSchema.parse(body);

    // Verify incident belongs to the user's organization
    const existingIncident = await prisma.incident.findUnique({
      where: { id: validatedData.incidentId },
      include: {
        aiSystem: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!existingIncident || existingIncident.aiSystem.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Incident not found or access denied' } },
        { status: 403 }
      );
    }

    // Delete the incident (cascade will handle notification assessment and action items)
    await prisma.incident.delete({
      where: { id: validatedData.incidentId },
    });

    return NextResponse.json({
      success: true,
      message: 'Incident deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting incident:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete incident' } },
      { status: 500 }
    );
  }
}

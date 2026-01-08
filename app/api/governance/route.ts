import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating/updating governance structure with roles
const governanceSchema = z.object({
  aiSystemId: z.string().cuid(),
  roles: z.array(
    z.object({
      roleType: z.enum(['SYSTEM_OWNER', 'RISK_OWNER', 'HUMAN_OVERSIGHT', 'DATA_PROTECTION_OFFICER', 'TECHNICAL_LEAD', 'COMPLIANCE_OFFICER']),
      assignedTo: z.string().min(2, 'Assigned person name is required'),
      email: z.string().email('Valid email is required'),
      responsibilities: z.string().optional(),
      appointedDate: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  ).min(1, 'At least one role must be defined'),
});

// Schema for updating existing governance
const updateGovernanceSchema = z.object({
  governanceId: z.string().cuid(),
  roles: z.array(
    z.object({
      id: z.string().cuid().optional(), // If provided, update existing role
      roleType: z.enum(['SYSTEM_OWNER', 'RISK_OWNER', 'HUMAN_OVERSIGHT', 'DATA_PROTECTION_OFFICER', 'TECHNICAL_LEAD', 'COMPLIANCE_OFFICER']),
      assignedTo: z.string().min(2, 'Assigned person name is required'),
      email: z.string().email('Valid email is required'),
      responsibilities: z.string().optional(),
      appointedDate: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  ).min(1, 'At least one role must be defined'),
});

// Schema for deleting governance
const deleteGovernanceSchema = z.object({
  governanceId: z.string().cuid(),
});

// POST - Create new governance structure for an AI system
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = governanceSchema.parse(body);

    // Verify AI system exists and belongs to user's organization
    const aiSystem = await prisma.aISystem.findFirst({
      where: {
        id: validatedData.aiSystemId,
        organizationId: session.user.organizationId,
      },
    });

    if (!aiSystem) {
      return NextResponse.json(
        { error: { message: 'AI System not found or access denied' } },
        { status: 404 }
      );
    }

    // Check if governance already exists for this system
    const existingGovernance = await prisma.aIGovernance.findUnique({
      where: { aiSystemId: validatedData.aiSystemId },
    });

    if (existingGovernance) {
      return NextResponse.json(
        { error: { message: 'Governance structure already exists for this AI system' } },
        { status: 400 }
      );
    }

    // Create governance structure with roles in a transaction
    const governance = await prisma.aIGovernance.create({
      data: {
        aiSystemId: validatedData.aiSystemId,
        roles: {
          create: validatedData.roles.map(role => ({
            roleType: role.roleType,
            personName: role.assignedTo,
            email: role.email,
            department: 'Not specified', // Required field
            responsibilities: role.responsibilities ? [role.responsibilities] : [],
            assignedDate: role.appointedDate ? new Date(role.appointedDate) : new Date(),
            isActive: role.isActive ?? true,
          })),
        },
      },
      include: {
        roles: true,
        aiSystem: {
          select: {
            id: true,
            name: true,
            businessPurpose: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: governance }, { status: 201 });
  } catch (error) {
    console.error('Error creating governance:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Validation failed', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { message: 'Failed to create governance structure' } },
      { status: 500 }
    );
  }
}

// GET - List all governance structures for the organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const aiSystemId = searchParams.get('aiSystemId');

    // Build where clause
    const whereClause: any = {
      aiSystem: {
        organizationId: session.user.organizationId,
      },
    };

    if (aiSystemId) {
      whereClause.aiSystemId = aiSystemId;
    }

    const governanceStructures = await prisma.aIGovernance.findMany({
      where: whereClause,
      include: {
        roles: {
          orderBy: { roleType: 'asc' },
        },
        aiSystem: {
          select: {
            id: true,
            name: true,
            businessPurpose: true,
            riskClassification: {
              select: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: governanceStructures });
  } catch (error) {
    console.error('Error fetching governance structures:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch governance structures' } },
      { status: 500 }
    );
  }
}

// PUT - Update governance structure and roles
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateGovernanceSchema.parse(body);

    // Verify governance exists and belongs to user's organization
    const existingGovernance = await prisma.aIGovernance.findFirst({
      where: {
        id: validatedData.governanceId,
        aiSystem: {
          organizationId: session.user.organizationId,
        },
      },
      include: {
        roles: true,
      },
    });

    if (!existingGovernance) {
      return NextResponse.json(
        { error: { message: 'Governance structure not found or access denied' } },
        { status: 404 }
      );
    }

    // Update governance and roles in a transaction
    const updatedGovernance = await prisma.$transaction(async (tx) => {
      // Separate roles into update vs create
      const rolesToUpdate = validatedData.roles.filter(role => role.id);
      const rolesToCreate = validatedData.roles.filter(role => !role.id);

      // Get IDs of roles to keep
      const roleIdsToKeep = rolesToUpdate.map(r => r.id!);

      // Delete roles that are no longer in the list
      await tx.governanceRole.deleteMany({
        where: {
          aiGovernanceId: validatedData.governanceId,
          id: {
            notIn: roleIdsToKeep,
          },
        },
      });

      // Update existing roles
      for (const role of rolesToUpdate) {
        await tx.governanceRole.update({
          where: { id: role.id },
          data: {
            roleType: role.roleType,
            personName: role.assignedTo,
            email: role.email,
            responsibilities: role.responsibilities ? [role.responsibilities] : [],
            assignedDate: role.appointedDate ? new Date(role.appointedDate) : undefined,
            isActive: role.isActive ?? true,
          },
        });
      }

      // Create new roles
      if (rolesToCreate.length > 0) {
        await tx.governanceRole.createMany({
          data: rolesToCreate.map(role => ({
            aiGovernanceId: validatedData.governanceId,
            roleType: role.roleType,
            personName: role.assignedTo,
            email: role.email,
            department: 'Not specified', // Required field
            responsibilities: role.responsibilities ? [role.responsibilities] : [],
            assignedDate: role.appointedDate ? new Date(role.appointedDate) : new Date(),
            isActive: role.isActive ?? true,
          })),
        });
      }

      // Return updated governance with all roles
      return tx.aIGovernance.findUnique({
        where: { id: validatedData.governanceId },
        include: {
          roles: {
            orderBy: { roleType: 'asc' },
          },
          aiSystem: {
            select: {
              id: true,
              name: true,
              businessPurpose: true,
            },
          },
        },
      });
    });

    return NextResponse.json({ success: true, data: updatedGovernance });
  } catch (error) {
    console.error('Error updating governance:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Validation failed', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { message: 'Failed to update governance structure' } },
      { status: 500 }
    );
  }
}

// DELETE - Delete governance structure (will cascade to roles)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = deleteGovernanceSchema.parse(body);

    // Verify governance exists and belongs to user's organization
    const existingGovernance = await prisma.aIGovernance.findFirst({
      where: {
        id: validatedData.governanceId,
        aiSystem: {
          organizationId: session.user.organizationId,
        },
      },
    });

    if (!existingGovernance) {
      return NextResponse.json(
        { error: { message: 'Governance structure not found or access denied' } },
        { status: 404 }
      );
    }

    // Delete governance (roles will be cascade deleted)
    await prisma.aIGovernance.delete({
      where: { id: validatedData.governanceId },
    });

    return NextResponse.json({ success: true, message: 'Governance structure deleted successfully' });
  } catch (error) {
    console.error('Error deleting governance:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Validation failed', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { message: 'Failed to delete governance structure' } },
      { status: 500 }
    );
  }
}

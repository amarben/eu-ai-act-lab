import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { UnauthorizedError, ValidationError } from '@/lib/errors';
import { z } from 'zod';

// Validation schema
const createDocumentationSchema = z.object({
  aiSystemId: z.string().cuid(),
  preparedBy: z.string().min(1),
  intendedUse: z.string().optional(),
  foreseeableMisuse: z.string().optional(),
  systemArchitecture: z.string().optional(),
  trainingData: z.string().optional(),
  modelPerformance: z.string().optional(),
  validationTesting: z.string().optional(),
  humanOversightDoc: z.string().optional(),
  cybersecurity: z.string().optional(),
  reviewedBy: z.string().optional(),
  approvedBy: z.string().optional(),
});

const updateDocumentationSchema = z.object({
  id: z.string().cuid(),
  intendedUse: z.string().optional(),
  foreseeableMisuse: z.string().optional(),
  systemArchitecture: z.string().optional(),
  trainingData: z.string().optional(),
  modelPerformance: z.string().optional(),
  validationTesting: z.string().optional(),
  humanOversightDoc: z.string().optional(),
  cybersecurity: z.string().optional(),
  reviewedBy: z.string().optional(),
  approvedBy: z.string().optional(),
  versionNotes: z.string().optional(),
  createNewVersion: z.boolean().optional(),
});

/**
 * GET /api/technical-documentation
 * Get technical documentation for an AI system or list all for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const { searchParams } = new URL(request.url);
    const aiSystemId = searchParams.get('aiSystemId');

    if (aiSystemId) {
      // Get documentation for specific AI system
      const documentation = await prisma.technicalDocumentation.findFirst({
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
          attachments: {
            orderBy: {
              uploadedAt: 'desc',
            },
          },
          versions: {
            orderBy: {
              versionDate: 'desc',
            },
            take: 10, // Last 10 versions
          },
        },
      });

      return NextResponse.json({ documentation });
    }

    // Get all technical documentation for the organization
    const documentationList = await prisma.technicalDocumentation.findMany({
      where: {
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
        _count: {
          select: {
            attachments: true,
            versions: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ documentationList });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/technical-documentation
 * Create new technical documentation for an AI system
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();
    const validatedData = createDocumentationSchema.parse(body);

    // Verify the AI system exists and belongs to the user's organization
    const aiSystem = await prisma.aiSystem.findFirst({
      where: {
        id: validatedData.aiSystemId,
        organizationId: session.user.organizationId,
      },
    });

    if (!aiSystem) {
      throw new ValidationError('AI system not found');
    }

    // Check if documentation already exists for this system
    const existingDoc = await prisma.technicalDocumentation.findUnique({
      where: {
        aiSystemId: validatedData.aiSystemId,
      },
    });

    if (existingDoc) {
      throw new ValidationError('Technical documentation already exists for this AI system');
    }

    // Calculate completeness percentage
    const sections = [
      validatedData.intendedUse,
      validatedData.foreseeableMisuse,
      validatedData.systemArchitecture,
      validatedData.trainingData,
      validatedData.modelPerformance,
      validatedData.validationTesting,
      validatedData.humanOversightDoc,
      validatedData.cybersecurity,
    ];
    const completedSections = sections.filter((s) => s && s.trim().length > 0).length;
    const completenessPercentage = (completedSections / 8) * 100;

    // Create the technical documentation
    const documentation = await prisma.technicalDocumentation.create({
      data: {
        aiSystemId: validatedData.aiSystemId,
        preparedBy: validatedData.preparedBy,
        intendedUse: validatedData.intendedUse,
        foreseeableMisuse: validatedData.foreseeableMisuse,
        systemArchitecture: validatedData.systemArchitecture,
        trainingData: validatedData.trainingData,
        modelPerformance: validatedData.modelPerformance,
        validationTesting: validatedData.validationTesting,
        humanOversightDoc: validatedData.humanOversightDoc,
        cybersecurity: validatedData.cybersecurity,
        reviewedBy: validatedData.reviewedBy,
        approvedBy: validatedData.approvedBy,
        completenessPercentage,
        updatedBy: session.user.id,
        approvalDate: validatedData.approvedBy ? new Date() : null,
      },
      include: {
        aiSystem: {
          select: {
            id: true,
            name: true,
            businessPurpose: true,
          },
        },
      },
    });

    // Create initial version
    await prisma.documentVersion.create({
      data: {
        technicalDocumentationId: documentation.id,
        version: '1.0',
        versionNotes: 'Initial version',
        savedBy: session.user.id,
        snapshotData: JSON.stringify({
          intendedUse: documentation.intendedUse,
          foreseeableMisuse: documentation.foreseeableMisuse,
          systemArchitecture: documentation.systemArchitecture,
          trainingData: documentation.trainingData,
          modelPerformance: documentation.modelPerformance,
          validationTesting: documentation.validationTesting,
          humanOversightDoc: documentation.humanOversightDoc,
          cybersecurity: documentation.cybersecurity,
        }),
      },
    });

    return NextResponse.json({ documentation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return errorResponse(error);
  }
}

/**
 * PUT /api/technical-documentation
 * Update existing technical documentation
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();
    const validatedData = updateDocumentationSchema.parse(body);

    // Verify the documentation exists and belongs to the user's organization
    const existingDoc = await prisma.technicalDocumentation.findFirst({
      where: {
        id: validatedData.id,
        aiSystem: {
          organizationId: session.user.organizationId,
        },
      },
    });

    if (!existingDoc) {
      throw new ValidationError('Technical documentation not found');
    }

    // Calculate new completeness percentage
    const sections = [
      validatedData.intendedUse ?? existingDoc.intendedUse,
      validatedData.foreseeableMisuse ?? existingDoc.foreseeableMisuse,
      validatedData.systemArchitecture ?? existingDoc.systemArchitecture,
      validatedData.trainingData ?? existingDoc.trainingData,
      validatedData.modelPerformance ?? existingDoc.modelPerformance,
      validatedData.validationTesting ?? existingDoc.validationTesting,
      validatedData.humanOversightDoc ?? existingDoc.humanOversightDoc,
      validatedData.cybersecurity ?? existingDoc.cybersecurity,
    ];
    const completedSections = sections.filter((s) => s && s.trim().length > 0).length;
    const completenessPercentage = (completedSections / 8) * 100;

    // Prepare update data
    const updateData: any = {
      completenessPercentage,
      updatedBy: session.user.id,
    };

    // Only update fields that are provided
    if (validatedData.intendedUse !== undefined) updateData.intendedUse = validatedData.intendedUse;
    if (validatedData.foreseeableMisuse !== undefined) updateData.foreseeableMisuse = validatedData.foreseeableMisuse;
    if (validatedData.systemArchitecture !== undefined) updateData.systemArchitecture = validatedData.systemArchitecture;
    if (validatedData.trainingData !== undefined) updateData.trainingData = validatedData.trainingData;
    if (validatedData.modelPerformance !== undefined) updateData.modelPerformance = validatedData.modelPerformance;
    if (validatedData.validationTesting !== undefined) updateData.validationTesting = validatedData.validationTesting;
    if (validatedData.humanOversightDoc !== undefined) updateData.humanOversightDoc = validatedData.humanOversightDoc;
    if (validatedData.cybersecurity !== undefined) updateData.cybersecurity = validatedData.cybersecurity;
    if (validatedData.reviewedBy !== undefined) updateData.reviewedBy = validatedData.reviewedBy;
    if (validatedData.approvedBy !== undefined) {
      updateData.approvedBy = validatedData.approvedBy;
      updateData.approvalDate = new Date();
    }

    // Create new version if requested
    if (validatedData.createNewVersion) {
      const latestVersion = await prisma.documentVersion.findFirst({
        where: {
          technicalDocumentationId: validatedData.id,
        },
        orderBy: {
          versionDate: 'desc',
        },
      });

      const currentVersion = latestVersion?.version || '1.0';
      const [major, minor] = currentVersion.split('.').map(Number);
      const newVersion = `${major}.${minor + 1}`;

      updateData.version = newVersion;
      updateData.versionDate = new Date();
      updateData.versionNotes = validatedData.versionNotes || 'Updated documentation';

      // Create version snapshot
      await prisma.documentVersion.create({
        data: {
          technicalDocumentationId: validatedData.id,
          version: newVersion,
          versionNotes: validatedData.versionNotes || 'Updated documentation',
          savedBy: session.user.id,
          snapshotData: JSON.stringify({
            intendedUse: validatedData.intendedUse ?? existingDoc.intendedUse,
            foreseeableMisuse: validatedData.foreseeableMisuse ?? existingDoc.foreseeableMisuse,
            systemArchitecture: validatedData.systemArchitecture ?? existingDoc.systemArchitecture,
            trainingData: validatedData.trainingData ?? existingDoc.trainingData,
            modelPerformance: validatedData.modelPerformance ?? existingDoc.modelPerformance,
            validationTesting: validatedData.validationTesting ?? existingDoc.validationTesting,
            humanOversightDoc: validatedData.humanOversightDoc ?? existingDoc.humanOversightDoc,
            cybersecurity: validatedData.cybersecurity ?? existingDoc.cybersecurity,
          }),
        },
      });
    }

    // Update the documentation
    const documentation = await prisma.technicalDocumentation.update({
      where: {
        id: validatedData.id,
      },
      data: updateData,
      include: {
        aiSystem: {
          select: {
            id: true,
            name: true,
            businessPurpose: true,
          },
        },
        attachments: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
        versions: {
          orderBy: {
            versionDate: 'desc',
          },
          take: 10,
        },
      },
    });

    return NextResponse.json({ documentation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return errorResponse(error);
  }
}

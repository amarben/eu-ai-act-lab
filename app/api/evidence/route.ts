import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const createEvidenceSchema = z.object({
  requirementAssessmentId: z.string(),
  type: z.enum(['TEXT', 'FILE', 'LINK']),
  title: z.string().min(3),
  description: z.string().optional(),
  linkUrl: z.string().url().optional(),
  textContent: z.string().optional(),
  fileName: z.string().optional(),
  fileData: z.string().optional(), // Base64 encoded file data
});

/**
 * POST /api/evidence
 * Create new evidence for a requirement assessment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const body = await request.json();

    // Validate input
    const validation = createEvidenceSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        'Validation failed',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { requirementAssessmentId, type, title, description, linkUrl, textContent, fileName, fileData } =
      validation.data;

    // Verify the requirement assessment belongs to the user's organization
    const requirement = await prisma.requirementAssessment.findFirst({
      where: {
        id: requirementAssessmentId,
        gapAssessment: {
          aiSystem: {
            organizationId: session.user.organizationId,
          },
        },
      },
    });

    if (!requirement) {
      throw new ValidationError('Requirement assessment not found or access denied');
    }

    let fileUrl: string | null = null;

    // Handle file upload
    if (type === 'FILE' && fileData && fileName) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'evidence');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}_${safeFileName}`;
      const filePath = join(uploadsDir, uniqueFileName);

      // Decode base64 and write file
      const buffer = Buffer.from(fileData, 'base64');
      await writeFile(filePath, buffer);

      fileUrl = `/uploads/evidence/${uniqueFileName}`;
    }

    // Create evidence record
    const evidence = await prisma.evidence.create({
      data: {
        requirementAssessmentId,
        type,
        title,
        description: description || null,
        fileUrl,
        linkUrl: linkUrl || null,
        textContent: textContent || null,
        uploadedBy: session.user.id!,
      },
    });

    return successResponse(
      {
        message: 'Evidence created successfully',
        evidence,
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * GET /api/evidence
 * Get evidence for a requirement assessment
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const { searchParams } = new URL(request.url);
    const requirementAssessmentId = searchParams.get('requirementAssessmentId');
    const evidenceId = searchParams.get('id');

    if (evidenceId) {
      // Get specific evidence by ID
      const evidence = await prisma.evidence.findFirst({
        where: {
          id: evidenceId,
          requirementAssessment: {
            gapAssessment: {
              aiSystem: {
                organizationId: session.user.organizationId,
              },
            },
          },
        },
      });

      if (!evidence) {
        throw new ValidationError('Evidence not found');
      }

      return successResponse({ evidence });
    }

    if (requirementAssessmentId) {
      // Get all evidence for a requirement assessment
      const evidence = await prisma.evidence.findMany({
        where: {
          requirementAssessmentId,
          requirementAssessment: {
            gapAssessment: {
              aiSystem: {
                organizationId: session.user.organizationId,
              },
            },
          },
        },
        orderBy: {
          uploadedAt: 'desc',
        },
      });

      return successResponse({ evidence });
    }

    throw new ValidationError('requirementAssessmentId or id parameter is required');
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/evidence
 * Delete evidence
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const { searchParams } = new URL(request.url);
    const evidenceId = searchParams.get('id');

    if (!evidenceId) {
      throw new ValidationError('Evidence ID is required');
    }

    // Verify the evidence belongs to the user's organization
    const evidence = await prisma.evidence.findFirst({
      where: {
        id: evidenceId,
        requirementAssessment: {
          gapAssessment: {
            aiSystem: {
              organizationId: session.user.organizationId,
            },
          },
        },
      },
    });

    if (!evidence) {
      throw new ValidationError('Evidence not found or access denied');
    }

    // Delete the evidence
    await prisma.evidence.delete({
      where: { id: evidenceId },
    });

    // Note: We could also delete the physical file here, but keeping it for audit trail purposes

    return successResponse({
      message: 'Evidence deleted successfully',
    });
  } catch (error) {
    return errorResponse(error);
  }
}

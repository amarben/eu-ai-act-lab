import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { UnauthorizedError, ValidationError } from '@/lib/errors';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/technical-documentation/attachments
 * Upload a file attachment for technical documentation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const section = formData.get('section') as string;
    const documentationId = formData.get('documentationId') as string;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    if (!documentationId) {
      throw new ValidationError('Documentation ID is required');
    }

    // Verify documentation exists and belongs to user's organization
    const documentation = await prisma.technicalDocumentation.findFirst({
      where: {
        id: documentationId,
        aiSystem: {
          organizationId: session.user.organizationId,
        },
      },
    });

    if (!documentation) {
      throw new ValidationError('Technical documentation not found');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documentation');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedFilename}`;
    const filepath = join(uploadsDir, filename);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save attachment record to database
    const attachment = await prisma.documentAttachment.create({
      data: {
        technicalDocumentationId: documentationId,
        fileName: file.name,
        fileUrl: `/uploads/documentation/${filename}`,
        fileType: file.type,
        fileSize: file.size,
        section: section || 'GENERAL',
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

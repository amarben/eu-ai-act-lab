import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { UnauthorizedError, ValidationError } from '@/lib/errors';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * DELETE /api/technical-documentation/attachments/[id]
 * Delete a file attachment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const attachmentId = params.id;

    // Find attachment and verify ownership
    const attachment = await prisma.documentAttachment.findFirst({
      where: {
        id: attachmentId,
        technicalDocumentation: {
          aiSystem: {
            organizationId: session.user.organizationId,
          },
        },
      },
    });

    if (!attachment) {
      throw new ValidationError('Attachment not found');
    }

    // Delete file from disk if it exists
    const filepath = join(process.cwd(), 'public', attachment.fileUrl);
    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    // Delete attachment record from database
    await prisma.documentAttachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

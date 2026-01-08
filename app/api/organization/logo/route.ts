import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { UnauthorizedError, ValidationError } from '@/lib/errors';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/organization/logo
 * Upload organization logo (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      throw new UnauthorizedError('Only administrators can update organization logo');
    }

    const formData = await request.formData();
    const file = formData.get('logo') as File | null;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new ValidationError('File must be an image');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new ValidationError('File size must be less than 5MB');
    }

    // Get current organization to delete old logo
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { logoUrl: true },
    });

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'logos');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${session.user.organizationId}_${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update organization with new logo URL
    const logoUrl = `/uploads/logos/${filename}`;
    const updatedOrganization = await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: { logoUrl },
    });

    // Delete old logo file if exists
    if (organization?.logoUrl) {
      const oldFilepath = join(process.cwd(), 'public', organization.logoUrl);
      if (existsSync(oldFilepath)) {
        await unlink(oldFilepath).catch(() => {
          // Ignore errors if file doesn't exist
        });
      }
    }

    return NextResponse.json({ logoUrl });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/organization/logo
 * Delete organization logo (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      throw new UnauthorizedError('Only administrators can delete organization logo');
    }

    // Get current organization
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { logoUrl: true },
    });

    if (!organization?.logoUrl) {
      throw new ValidationError('No logo to delete');
    }

    // Delete file from disk
    const filepath = join(process.cwd(), 'public', organization.logoUrl);
    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    // Update organization to remove logo URL
    await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: { logoUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

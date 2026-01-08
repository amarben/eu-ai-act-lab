import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { UnauthorizedError, ValidationError } from '@/lib/errors';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

/**
 * PUT /api/organization/users/[id]
 * Update user role (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      throw new UnauthorizedError('Only administrators can update user roles');
    }

    const userId = params.id;

    // Verify user belongs to same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: session.user.organizationId,
      },
    });

    if (!targetUser) {
      throw new ValidationError('User not found in your organization');
    }

    // Prevent admin from changing their own role
    if (userId === session.user.id) {
      throw new ValidationError('You cannot change your own role');
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Update user role
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: validatedData.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
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
 * DELETE /api/organization/users/[id]
 * Remove user from organization (admin only)
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

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      throw new UnauthorizedError('Only administrators can remove users');
    }

    const userId = params.id;

    // Verify user belongs to same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: session.user.organizationId,
      },
    });

    if (!targetUser) {
      throw new ValidationError('User not found in your organization');
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      throw new ValidationError('You cannot remove yourself from the organization');
    }

    // Check if organization would have no admins left
    const adminCount = await prisma.user.count({
      where: {
        organizationId: session.user.organizationId,
        role: 'ADMIN',
      },
    });

    if (targetUser.role === 'ADMIN' && adminCount <= 1) {
      throw new ValidationError('Cannot remove the last administrator from the organization');
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

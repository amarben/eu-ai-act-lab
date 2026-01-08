import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';
import { UnauthorizedError, ValidationError } from '@/lib/errors';
import { z } from 'zod';

const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  legalName: z.string().optional(),
  industry: z.enum([
    'FINANCIAL_SERVICES',
    'HEALTHCARE',
    'MANUFACTURING',
    'RETAIL',
    'TECHNOLOGY',
    'PUBLIC_SECTOR',
    'CONSULTING',
    'EDUCATION',
    'OTHER',
  ]).optional(),
  region: z.string().optional(),
  size: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
  euPresence: z.boolean().optional(),
  headquarters: z.string().optional(),
  registrationNumber: z.string().optional(),
  description: z.string().optional(),
});

/**
 * GET /api/organization/profile
 * Get organization profile information
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: session.user.organizationId,
      },
      include: {
        _count: {
          select: {
            users: true,
            aiSystems: true,
          },
        },
      },
    });

    if (!organization) {
      throw new ValidationError('Organization not found');
    }

    return NextResponse.json({ organization });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/organization/profile
 * Update organization profile information (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      throw new UnauthorizedError('Only administrators can update organization profile');
    }

    const body = await request.json();
    const validatedData = updateOrganizationSchema.parse(body);

    // Update organization
    const organization = await prisma.organization.update({
      where: {
        id: session.user.organizationId,
      },
      data: validatedData,
      include: {
        _count: {
          select: {
            users: true,
            aiSystems: true,
          },
        },
      },
    });

    return NextResponse.json({ organization });
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

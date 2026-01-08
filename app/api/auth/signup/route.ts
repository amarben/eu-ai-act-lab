import { NextRequest } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signUpSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError, ConflictError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = signUpSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        'Validation failed',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { name, email, password, organizationName } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          legalName: organizationName,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          emailVerified: new Date(),
          role: 'ADMIN', // First user is admin of their organization
          organizationId: organization.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          organizationId: true,
          createdAt: true,
        },
      });

      return { user, organization };
    });

    return successResponse(
      {
        message: 'Account created successfully',
        user: result.user,
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}

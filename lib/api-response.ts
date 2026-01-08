import { NextResponse } from 'next/server';
import { formatErrorResponse } from './errors';

/**
 * Utility functions for standardized API responses
 */

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(error: unknown, status?: number) {
  const formatted = formatErrorResponse(error);
  return NextResponse.json(
    formatted,
    { status: status || formatted.statusCode }
  );
}

export function createdResponse<T>(data: T) {
  return successResponse(data, 201);
}

export function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

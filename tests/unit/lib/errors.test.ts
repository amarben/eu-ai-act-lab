/**
 * Unit Tests: Error Handling Utilities
 *
 * Tests for custom error classes and error formatting functions.
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  formatErrorResponse,
  isAppError,
} from '@/lib/errors';

describe('Error Handling Utilities', () => {
  describe('AppError', () => {
    it('should create error with message and default status code', () => {
      const error = new AppError('Something went wrong');
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should create error with custom status code', () => {
      const error = new AppError('Bad request', 400);
      expect(error.statusCode).toBe(400);
    });

    it('should create error with custom code', () => {
      const error = new AppError('Error', 500, 'CUSTOM_ERROR');
      expect(error.code).toBe('CUSTOM_ERROR');
    });

    it('should capture stack trace', () => {
      const error = new AppError('Error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with correct properties', () => {
      const error = new ValidationError('Validation failed');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should include field errors', () => {
      const errors = {
        email: ['Email is required', 'Invalid email format'],
        password: ['Password must be at least 8 characters'],
      };
      const error = new ValidationError('Validation failed', errors);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('AuthenticationError', () => {
    it('should create with default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should create with custom message', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
    });
  });

  describe('AuthorizationError', () => {
    it('should create with default message', () => {
      const error = new AuthorizationError();
      expect(error.message).toBe('You do not have permission to perform this action');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should create with custom message', () => {
      const error = new AuthorizationError('Admin access required');
      expect(error.message).toBe('Admin access required');
    });
  });

  describe('UnauthorizedError', () => {
    it('should extend AuthenticationError', () => {
      const error = new UnauthorizedError();
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should have correct default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized access');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('NotFoundError', () => {
    it('should create with default resource name', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create with custom resource name', () => {
      const error = new NotFoundError('AI System');
      expect(error.message).toBe('AI System not found');
    });
  });

  describe('ConflictError', () => {
    it('should create with correct properties', () => {
      const error = new ConflictError('Resource already exists');
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('RateLimitError', () => {
    it('should create with default message', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Too many requests. Please try again later.');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should create with custom message', () => {
      const error = new RateLimitError('API quota exceeded');
      expect(error.message).toBe('API quota exceeded');
    });
  });

  describe('ExternalServiceError', () => {
    it('should create with service name and default message', () => {
      const error = new ExternalServiceError('Gemini API');
      expect(error.message).toBe('Gemini API: External service error');
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
    });

    it('should create with custom error message', () => {
      const error = new ExternalServiceError('Gemini API', 'Rate limit exceeded');
      expect(error.message).toBe('Gemini API: Rate limit exceeded');
    });
  });

  describe('formatErrorResponse', () => {
    it('should format AppError correctly', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR');
      const response = formatErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error: 'Test error',
        code: 'TEST_ERROR',
        statusCode: 400,
      });
    });

    it('should format ValidationError with field errors', () => {
      const fieldErrors = { email: ['Required'] };
      const error = new ValidationError('Validation failed', fieldErrors);
      const response = formatErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        errors: fieldErrors,
      });
    });

    it('should format standard Error', () => {
      const error = new Error('Standard error');
      const response = formatErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error: 'Standard error',
        statusCode: 500,
      });
    });

    it('should format unknown error types', () => {
      const response = formatErrorResponse('String error');

      expect(response).toEqual({
        success: false,
        error: 'An unexpected error occurred',
        statusCode: 500,
      });
    });

    it('should format null error', () => {
      const response = formatErrorResponse(null);

      expect(response).toEqual({
        success: false,
        error: 'An unexpected error occurred',
        statusCode: 500,
      });
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError', () => {
      const error = new AppError('Test');
      expect(isAppError(error)).toBe(true);
    });

    it('should return true for derived errors', () => {
      expect(isAppError(new ValidationError('Test'))).toBe(true);
      expect(isAppError(new AuthenticationError())).toBe(true);
      expect(isAppError(new NotFoundError())).toBe(true);
    });

    it('should return false for standard Error', () => {
      const error = new Error('Test');
      expect(isAppError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isAppError('string')).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
      expect(isAppError({})).toBe(false);
    });
  });

  describe('Error inheritance chain', () => {
    it('should maintain proper inheritance for all custom errors', () => {
      const errors = [
        new ValidationError('Test'),
        new AuthenticationError(),
        new AuthorizationError(),
        new UnauthorizedError(),
        new NotFoundError(),
        new ConflictError('Test'),
        new RateLimitError(),
        new ExternalServiceError('Service'),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(AppError);
        expect(error).toBeInstanceOf(Error);
      });
    });
  });
});

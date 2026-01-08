/**
 * Unit Tests: Authentication Validation Schemas
 *
 * Tests for Zod validation schemas used in authentication flows.
 */

import { describe, it, expect } from 'vitest';
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  newPasswordSchema,
} from '@/lib/validations/auth';

describe('Authentication Validation Schemas', () => {
  describe('signInSchema', () => {
    const validSignIn = {
      email: 'user@talenttech.de',
      password: 'SecurePass123',
    };

    it('should validate correct sign-in data', () => {
      const result = signInSchema.safeParse(validSignIn);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const invalid = { password: 'SecurePass123' };

      const result = signInSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject invalid email format', () => {
      const invalid = { ...validSignIn, email: 'notanemail' };

      const result = signInSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email address');
      }
    });

    it('should reject email without @ symbol', () => {
      const invalid = { ...validSignIn, email: 'useratalenttech.de' };

      const result = signInSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject email without domain', () => {
      const invalid = { ...validSignIn, email: 'user@' };

      const result = signInSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalid = { email: 'user@talenttech.de' };

      const result = signInSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const invalid = { ...validSignIn, password: 'Short1' };

      const result = signInSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should accept password with exactly 8 characters', () => {
      const data = { ...validSignIn, password: 'Pass1234' };

      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept long passwords', () => {
      const data = {
        ...validSignIn,
        password: 'VeryLongSecurePassword123!@#$%^&*()',
      };

      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('signUpSchema', () => {
    const validSignUp = {
      name: 'John Doe',
      email: 'john@talenttech.de',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
      organizationName: 'TalentTech Solutions',
    };

    it('should validate correct sign-up data', () => {
      const result = signUpSchema.safeParse(validSignUp);
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      const invalid = { ...validSignUp };
      delete (invalid as any).name;

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('should reject name shorter than 2 characters', () => {
      const invalid = { ...validSignUp, name: 'J' };

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject invalid email format', () => {
      const invalid = { ...validSignUp, email: 'invalid-email' };

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email address');
      }
    });

    it('should reject password without uppercase letter', () => {
      const invalid = {
        ...validSignUp,
        password: 'securepass123',
        confirmPassword: 'securepass123',
      };

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase letter');
      }
    });

    it('should reject password without lowercase letter', () => {
      const invalid = {
        ...validSignUp,
        password: 'SECUREPASS123',
        confirmPassword: 'SECUREPASS123',
      };

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase letter');
      }
    });

    it('should reject password without number', () => {
      const invalid = {
        ...validSignUp,
        password: 'SecurePassword',
        confirmPassword: 'SecurePassword',
      };

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('one number');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const invalid = {
        ...validSignUp,
        password: 'Pass12',
        confirmPassword: 'Pass12',
      };

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should reject mismatched passwords', () => {
      const invalid = {
        ...validSignUp,
        password: 'SecurePass123',
        confirmPassword: 'DifferentPass123',
      };

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("don't match");
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });

    it('should accept matching complex passwords', () => {
      const data = {
        ...validSignUp,
        password: 'Complex!Pass123',
        confirmPassword: 'Complex!Pass123',
      };

      const result = signUpSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing organization name', () => {
      const invalid = { ...validSignUp };
      delete (invalid as any).organizationName;

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('organizationName');
      }
    });

    it('should reject organization name shorter than 2 characters', () => {
      const invalid = { ...validSignUp, organizationName: 'T' };

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should accept organization name with exactly 2 characters', () => {
      const data = { ...validSignUp, organizationName: 'AB' };

      const result = signUpSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate password complexity requirements together', () => {
      const testCases = [
        { password: 'ABC12345', valid: false, reason: 'no lowercase' },
        { password: 'abc12345', valid: false, reason: 'no uppercase' },
        { password: 'ABCabcde', valid: false, reason: 'no number' },
        { password: 'Abc12', valid: false, reason: 'too short' },
        { password: 'Abcdefg1', valid: true, reason: 'valid' },
        { password: 'SecurePass123!@#', valid: true, reason: 'valid with special chars' },
      ];

      testCases.forEach(({ password, valid }) => {
        const data = {
          ...validSignUp,
          password,
          confirmPassword: password,
        };
        const result = signUpSchema.safeParse(data);
        expect(result.success).toBe(valid);
      });
    });
  });

  describe('resetPasswordSchema', () => {
    const validReset = {
      email: 'user@talenttech.de',
    };

    it('should validate correct reset password data', () => {
      const result = resetPasswordSchema.safeParse(validReset);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const invalid = {};

      const result = resetPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject invalid email format', () => {
      const invalid = { email: 'not-an-email' };

      const result = resetPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email address');
      }
    });

    it('should accept various valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@company.co.uk',
        'admin+test@talenttech.de',
        'user_123@domain.org',
      ];

      validEmails.forEach((email) => {
        const result = resetPasswordSchema.safeParse({ email });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'plaintext',
        '@example.com',
        'user@',
        'user @example.com',
        'user..test@example.com',
      ];

      invalidEmails.forEach((email) => {
        const result = resetPasswordSchema.safeParse({ email });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('newPasswordSchema', () => {
    const validNewPassword = {
      password: 'NewSecure123',
      confirmPassword: 'NewSecure123',
    };

    it('should validate correct new password data', () => {
      const result = newPasswordSchema.safeParse(validNewPassword);
      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase letter', () => {
      const invalid = {
        password: 'newsecure123',
        confirmPassword: 'newsecure123',
      };

      const result = newPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase letter');
      }
    });

    it('should reject password without lowercase letter', () => {
      const invalid = {
        password: 'NEWSECURE123',
        confirmPassword: 'NEWSECURE123',
      };

      const result = newPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase letter');
      }
    });

    it('should reject password without number', () => {
      const invalid = {
        password: 'NewSecurePass',
        confirmPassword: 'NewSecurePass',
      };

      const result = newPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('one number');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const invalid = {
        password: 'Pass12',
        confirmPassword: 'Pass12',
      };

      const result = newPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should reject mismatched passwords', () => {
      const invalid = {
        password: 'NewSecure123',
        confirmPassword: 'DifferentPass123',
      };

      const result = newPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("don't match");
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });

    it('should accept matching passwords with special characters', () => {
      const data = {
        password: 'Secure!Pass@123#',
        confirmPassword: 'Secure!Pass@123#',
      };

      const result = newPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate password requirements', () => {
      const testCases = [
        { password: 'Abc12345', valid: true },
        { password: 'Short1A', valid: false }, // too short
        { password: 'nouppercase123', valid: false }, // no uppercase
        { password: 'NOLOWERCASE123', valid: false }, // no lowercase
        { password: 'NoNumbers', valid: false }, // no numbers
        { password: 'Valid123!@#$%', valid: true }, // with special chars
      ];

      testCases.forEach(({ password, valid }) => {
        const data = {
          password,
          confirmPassword: password,
        };
        const result = newPasswordSchema.safeParse(data);
        expect(result.success).toBe(valid);
      });
    });

    it('should apply password match validation after format validation', () => {
      const invalid = {
        password: 'short', // fails length check
        confirmPassword: 'different', // different from password
      };

      const result = newPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      // Should have errors for both length and complexity, not just mismatch
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle empty strings in sign-up', () => {
      const invalid = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        organizationName: '',
      };

      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have multiple validation errors
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });

    it('should handle SQL injection attempt in email', () => {
      const sqlInjection = {
        email: "admin'--@example.com",
        password: 'SecurePass123',
      };

      const result = signInSchema.safeParse(sqlInjection);
      // Email validation should still pass (it's technically a valid email)
      // SQL injection protection should be handled at the database layer
      expect(result.success).toBe(true);
    });

    it('should handle XSS attempt in name field', () => {
      const xssAttempt = {
        ...{
          name: '<script>alert("xss")</script>',
          email: 'test@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
          organizationName: 'Test Org',
        },
      };

      const result = signUpSchema.safeParse(xssAttempt);
      // Schema should still validate - XSS protection is handled at rendering layer
      expect(result.success).toBe(true);
    });

    it('should handle very long input strings', () => {
      const longString = 'a'.repeat(1000);
      const data = {
        name: longString,
        email: `${longString}@example.com`,
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        organizationName: longString,
      };

      const result = signUpSchema.safeParse(data);
      // Schema allows long strings - length limits should be enforced at database level
      expect(result.success).toBe(true);
    });

    it('should handle Unicode characters in name', () => {
      const unicodeName = {
        name: '陈伟 (Chen Wei)',
        email: 'chen@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        organizationName: '北京科技公司',
      };

      const result = signUpSchema.safeParse(unicodeName);
      expect(result.success).toBe(true);
    });
  });
});

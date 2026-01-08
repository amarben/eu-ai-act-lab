/**
 * Unit Tests: Utility Functions
 *
 * Tests for utility functions used throughout the application.
 */

import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatDateShort,
  daysBetween,
  truncate,
  toTitleCase,
  enumToLabel,
  getRiskColor,
  getComplianceColor,
  formatFileSize,
  sleep,
} from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', false && 'hidden', true && 'visible');
      expect(result).toContain('base-class');
      expect(result).toContain('visible');
      expect(result).not.toContain('hidden');
    });

    it('should handle tailwind merge conflicts', () => {
      const result = cn('p-4', 'p-2'); // Later padding should override
      expect(result).toBe('p-2');
    });
  });

  describe('formatDate', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2024-03-15T10:00:00Z');
      const result = formatDate(date);
      expect(result).toContain('March');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format string date correctly', () => {
      const result = formatDate('2024-03-15');
      expect(result).toContain('March');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should handle ISO datetime strings', () => {
      const result = formatDate('2024-12-25T12:00:00Z');
      expect(result).toContain('December');
      expect(result).toContain('25');
      expect(result).toContain('2024');
    });
  });

  describe('formatDateShort', () => {
    it('should format Date object to MM/DD/YYYY', () => {
      const date = new Date('2024-03-15T10:00:00Z');
      const result = formatDateShort(date);
      // Format should be like "03/15/2024"
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should format string date to MM/DD/YYYY', () => {
      const result = formatDateShort('2024-03-15');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between two Date objects', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-11');
      expect(daysBetween(date1, date2)).toBe(10);
    });

    it('should calculate days between string dates', () => {
      expect(daysBetween('2024-01-01', '2024-01-11')).toBe(10);
    });

    it('should handle reversed date order (absolute difference)', () => {
      const date1 = new Date('2024-01-11');
      const date2 = new Date('2024-01-01');
      expect(daysBetween(date1, date2)).toBe(10);
    });

    it('should return 0 for same dates', () => {
      const date = new Date('2024-01-01');
      expect(daysBetween(date, date)).toBe(0);
    });

    it('should ceil fractional days', () => {
      const date1 = new Date('2024-01-01T00:00:00Z');
      const date2 = new Date('2024-01-01T12:00:00Z'); // 12 hours = 0.5 days
      expect(daysBetween(date1, date2)).toBe(1); // Should ceil to 1
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs truncation';
      const result = truncate(text, 20);
      expect(result).toBe('This is a very long ...');
      expect(result.length).toBe(23); // 20 + '...'
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const result = truncate(text, 20);
      expect(result).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = 'Exactly twenty chars';
      const result = truncate(text, 20);
      expect(result).toBe('Exactly twenty chars'); // No truncation
    });

    it('should handle empty string', () => {
      const result = truncate('', 10);
      expect(result).toBe('');
    });
  });

  describe('toTitleCase', () => {
    it('should convert lowercase to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
    });

    it('should convert uppercase to title case', () => {
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
    });

    it('should convert mixed case to title case', () => {
      expect(toTitleCase('hELLo WoRLD')).toBe('Hello World');
    });

    it('should handle single word', () => {
      expect(toTitleCase('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(toTitleCase('')).toBe('');
    });
  });

  describe('enumToLabel', () => {
    it('should convert snake_case enum to readable label', () => {
      expect(enumToLabel('RISK_HIGH')).toBe('Risk High');
    });

    it('should convert all caps enum', () => {
      expect(enumToLabel('HIGH')).toBe('High');
    });

    it('should handle multiple underscores', () => {
      expect(enumToLabel('IN_PRODUCTION_NOW')).toBe('In Production Now');
    });

    it('should handle empty string', () => {
      expect(enumToLabel('')).toBe('');
    });
  });

  describe('getRiskColor', () => {
    it('should return correct colors for PROHIBITED', () => {
      const color = getRiskColor('PROHIBITED');
      expect(color).toContain('text-risk-prohibited');
      expect(color).toContain('bg-risk-prohibited/10');
      expect(color).toContain('border-risk-prohibited');
    });

    it('should return correct colors for HIGH', () => {
      const color = getRiskColor('HIGH');
      expect(color).toContain('text-risk-high');
      expect(color).toContain('bg-risk-high/10');
    });

    it('should return correct colors for LIMITED', () => {
      const color = getRiskColor('LIMITED');
      expect(color).toContain('text-risk-limited');
    });

    it('should return correct colors for MINIMAL', () => {
      const color = getRiskColor('MINIMAL');
      expect(color).toContain('text-risk-minimal');
    });

    it('should return default colors for unknown risk', () => {
      const color = getRiskColor('UNKNOWN');
      expect(color).toContain('text-muted-foreground');
    });
  });

  describe('getComplianceColor', () => {
    it('should return green for COMPLIANT', () => {
      const color = getComplianceColor('COMPLIANT');
      expect(color).toContain('text-green-600');
      expect(color).toContain('bg-green-50');
    });

    it('should return green for APPROVED', () => {
      const color = getComplianceColor('APPROVED');
      expect(color).toContain('text-green-600');
    });

    it('should return green for RESOLVED', () => {
      const color = getComplianceColor('RESOLVED');
      expect(color).toContain('text-green-600');
    });

    it('should return yellow for PARTIALLY_COMPLIANT', () => {
      const color = getComplianceColor('PARTIALLY_COMPLIANT');
      expect(color).toContain('text-yellow-600');
    });

    it('should return yellow for IN_PROGRESS', () => {
      const color = getComplianceColor('IN_PROGRESS');
      expect(color).toContain('text-yellow-600');
    });

    it('should return red for NON_COMPLIANT', () => {
      const color = getComplianceColor('NON_COMPLIANT');
      expect(color).toContain('text-red-600');
    });

    it('should return red for REJECTED', () => {
      const color = getComplianceColor('REJECTED');
      expect(color).toContain('text-red-600');
    });

    it('should return gray for NOT_ASSESSED', () => {
      const color = getComplianceColor('NOT_ASSESSED');
      expect(color).toContain('text-gray-600');
    });

    it('should return default for unknown status', () => {
      const color = getComplianceColor('UNKNOWN');
      expect(color).toContain('text-muted-foreground');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(100)).toBe('100 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(5120)).toBe('5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB'); // 1024 * 1024
      expect(formatFileSize(5242880)).toBe('5 MB'); // 5 * 1024 * 1024
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB'); // 1024 * 1024 * 1024
      expect(formatFileSize(2147483648)).toBe('2 GB');
    });

    it('should handle decimal values', () => {
      const result = formatFileSize(1536); // 1.5 KB
      expect(result).toBe('1.5 KB');
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      const elapsed = end - start;
      // Allow 10ms tolerance
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(150);
    });

    it('should return a Promise', () => {
      const result = sleep(10);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});

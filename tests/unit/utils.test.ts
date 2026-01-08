import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateShort,
  daysBetween,
  truncate,
  toTitleCase,
  enumToLabel,
  getRiskColor,
  getComplianceColor,
  formatFileSize,
} from '@/lib/utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('January 15, 2025');
    });

    it('should handle string dates', () => {
      expect(formatDate('2025-01-15')).toBe('January 15, 2025');
    });
  });

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const date = new Date('2025-01-15');
      const result = formatDateShort(date);
      expect(result).toMatch(/01\/15\/2025/);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date('2025-01-01');
      const date2 = new Date('2025-01-10');
      expect(daysBetween(date1, date2)).toBe(9);
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      expect(truncate(text, 20)).toBe('This is a very long ...');
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      expect(truncate(text, 20)).toBe('Short text');
    });
  });

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
    });
  });

  describe('enumToLabel', () => {
    it('should convert enum to readable label', () => {
      expect(enumToLabel('RISK_HIGH')).toBe('Risk High');
      expect(enumToLabel('DEPLOYMENT_STATUS')).toBe('Deployment Status');
    });
  });

  describe('getRiskColor', () => {
    it('should return correct color for risk categories', () => {
      expect(getRiskColor('PROHIBITED')).toContain('risk-prohibited');
      expect(getRiskColor('HIGH')).toContain('risk-high');
      expect(getRiskColor('LIMITED')).toContain('risk-limited');
      expect(getRiskColor('MINIMAL')).toContain('risk-minimal');
    });
  });

  describe('getComplianceColor', () => {
    it('should return correct color for compliance status', () => {
      expect(getComplianceColor('COMPLIANT')).toContain('green');
      expect(getComplianceColor('PARTIALLY_COMPLIANT')).toContain('yellow');
      expect(getComplianceColor('NON_COMPLIANT')).toContain('red');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });
});

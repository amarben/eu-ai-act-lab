import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format a date to a short string (MM/DD/YYYY)
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

/**
 * Convert enum value to readable label
 * Example: RISK_HIGH -> Risk High
 */
export function enumToLabel(value: string): string {
  if (!value) return '';
  return value
    .split('_')
    .map((word) => toTitleCase(word))
    .join(' ');
}

/**
 * Get risk color based on risk category
 */
export function getRiskColor(riskCategory: string): string {
  switch (riskCategory) {
    case 'PROHIBITED':
      return 'text-risk-prohibited bg-risk-prohibited/10 border-risk-prohibited';
    case 'HIGH':
      return 'text-risk-high bg-risk-high/10 border-risk-high';
    case 'LIMITED':
      return 'text-risk-limited bg-risk-limited/10 border-risk-limited';
    case 'MINIMAL':
      return 'text-risk-minimal bg-risk-minimal/10 border-risk-minimal';
    default:
      return 'text-muted-foreground bg-muted/10 border-muted';
  }
}

/**
 * Get compliance status color
 */
export function getComplianceColor(status: string): string {
  switch (status) {
    case 'COMPLIANT':
    case 'APPROVED':
    case 'RESOLVED':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'PARTIALLY_COMPLIANT':
    case 'IN_PROGRESS':
    case 'UNDER_REVIEW':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'NON_COMPLIANT':
    case 'REJECTED':
    case 'OPEN':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'NOT_ASSESSED':
    case 'PENDING':
    case 'DRAFT':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-muted-foreground bg-muted/10 border-muted';
  }
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

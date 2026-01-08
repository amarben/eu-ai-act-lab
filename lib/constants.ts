/**
 * Application-wide constants
 */

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  COMPLIANCE_OFFICER: 'COMPLIANCE_OFFICER',
  SYSTEM_OWNER: 'SYSTEM_OWNER',
  AUDITOR: 'AUDITOR',
  VIEWER: 'VIEWER',
} as const;

// Risk categories from EU AI Act
export const RISK_CATEGORIES = {
  PROHIBITED: 'PROHIBITED',
  HIGH: 'HIGH',
  LIMITED: 'LIMITED',
  MINIMAL: 'MINIMAL',
} as const;

// Risk category descriptions
export const RISK_CATEGORY_DESCRIPTIONS = {
  PROHIBITED: 'AI systems that pose unacceptable risks to safety, livelihoods, or rights of people',
  HIGH: 'AI systems that pose significant risks and require strict compliance measures',
  LIMITED: 'AI systems with limited risk requiring transparency obligations',
  MINIMAL: 'AI systems with minimal or no risk, subject to voluntary codes of conduct',
};

// Compliance statuses
export const COMPLIANCE_STATUSES = {
  COMPLIANT: 'COMPLIANT',
  PARTIALLY_COMPLIANT: 'PARTIALLY_COMPLIANT',
  NON_COMPLIANT: 'NON_COMPLIANT',
  NOT_ASSESSED: 'NOT_ASSESSED',
} as const;

// Deployment statuses
export const DEPLOYMENT_STATUSES = {
  DEVELOPMENT: 'DEVELOPMENT',
  TESTING: 'TESTING',
  STAGING: 'STAGING',
  PRODUCTION: 'PRODUCTION',
  MAINTENANCE: 'MAINTENANCE',
  DECOMMISSIONED: 'DECOMMISSIONED',
} as const;

// User types who interact with AI systems
export const USER_TYPES = [
  'INTERNAL_EMPLOYEES',
  'EXTERNAL_CUSTOMERS',
  'PARTNERS',
  'PUBLIC',
] as const;

// Organization sizes
export const ORGANIZATION_SIZES = {
  STARTUP: 'STARTUP',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
  ENTERPRISE: 'ENTERPRISE',
} as const;

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

// Effort estimates
export const EFFORT_ESTIMATES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
} as const;

// Document types for generation
export const DOCUMENT_TYPES = {
  TECHNICAL_DOCUMENTATION: 'technical_documentation',
  RISK_ASSESSMENT: 'risk_assessment',
  COMPLIANCE_REPORT: 'compliance_report',
  GAP_ANALYSIS: 'gap_analysis',
  GOVERNANCE_POLICY: 'governance_policy',
  INCIDENT_REPORT: 'incident_report',
} as const;

// Gemini model configuration
export const GEMINI_CONFIG = {
  MODEL: 'gemini-1.5-flash',
  MAX_TOKENS: 8000,
  TEMPERATURE: 0.7,
  RATE_LIMIT_PER_MINUTE: 15, // Free tier limit
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
} as const;

// Navigation items for dashboard
export const DASHBOARD_NAV = [
  {
    title: 'Overview',
    href: '/dashboard',
  },
  {
    title: 'AI Systems',
    href: '/dashboard/systems',
  },
  {
    title: 'Risk Classification',
    href: '/dashboard/classification',
  },
  {
    title: 'Gap Assessment',
    href: '/dashboard/gap-assessment',
  },
  {
    title: 'Governance',
    href: '/dashboard/governance',
  },
  {
    title: 'Risk Management',
    href: '/dashboard/risk-management',
  },
  {
    title: 'Documentation',
    href: '/dashboard/documentation',
  },
  {
    title: 'Training',
    href: '/dashboard/training',
  },
  {
    title: 'Incidents',
    href: '/dashboard/incidents',
  },
  {
    title: 'Monitoring',
    href: '/dashboard/monitoring',
  },
] as const;

// EU AI Act articles (key references)
export const EU_AI_ACT_ARTICLES = {
  5: 'Prohibited AI practices',
  6: 'Classification rules for high-risk AI systems',
  8: 'Compliance with requirements',
  9: 'Risk management system',
  10: 'Data and data governance',
  11: 'Technical documentation',
  12: 'Record-keeping',
  13: 'Transparency and provision of information to users',
  14: 'Human oversight',
  15: 'Accuracy, robustness and cybersecurity',
  52: 'Transparency obligations for certain AI systems',
  69: 'Codes of conduct',
} as const;

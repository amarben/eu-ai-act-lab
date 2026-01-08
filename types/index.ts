import { User, Organization, AISystem, RiskCategory, ComplianceStatus } from '@prisma/client';

// Re-export Prisma types
export type { User, Organization, AISystem, RiskCategory, ComplianceStatus };

// Extended user type with organization
export type UserWithOrganization = User & {
  organization: Organization | null;
};

// Dashboard statistics
export interface DashboardStats {
  totalAISystems: number;
  highRiskSystems: number;
  complianceScore: number;
  activeIncidents: number;
  systemsByRisk: {
    prohibited: number;
    high: number;
    limited: number;
    minimal: number;
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'system_added' | 'assessment_completed' | 'incident_logged' | 'document_generated';
  description: string;
  timestamp: Date;
  userId: string;
  user?: {
    name: string | null;
    email: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface AISystemFormData {
  name: string;
  businessPurpose: string;
  description?: string;
  technicalApproach?: string;
  primaryUsers: string[];
  deploymentStatus: string;
  deploymentDate?: Date;
  dataProcessed: string[];
  thirdPartyProviders: string[];
}

export interface RiskClassificationFormData {
  primaryCategory: RiskCategory;
  rationale: string;
  affectedPersonsCount: number;
  affectedPersonsDescription: string;
  vulnerableGroups: boolean;
  safetyImpact: boolean;
  fundamentalRightsImpact: boolean;
  useInCriticalInfrastructure: boolean;
  lawEnforcementUse: boolean;
  migrationUse: boolean;
  justiceUse: boolean;
  employmentUse: boolean;
  educationUse: boolean;
  biometricIdentification: boolean;
  emotionRecognition: boolean;
  socialScoring: boolean;
}

export interface GapAssessmentFormData {
  overallStatus: ComplianceStatus;
  findings: string;
  recommendations: string;
}

// Document generation types
export interface DocumentGenerationRequest {
  aiSystemId: string;
  documentType: 'technical_documentation' | 'risk_assessment' | 'compliance_report' | 'gap_analysis';
  includeCharts?: boolean;
  format?: 'pdf' | 'docx';
}

export interface DocumentGenerationResponse {
  documentId: string;
  url: string;
  filename: string;
  generatedAt: Date;
}

// Filter and sort types
export interface FilterOptions {
  riskCategory?: RiskCategory[];
  complianceStatus?: ComplianceStatus[];
  deploymentStatus?: string[];
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  disabled?: boolean;
  external?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

# Technical Specification
## EU AI Act Implementation Lab

**Version:** 1.0
**Date:** December 24, 2025
**Status:** Draft

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [API Specifications](#api-specifications)
5. [Authentication & Authorization](#authentication--authorization)
6. [File Storage](#file-storage)
7. [Deployment Architecture](#deployment-architecture)
8. [Development Environment](#development-environment)
9. [Testing Strategy](#testing-strategy)
10. [Performance Optimization](#performance-optimization)

---

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile Browser]
    end

    subgraph "Application Layer"
        NEXTJS[Next.js 14 App Router]
        API[API Routes]
        SSR[Server-Side Rendering]
        CLIENT[Client Components]
    end

    subgraph "Service Layer"
        AUTH[Auth Service]
        DOC[Document Service]
        GEMINI[Gemini AI Service]
        EXPORT[Export Service]
        EMAIL[Email Service]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        S3[S3 Storage]
        CACHE[Redis Cache]
    end

    subgraph "External Services"
        GEMINI_API[Gemini Flash 2.0 API]
        SMTP[Email SMTP]
        AUTH_PROVIDER[OAuth Providers]
    end

    WEB --> NEXTJS
    MOBILE --> NEXTJS
    NEXTJS --> API
    NEXTJS --> SSR
    NEXTJS --> CLIENT

    API --> AUTH
    API --> DOC
    API --> EXPORT

    DOC --> GEMINI
    GEMINI --> GEMINI_API
    EXPORT --> GEMINI

    AUTH --> AUTH_PROVIDER
    EMAIL --> SMTP

    API --> PG
    DOC --> PG
    DOC --> S3
    EXPORT --> S3
    API --> CACHE
```

### Component Architecture

```
src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   ├── signup/
│   │   └── verify-email/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── page.tsx              # Compliance dashboard
│   │   ├── organization/
│   │   ├── systems/
│   │   │   ├── page.tsx          # AI system inventory
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # System details
│   │   │   │   ├── classify/     # Classification wizard
│   │   │   │   ├── gap-assessment/
│   │   │   │   ├── governance/
│   │   │   │   ├── risk/
│   │   │   │   ├── documentation/
│   │   │   │   └── monitoring/
│   │   ├── training/
│   │   ├── policies/
│   │   └── reports/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── organizations/
│   │   ├── systems/
│   │   ├── assessments/
│   │   ├── risks/
│   │   ├── incidents/
│   │   ├── export/
│   │   └── gemini/
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── dashboard/                # Dashboard widgets
│   ├── wizards/                  # Multi-step wizards
│   └── layouts/                  # Layout components
├── lib/                          # Utility libraries
│   ├── db/                       # Database utilities
│   │   ├── prisma.ts             # Prisma client
│   │   └── queries/              # Query helpers
│   ├── auth/                     # Auth utilities
│   ├── gemini/                   # Gemini AI integration
│   ├── export/                   # Export utilities
│   ├── storage/                  # File storage
│   ├── email/                    # Email utilities
│   └── utils.ts                  # General utilities
├── types/                        # TypeScript types
│   ├── database.ts               # Database types
│   ├── api.ts                    # API types
│   └── index.ts                  # Exported types
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useSystems.ts
│   ├── useRisks.ts
│   └── useExport.ts
├── context/                      # React Context
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
└── middleware.ts                 # Next.js middleware

prisma/
├── schema.prisma                 # Prisma schema
├── migrations/                   # Database migrations
└── seed.ts                       # Database seeding

public/
├── templates/                    # Export templates
└── assets/                       # Static assets
```

---

## Technology Stack

### Core Technologies

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Frontend Framework** | Next.js | 14+ (App Router) | SSR, file-based routing, API routes, excellent performance |
| **React** | React | 18+ | Industry standard, rich ecosystem |
| **Language** | TypeScript | 5+ | Type safety, better DX |
| **Styling** | Tailwind CSS | 3+ | Utility-first, rapid development |
| **UI Components** | shadcn/ui | Latest | Accessible, customizable, modern |
| **Database** | PostgreSQL | 15+ | Relational, ACID compliant, JSON support |
| **ORM** | Prisma | 5+ | Type-safe, migrations, great DX |
| **Authentication** | NextAuth.js | 4+ | OAuth, credentials, JWT sessions |
| **AI Integration** | Gemini Flash 2.0 | Latest | Free tier, fast, good quality |
| **File Storage** | AWS S3 / Cloudflare R2 | - | Scalable, cost-effective |
| **Email** | Resend / SendGrid | - | Transactional emails |
| **Caching** | Redis | 7+ (optional) | Performance optimization |

### Development Tools

| Category | Tool | Purpose |
|----------|------|---------|
| **Package Manager** | pnpm | Fast, disk space efficient |
| **Code Quality** | ESLint + Prettier | Linting, formatting |
| **Testing** | Vitest + Playwright | Unit tests, E2E tests |
| **Git Hooks** | Husky | Pre-commit checks |
| **Documentation** | Storybook | Component documentation |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | Plausible / Umami | Privacy-friendly analytics |

---

## Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ORGANIZATION : creates
    USER ||--o{ AUDIT_LOG : generates

    ORGANIZATION ||--o{ AI_SYSTEM : owns
    ORGANIZATION ||--o{ POLICY : defines
    ORGANIZATION ||--o{ AI_LITERACY_REQUIREMENT : establishes
    ORGANIZATION ||--o{ TRAINING_RECORD : tracks
    ORGANIZATION ||--o{ SCHEDULED_REPORT : schedules

    AI_SYSTEM ||--o{ RISK_CLASSIFICATION : has
    AI_SYSTEM ||--o{ GAP_ASSESSMENT : undergoes
    AI_SYSTEM ||--o{ AI_GOVERNANCE : implements
    AI_SYSTEM ||--o{ AI_RISK_REGISTER : maintains
    AI_SYSTEM ||--o{ TECHNICAL_DOCUMENTATION : produces
    AI_SYSTEM ||--o{ INCIDENT : experiences
    AI_SYSTEM ||--o{ MONITORING_INDICATOR : monitors

    GAP_ASSESSMENT ||--o{ REQUIREMENT_ASSESSMENT : contains
    REQUIREMENT_ASSESSMENT ||--o{ EVIDENCE : supports

    AI_GOVERNANCE ||--o{ GOVERNANCE_ROLE : assigns

    AI_RISK_REGISTER ||--o{ RISK : identifies
    RISK ||--o{ MITIGATION_ACTION : mitigates
    RISK ||--o{ HUMAN_OVERSIGHT : requires

    TECHNICAL_DOCUMENTATION ||--o{ DOCUMENT_ATTACHMENT : includes
    TECHNICAL_DOCUMENTATION ||--o{ DOCUMENT_VERSION : tracks

    INCIDENT ||--o{ ACTION_ITEM : generates
    INCIDENT ||--o{ NOTIFICATION_ASSESSMENT : triggers

    MONITORING_INDICATOR ||--o{ INDICATOR_VALUE : records

    POLICY ||--o{ POLICY_VERSION : versioned
```

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String?   // null for OAuth users
  name          String?
  image         String?
  role          UserRole  @default(USER)

  // OAuth
  accounts      Account[]
  sessions      Session[]

  // Relations
  organizations Organization[]
  auditLogs     AuditLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

enum UserRole {
  USER
  ADMIN
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================================================
// ORGANIZATION
// ============================================================================

model Organization {
  id       String   @id @default(cuid())
  name     String
  industry Industry
  region   String   // EU member state code
  userRole UserRole_Org
  logoUrl  String?
  isDemo   Boolean  @default(false)

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Relations
  aiSystems              AISystem[]
  policies               Policy[]
  aiLiteracyRequirements AILiteracyRequirement[]
  trainingRecords        TrainingRecord[]
  scheduledReports       ScheduledReport[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([isDemo])
}

enum Industry {
  FINANCIAL_SERVICES
  HEALTHCARE
  MANUFACTURING
  RETAIL
  TECHNOLOGY
  PUBLIC_SECTOR
  CONSULTING
  EDUCATION
  OTHER
}

enum UserRole_Org {
  COMPLIANCE_OFFICER
  RISK_MANAGER
  DATA_PROTECTION_OFFICER
  PRODUCT_MANAGER
  AI_ENGINEER
  LEGAL_COUNSEL
  AUDITOR
  CONSULTANT
  EXECUTIVE
  OTHER
}

// ============================================================================
// AI SYSTEM
// ============================================================================

model AISystem {
  id              String           @id @default(cuid())
  organizationId  String
  name            String
  businessPurpose String           @db.Text
  primaryUsers    UserType[]
  deploymentStatus DeploymentStatus
  systemOwner     String?
  technicalContact String?
  dataCategories  DataCategory[]
  integrationPoints String?        @db.Text

  // Risk classification
  riskClassificationId String?          @unique
  riskClassification   RiskClassification? @relation(fields: [riskClassificationId], references: [id])

  // Relations
  organization          Organization           @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  gapAssessment         GapAssessment?
  aiGovernance          AIGovernance?
  aiRiskRegister        AIRiskRegister?
  technicalDocumentation TechnicalDocumentation?
  incidents             Incident[]
  monitoringIndicators  MonitoringIndicator[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([organizationId])
  @@index([deploymentStatus])
}

enum UserType {
  INTERNAL_EMPLOYEES
  EXTERNAL_CUSTOMERS
  PARTNERS
  PUBLIC
}

enum DeploymentStatus {
  PLANNING
  DEVELOPMENT
  TESTING
  PRODUCTION
  RETIRED
}

enum DataCategory {
  PERSONAL_DATA
  SENSITIVE_DATA
  BIOMETRIC_DATA
  FINANCIAL_DATA
  HEALTH_DATA
  BEHAVIORAL_DATA
  LOCATION_DATA
  NO_PERSONAL_DATA
}

// ============================================================================
// RISK CLASSIFICATION
// ============================================================================

model RiskClassification {
  id                    String       @id @default(cuid())
  category              RiskCategory
  prohibitedPractices   String[]
  highRiskCategories    String[]
  interactsWithPersons  Boolean
  reasoning             String       @db.Text
  applicableRequirements String[]
  classificationDate    DateTime     @default(now())
  overrideApplied       Boolean      @default(false)
  overrideJustification String?      @db.Text

  aiSystem AISystem?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum RiskCategory {
  PROHIBITED
  HIGH_RISK
  LIMITED_RISK
  MINIMAL_RISK
}

// ============================================================================
// GAP ASSESSMENT
// ============================================================================

model GapAssessment {
  id               String    @id @default(cuid())
  aiSystemId       String    @unique
  overallScore     Float     // 0-100
  lastAssessedDate DateTime  @default(now())

  aiSystem       AISystem                @relation(fields: [aiSystemId], references: [id], onDelete: Cascade)
  requirements   RequirementAssessment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([aiSystemId])
}

model RequirementAssessment {
  id                  String               @id @default(cuid())
  gapAssessmentId     String
  category            RequirementCategory
  title               String
  description         String               @db.Text
  regulatoryReference String
  status              ComplianceStatus     @default(NOT_STARTED)
  priority            Priority             @default(MEDIUM)
  notes               String?              @db.Text
  assignedTo          String?
  dueDate             DateTime?
  updatedBy           String

  gapAssessment GapAssessment @relation(fields: [gapAssessmentId], references: [id], onDelete: Cascade)
  evidence      Evidence[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([gapAssessmentId])
  @@index([status])
  @@index([category])
}

enum RequirementCategory {
  RISK_MANAGEMENT
  DATA_GOVERNANCE
  TECHNICAL_DOCUMENTATION
  RECORD_KEEPING
  TRANSPARENCY
  HUMAN_OVERSIGHT
  ACCURACY_ROBUSTNESS
  CYBERSECURITY
}

enum ComplianceStatus {
  NOT_STARTED
  IN_PROGRESS
  IMPLEMENTED
  NOT_APPLICABLE
}

enum Priority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

model Evidence {
  id                        String   @id @default(cuid())
  requirementAssessmentId   String
  type                      EvidenceType
  title                     String
  description               String?  @db.Text
  fileUrl                   String?
  linkUrl                   String?
  textContent               String?  @db.Text
  uploadedBy                String
  uploadedAt                DateTime @default(now())

  requirementAssessment RequirementAssessment @relation(fields: [requirementAssessmentId], references: [id], onDelete: Cascade)

  @@index([requirementAssessmentId])
}

enum EvidenceType {
  TEXT
  FILE
  LINK
}

// ============================================================================
// AI GOVERNANCE
// ============================================================================

model AIGovernance {
  id                  String  @id @default(cuid())
  aiSystemId          String  @unique
  governanceStructure String? @db.Text // JSON for org chart

  aiSystem AISystem         @relation(fields: [aiSystemId], references: [id], onDelete: Cascade)
  roles    GovernanceRole[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([aiSystemId])
}

model GovernanceRole {
  id              String             @id @default(cuid())
  aiGovernanceId  String
  roleType        GovernanceRoleType
  personName      String
  email           String
  department      String
  responsibilities String[]
  assignedDate    DateTime           @default(now())
  isActive        Boolean            @default(true)

  aiGovernance AIGovernance @relation(fields: [aiGovernanceId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([aiGovernanceId])
  @@index([roleType])
}

enum GovernanceRoleType {
  SYSTEM_OWNER
  RISK_OWNER
  HUMAN_OVERSIGHT
  DATA_PROTECTION_OFFICER
  TECHNICAL_LEAD
  COMPLIANCE_OFFICER
}

// ============================================================================
// POLICIES
// ============================================================================

model Policy {
  id                   String       @id @default(cuid())
  organizationId       String
  title                String
  type                 PolicyType
  content              String       @db.Text
  version              Int          @default(1)
  status               PolicyStatus @default(DRAFT)
  regulatoryMapping    String[]
  draftedBy            String
  draftedDate          DateTime     @default(now())
  reviewedBy           String?
  reviewedDate         DateTime?
  approvedBy           String?
  approvedDate         DateTime?
  publishedDate        DateTime?
  distributionMethod   String?
  nextReviewDate       DateTime?

  organization   Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  policyVersions PolicyVersion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([organizationId])
  @@index([type])
  @@index([status])
}

enum PolicyType {
  AI_ETHICS
  RISK_MANAGEMENT
  TRANSPARENCY
  HUMAN_OVERSIGHT
  INCIDENT_RESPONSE
  DATA_GOVERNANCE
  CUSTOM
}

enum PolicyStatus {
  DRAFT
  UNDER_REVIEW
  APPROVED
  PUBLISHED
  ARCHIVED
}

model PolicyVersion {
  id             String   @id @default(cuid())
  policyId       String
  version        Int
  versionDate    DateTime @default(now())
  versionNotes   String?  @db.Text
  savedBy        String
  snapshotData   String   @db.Text // JSON

  policy Policy @relation(fields: [policyId], references: [id], onDelete: Cascade)

  @@index([policyId])
  @@unique([policyId, version])
}

// ============================================================================
// AI RISK MANAGEMENT
// ============================================================================

model AIRiskRegister {
  id               String   @id @default(cuid())
  aiSystemId       String   @unique
  lastAssessedDate DateTime @default(now())
  assessedBy       String

  aiSystem AISystem @relation(fields: [aiSystemId], references: [id], onDelete: Cascade)
  risks    Risk[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([aiSystemId])
}

model Risk {
  id                     String             @id @default(cuid())
  riskRegisterId         String
  title                  String
  type                   RiskType
  description            String             @db.Text
  affectedStakeholders   String[]
  potentialImpact        String             @db.Text

  // Inherent risk
  likelihood             Int                // 1-5
  impact                 Int                // 1-5
  inherentRiskScore      Int                // likelihood × impact
  riskLevel              RiskLevel

  // Treatment
  treatmentDecision      TreatmentDecision?
  treatmentJustification String?            @db.Text

  // Residual risk
  residualLikelihood     Int?
  residualImpact         Int?
  residualRiskScore      Int?

  // Relations
  riskRegister      AIRiskRegister      @relation(fields: [riskRegisterId], references: [id], onDelete: Cascade)
  mitigationActions MitigationAction[]
  humanOversight    HumanOversight?

  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([riskRegisterId])
  @@index([type])
  @@index([riskLevel])
}

enum RiskType {
  BIAS
  SAFETY
  MISUSE
  TRANSPARENCY
  PRIVACY
  CYBERSECURITY
  OTHER
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}

enum TreatmentDecision {
  ACCEPT
  MITIGATE
  TRANSFER
  AVOID
}

model MitigationAction {
  id                  String       @id @default(cuid())
  riskId              String
  description         String       @db.Text
  responsibleParty    String
  dueDate             DateTime?
  status              ActionStatus @default(PLANNED)
  effectivenessRating Int?         // 1-5
  completionDate      DateTime?
  notes               String?      @db.Text

  risk Risk @relation(fields: [riskId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([riskId])
  @@index([status])
}

enum ActionStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model HumanOversight {
  id                   String              @id @default(cuid())
  riskId               String              @unique
  monitoringFrequency  MonitoringFrequency
  oversightMethod      String              @db.Text
  escalationTriggers   String[]
  overrideCapability   Boolean
  responsiblePerson    String
  effectivenessNotes   String?             @db.Text

  risk Risk @relation(fields: [riskId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([riskId])
}

enum MonitoringFrequency {
  REAL_TIME
  HOURLY
  DAILY
  WEEKLY
  MONTHLY
}

// ============================================================================
// TECHNICAL DOCUMENTATION
// ============================================================================

model TechnicalDocumentation {
  id                       String   @id @default(cuid())
  aiSystemId               String   @unique
  version                  String   @default("1.0")
  versionDate              DateTime @default(now())
  versionNotes             String?  @db.Text
  completenessPercentage   Float    @default(0)

  // Documentation sections
  intendedUse              String?  @db.Text
  foreseeableMisuse        String?  @db.Text
  systemArchitecture       String?  @db.Text
  trainingData             String?  @db.Text
  modelPerformance         String?  @db.Text
  validationTesting        String?  @db.Text
  humanOversightDoc        String?  @db.Text
  cybersecurity            String?  @db.Text

  // Metadata
  preparedBy               String
  reviewedBy               String?
  approvedBy               String?
  approvalDate             DateTime?

  // Relations
  aiSystem     AISystem             @relation(fields: [aiSystemId], references: [id], onDelete: Cascade)
  attachments  DocumentAttachment[]
  versions     DocumentVersion[]

  updatedBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([aiSystemId])
}

model DocumentAttachment {
  id                        String               @id @default(cuid())
  technicalDocumentationId  String
  fileName                  String
  fileType                  String
  fileSize                  Int                  // bytes
  fileUrl                   String
  section                   DocumentationSection
  description               String?              @db.Text
  uploadedBy                String
  uploadedAt                DateTime             @default(now())

  technicalDocumentation TechnicalDocumentation @relation(fields: [technicalDocumentationId], references: [id], onDelete: Cascade)

  @@index([technicalDocumentationId])
  @@index([section])
}

enum DocumentationSection {
  INTENDED_USE
  FORESEEABLE_MISUSE
  SYSTEM_ARCHITECTURE
  TRAINING_DATA
  MODEL_PERFORMANCE
  VALIDATION_TESTING
  HUMAN_OVERSIGHT
  CYBERSECURITY
  GENERAL
}

model DocumentVersion {
  id                        String   @id @default(cuid())
  technicalDocumentationId  String
  version                   String
  versionDate               DateTime @default(now())
  versionNotes              String?  @db.Text
  savedBy                   String
  snapshotData              String   @db.Text // JSON

  technicalDocumentation TechnicalDocumentation @relation(fields: [technicalDocumentationId], references: [id], onDelete: Cascade)

  @@index([technicalDocumentationId])
  @@unique([technicalDocumentationId, version])
}

// ============================================================================
// AI LITERACY & TRAINING
// ============================================================================

model AILiteracyRequirement {
  id              String            @id @default(cuid())
  organizationId  String
  role            String
  topics          Json              // LiteracyTopic[]
  frequency       TrainingFrequency
  durationHours   Float?
  isActive        Boolean           @default(true)

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([organizationId])
  @@index([role])
}

enum TrainingFrequency {
  ONE_TIME
  ANNUAL
  SEMI_ANNUAL
  QUARTERLY
}

model TrainingRecord {
  id                String          @id @default(cuid())
  organizationId    String
  personName        String
  role              String
  topicId           String
  topicName         String
  completionDate    DateTime?
  trainingMethod    TrainingMethod?
  durationHours     Float?
  completionEvidence String?
  notes             String?         @db.Text
  status            TrainingStatus  @default(NOT_STARTED)
  selfAttested      Boolean         @default(false)
  approvedBy        String?
  approvalDate      DateTime?
  nextDueDate       DateTime?

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([organizationId])
  @@index([personName])
  @@index([status])
}

enum TrainingMethod {
  ONLINE_COURSE
  WORKSHOP
  SELF_STUDY
  CERTIFICATION
  CONFERENCE
  OTHER
}

enum TrainingStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

// ============================================================================
// INCIDENT & MONITORING
// ============================================================================

model Incident {
  id                       String                   @id @default(cuid())
  incidentNumber           String                   @unique // e.g., INC-2025-003
  aiSystemId               String
  title                    String
  incidentDate             DateTime
  reportedDate             DateTime                 @default(now())
  reportedBy               String
  description              String                   @db.Text
  severity                 IncidentSeverity
  impact                   String                   @db.Text
  affectedUsers            String                   @db.Text
  rootCause                String?                  @db.Text
  immediateActions         String                   @db.Text
  status                   IncidentStatus           @default(OPEN)
  resolutionSummary        String?                  @db.Text
  lessonsLearned           String?                  @db.Text
  resolvedDate             DateTime?
  closedDate               DateTime?

  // Regulatory notification
  notificationRequired     Boolean                  @default(false)
  notificationSubmitted    Boolean                  @default(false)
  notificationDate         DateTime?
  authorityResponse        String?                  @db.Text

  // Relations
  aiSystem              AISystem                 @relation(fields: [aiSystemId], references: [id], onDelete: Cascade)
  notificationAssessment NotificationAssessment?
  actionItems           ActionItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([aiSystemId])
  @@index([severity])
  @@index([status])
  @@index([incidentDate])
}

enum IncidentSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum IncidentStatus {
  OPEN
  INVESTIGATING
  RESOLVED
  CLOSED
}

model NotificationAssessment {
  id                            String   @id @default(cuid())
  incidentId                    String   @unique
  isSeriousIncident             Boolean
  hasHealthSafetyImpact         Boolean
  hasFundamentalRightsViolation Boolean
  affectsHighRiskSystem         Boolean
  notificationRequired          Boolean
  assessmentDate                DateTime @default(now())
  assessedBy                    String
  notificationTemplate          String?  @db.Text
  authorityContact              String?

  incident Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([incidentId])
}

model ActionItem {
  id             String       @id @default(cuid())
  incidentId     String
  description    String       @db.Text
  assignedTo     String
  dueDate        DateTime?
  status         ActionStatus @default(PLANNED)
  completionDate DateTime?
  notes          String?      @db.Text

  incident Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([incidentId])
  @@index([status])
}

// ============================================================================
// MONITORING INDICATORS
// ============================================================================

model MonitoringIndicator {
  id                 String              @id @default(cuid())
  aiSystemId         String
  name               String
  category           IndicatorCategory
  description        String              @db.Text
  measurementMethod  String              @db.Text
  targetValue        Float?
  thresholdValue     Float?
  alertCondition     AlertCondition?
  reviewFrequency    MonitoringFrequency
  unit               String?
  isActive           Boolean             @default(true)

  aiSystem AISystem         @relation(fields: [aiSystemId], references: [id], onDelete: Cascade)
  values   IndicatorValue[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([aiSystemId])
  @@index([category])
  @@index([isActive])
}

enum IndicatorCategory {
  ACCURACY
  BIAS
  DATA_DRIFT
  USAGE
  ERROR_RATE
  USER_FEEDBACK
  CUSTOM
}

enum AlertCondition {
  ABOVE_THRESHOLD
  BELOW_THRESHOLD
  OUTSIDE_RANGE
}

model IndicatorValue {
  id                  String   @id @default(cuid())
  indicatorId         String
  value               Float
  measurementDate     DateTime @default(now())
  recordedBy          String
  notes               String?  @db.Text
  alertTriggered      Boolean  @default(false)
  relatedIncidentId   String?

  indicator MonitoringIndicator @relation(fields: [indicatorId], references: [id], onDelete: Cascade)

  @@index([indicatorId])
  @@index([measurementDate])
}

// ============================================================================
// SCHEDULED REPORTS
// ============================================================================

model ScheduledReport {
  id             String          @id @default(cuid())
  organizationId String
  reportType     ReportType
  frequency      ReportFrequency
  recipients     String[]        // Email addresses
  deliveryDay    Int             // 1-31 or day of week
  isActive       Boolean         @default(true)
  lastSentDate   DateTime?
  nextSendDate   DateTime
  createdBy      String

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([organizationId])
  @@index([isActive])
  @@index([nextSendDate])
}

enum ReportType {
  EXECUTIVE_SUMMARY
  GAP_ANALYSIS
  RISK_REPORT
  INCIDENT_LOG
  TRAINING_COMPLIANCE
  FULL_PACKAGE
}

enum ReportFrequency {
  WEEKLY
  MONTHLY
  QUARTERLY
}

// ============================================================================
// AUDIT LOG
// ============================================================================

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  action     String   // e.g., "CREATE_AI_SYSTEM", "UPDATE_RISK"
  entityType String   // e.g., "AISystem", "Risk"
  entityId   String
  changes    Json?    // Before/after values
  ipAddress  String?
  userAgent  String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

---

## API Specifications

### API Architecture

**API Pattern:** RESTful API using Next.js API Routes
**Base URL:** `/api`
**Authentication:** Bearer token (JWT) in `Authorization` header
**Response Format:** JSON

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user.

**Request Body:**
```typescript
{
  email: string;
  password: string;
  name: string;
}
```

**Response (201):**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
  };
  message: "Verification email sent";
}
```

#### POST /api/auth/login
Authenticate a user.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
}
```

#### POST /api/auth/verify-email
Verify user email.

**Request Body:**
```typescript
{
  token: string;
}
```

**Response (200):**
```typescript
{
  message: "Email verified successfully";
}
```

---

### Organization Endpoints

#### POST /api/organizations
Create a new organization.

**Request Body:**
```typescript
{
  name: string;
  industry: Industry;
  region: string;
  userRole: UserRole_Org;
  logoUrl?: string;
  isDemo?: boolean;
}
```

**Response (201):**
```typescript
{
  id: string;
  name: string;
  industry: string;
  // ... other fields
  createdAt: string;
}
```

#### GET /api/organizations/:id
Get organization details.

**Response (200):**
```typescript
{
  id: string;
  name: string;
  industry: string;
  region: string;
  userRole: string;
  logoUrl: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  aiSystemsCount: number;
}
```

#### PATCH /api/organizations/:id
Update organization.

**Request Body:** (Partial organization fields)

**Response (200):** Updated organization object

---

### AI System Endpoints

#### GET /api/systems
Get all AI systems for current user's organization.

**Query Parameters:**
- `filter`: `all | high_risk | limited_risk | minimal_risk | prohibited`
- `status`: `planning | development | testing | production | retired`
- `search`: Search query
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200):**
```typescript
{
  systems: Array<{
    id: string;
    name: string;
    businessPurpose: string;
    deploymentStatus: string;
    riskClassification: {
      category: string;
      classificationDate: string;
    } | null;
    updatedAt: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### POST /api/systems
Create a new AI system.

**Request Body:**
```typescript
{
  name: string;
  businessPurpose: string;
  primaryUsers: UserType[];
  deploymentStatus: DeploymentStatus;
  systemOwner?: string;
  technicalContact?: string;
  dataCategories: DataCategory[];
  integrationPoints?: string;
}
```

**Response (201):** AI system object

#### GET /api/systems/:id
Get AI system details with all related data.

**Response (200):**
```typescript
{
  id: string;
  name: string;
  businessPurpose: string;
  // ... other system fields
  riskClassification: RiskClassification | null;
  gapAssessment: GapAssessment | null;
  aiGovernance: AIGovernance | null;
  aiRiskRegister: AIRiskRegister | null;
  technicalDocumentation: TechnicalDocumentation | null;
  incidents: Incident[];
  monitoringIndicators: MonitoringIndicator[];
}
```

#### PATCH /api/systems/:id
Update AI system.

**Request Body:** (Partial system fields)

**Response (200):** Updated system object

#### DELETE /api/systems/:id
Delete AI system (and cascade delete all related data).

**Response (204):** No content

---

### Classification Endpoints

#### POST /api/systems/:id/classify
Classify an AI system's risk category.

**Request Body:**
```typescript
{
  prohibitedPractices: string[];
  highRiskCategories: string[];
  interactsWithPersons: boolean;
  reasoning: string;
  overrideApplied?: boolean;
  overrideJustification?: string;
}
```

**Response (200):**
```typescript
{
  id: string;
  category: RiskCategory;
  prohibitedPractices: string[];
  highRiskCategories: string[];
  interactsWithPersons: boolean;
  reasoning: string;
  applicableRequirements: string[];
  classificationDate: string;
}
```

---

### Gap Assessment Endpoints

#### GET /api/systems/:id/gap-assessment
Get gap assessment for a system.

**Response (200):**
```typescript
{
  id: string;
  aiSystemId: string;
  overallScore: number;
  lastAssessedDate: string;
  requirements: RequirementAssessment[];
}
```

#### POST /api/systems/:id/gap-assessment/requirements/:requirementId/evidence
Add evidence to a requirement.

**Request Body:**
```typescript
{
  type: EvidenceType;
  title: string;
  description?: string;
  fileUrl?: string;
  linkUrl?: string;
  textContent?: string;
}
```

**Response (201):** Evidence object

#### PATCH /api/systems/:id/gap-assessment/requirements/:requirementId
Update requirement status.

**Request Body:**
```typescript
{
  status: ComplianceStatus;
  notes?: string;
  assignedTo?: string;
  dueDate?: string;
}
```

**Response (200):** Updated requirement object

---

### Risk Management Endpoints

#### GET /api/systems/:id/risks
Get all risks for a system.

**Response (200):**
```typescript
{
  id: string;
  aiSystemId: string;
  lastAssessedDate: string;
  assessedBy: string;
  risks: Risk[];
}
```

#### POST /api/systems/:id/risks
Create a new risk.

**Request Body:**
```typescript
{
  title: string;
  type: RiskType;
  description: string;
  affectedStakeholders: string[];
  potentialImpact: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
}
```

**Response (201):** Risk object with calculated scores

#### POST /api/systems/:id/risks/:riskId/mitigation
Add mitigation action to a risk.

**Request Body:**
```typescript
{
  description: string;
  responsibleParty: string;
  dueDate?: string;
}
```

**Response (201):** Mitigation action object

#### PATCH /api/systems/:id/risks/:riskId
Update risk (including residual risk assessment).

**Request Body:** (Partial risk fields)

**Response (200):** Updated risk object

---

### Incident Endpoints

#### GET /api/incidents
Get all incidents (filterable by system, severity, status).

**Query Parameters:**
- `systemId`: Filter by AI system
- `severity`: Filter by severity
- `status`: Filter by status
- `from`: Date range start
- `to`: Date range end

**Response (200):**
```typescript
{
  incidents: Incident[];
  summary: {
    total: number;
    bySeverity: Record<IncidentSeverity, number>;
    byStatus: Record<IncidentStatus, number>;
  };
}
```

#### POST /api/incidents
Report a new incident.

**Request Body:**
```typescript
{
  aiSystemId: string;
  title: string;
  incidentDate: string;
  description: string;
  severity: IncidentSeverity;
  impact: string;
  affectedUsers: string;
  rootCause?: string;
  immediateActions: string;
}
```

**Response (201):** Incident object with auto-generated incident number

#### PATCH /api/incidents/:id
Update incident.

**Request Body:** (Partial incident fields)

**Response (200):** Updated incident object

---

### Export Endpoints

#### POST /api/export/executive-summary
Generate executive summary PDF.

**Request Body:**
```typescript
{
  organizationId: string;
  includeSystems?: string[]; // Specific systems, or all if omitted
  dateRange?: {
    from: string;
    to: string;
  };
}
```

**Response (200):**
```typescript
{
  fileUrl: string;
  expiresAt: string; // Pre-signed URL expiration
}
```

#### POST /api/export/full-package
Generate full documentation package.

**Request Body:**
```typescript
{
  organizationId: string;
  format: "pdf" | "zip"; // Single PDF or ZIP of multiple PDFs
  includeSystems?: string[];
}
```

**Response (200):**
```typescript
{
  fileUrl: string;
  expiresAt: string;
  fileSize: number;
}
```

#### POST /api/export/system-documentation
Export documentation for a specific system.

**Request Body:**
```typescript
{
  systemId: string;
  sections: string[]; // Which sections to include
}
```

**Response (200):**
```typescript
{
  fileUrl: string;
  expiresAt: string;
}
```

---

### Gemini Integration Endpoint

#### POST /api/gemini/generate
Generate AI-enhanced content (internal API).

**Request Body:**
```typescript
{
  prompt: string;
  context: Record<string, any>;
  template: string; // Template identifier
  maxTokens?: number;
}
```

**Response (200):**
```typescript
{
  generatedContent: string;
  tokensUsed: number;
}
```

---

### Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```typescript
{
  error: "Validation error",
  details: {
    field: string;
    message: string;
  }[];
}
```

**401 Unauthorized:**
```typescript
{
  error: "Unauthorized",
  message: "Invalid or expired token"
}
```

**403 Forbidden:**
```typescript
{
  error: "Forbidden",
  message: "Insufficient permissions"
}
```

**404 Not Found:**
```typescript
{
  error: "Not found",
  message: "Resource not found"
}
```

**429 Too Many Requests:**
```typescript
{
  error: "Rate limit exceeded",
  retryAfter: number; // seconds
}
```

**500 Internal Server Error:**
```typescript
{
  error: "Internal server error",
  message: "An unexpected error occurred",
  requestId: string;
}
```

---

## Authentication & Authorization

### Authentication Flow

1. **Sign Up:**
   - User submits email/password
   - Password hashed with bcrypt (12 rounds)
   - Verification email sent with unique token
   - User stored with `emailVerified: null`

2. **Email Verification:**
   - User clicks link with verification token
   - Token validated and expiration checked
   - `emailVerified` timestamp set
   - User can now log in

3. **Login:**
   - User submits email/password
   - Password verified with bcrypt
   - JWT access token generated (expires in 1 hour)
   - Refresh token stored in HTTP-only cookie (expires in 7 days)
   - Session record created in database

4. **OAuth (Google/Microsoft):**
   - Redirect to OAuth provider
   - Callback with authorization code
   - Exchange for access token
   - Create or update user record
   - Email pre-verified for OAuth users

### Authorization

**Middleware:** `middleware.ts` checks authentication on protected routes

**Protected Routes:**
- `/dashboard/*` - Requires authenticated user
- `/api/*` (except `/api/auth/*`) - Requires valid JWT

**Data Access Control:**
- Users can only access their own organizations
- Enforced at database query level:
  ```typescript
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      userId: currentUser.id // Enforce ownership
    }
  });
  ```

**Role-Based Access (Future):**
- `ADMIN`: Full access to all features
- `COMPLIANCE_OFFICER`: Read/write on all compliance data
- `CONTRIBUTOR`: Read/write on assigned systems
- `VIEWER`: Read-only access

---

## File Storage

### Storage Architecture

**Primary Storage:** AWS S3 or Cloudflare R2
**CDN:** CloudFront (for S3) or R2 default CDN

### File Categories

1. **User Uploads:**
   - Organization logos
   - Evidence attachments
   - Document attachments
   - Training certificates

2. **Generated Documents:**
   - PDF exports (executive summaries, gap reports, etc.)
   - DOCX exports
   - Excel exports

3. **Temporary Files:**
   - Files pending upload
   - Export generation work files

### Storage Structure

```
bucket-name/
├── organizations/
│   ├── {organizationId}/
│   │   ├── logo/
│   │   │   └── logo.png
│   │   ├── evidence/
│   │   │   ├── {evidenceId}.pdf
│   │   │   └── {evidenceId}.docx
│   │   ├── attachments/
│   │   │   └── {attachmentId}.pdf
│   │   ├── exports/
│   │   │   ├── executive-summary-{timestamp}.pdf
│   │   │   └── full-package-{timestamp}.zip
│   │   └── training/
│   │       └── {recordId}-certificate.pdf
└── temp/
    └── {uploadId}/
```

### File Upload Flow

1. **Client:** Request pre-signed upload URL
   - `POST /api/upload/presigned`
   - Returns pre-signed URL and upload metadata

2. **Client:** Upload file directly to S3
   - Using pre-signed URL (no server transit)
   - Max file size validated client-side

3. **Client:** Confirm upload completion
   - `POST /api/upload/complete`
   - Server validates file exists
   - Database record created with file URL

4. **Server:** Virus scanning (optional)
   - ClamAV or third-party service
   - Delete file if malware detected

### File Retention

- **User uploads:** Retained while organization active + 30 days after deletion
- **Generated exports:** Retained for 7 days, then auto-deleted
- **Temporary files:** Deleted after 24 hours

---

## Deployment Architecture

### Production Architecture

```mermaid
graph TB
    subgraph "Client"
        BROWSER[Browser]
    end

    subgraph "CDN & Edge"
        CF[Cloudflare / CloudFront]
        EDGE[Edge Functions]
    end

    subgraph "Application"
        LB[Load Balancer]
        APP1[Next.js Instance 1]
        APP2[Next.js Instance 2]
        APP3[Next.js Instance N]
    end

    subgraph "Data Tier"
        PG_PRIMARY[(PostgreSQL Primary)]
        PG_REPLICA[(PostgreSQL Replica)]
        REDIS[(Redis Cache)]
    end

    subgraph "Storage"
        S3[S3 / R2 Storage]
    end

    subgraph "External"
        GEMINI[Gemini API]
        SMTP[Email Service]
    end

    BROWSER --> CF
    CF --> EDGE
    EDGE --> LB
    LB --> APP1
    LB --> APP2
    LB --> APP3

    APP1 --> PG_PRIMARY
    APP1 --> PG_REPLICA
    APP1 --> REDIS
    APP1 --> S3
    APP1 --> GEMINI
    APP1 --> SMTP

    PG_PRIMARY --> PG_REPLICA
```

### Hosting Options

#### Option 1: Vercel (Recommended for MVP)

**Pros:**
- Zero-config deployment
- Automatic scaling
- Built-in CDN
- Edge functions
- Preview deployments
- Easy Next.js integration

**Cons:**
- Higher cost at scale
- Vendor lock-in
- Limited customization

**Configuration:**
- Database: Vercel Postgres or external (Neon, Supabase)
- Storage: Vercel Blob or S3
- Caching: Vercel KV (Redis)

#### Option 2: AWS

**Pros:**
- Full control
- Cost-effective at scale
- Rich service ecosystem
- Enterprise-grade

**Cons:**
- Complex setup
- Requires DevOps expertise

**Configuration:**
- Compute: ECS Fargate or EC2 with Auto Scaling
- Database: RDS PostgreSQL (Multi-AZ)
- Storage: S3
- Caching: ElastiCache Redis
- CDN: CloudFront
- Load Balancer: ALB

#### Option 3: Self-Hosted (Docker)

**Pros:**
- Full control
- Cost-effective
- No vendor lock-in

**Cons:**
- Requires infrastructure management
- Scaling complexity

**Configuration:**
- Docker Compose for local/single-server
- Kubernetes for production scale

---

### Environment Configuration

**.env.local (Development)**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/euaiact_dev"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.0-flash-exp"

# Storage
S3_BUCKET="eu-aiact-uploads-dev"
S3_REGION="eu-central-1"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"

# Email
SMTP_HOST="smtp.resend.com"
SMTP_PORT="587"
SMTP_USER="resend"
SMTP_PASSWORD="your-api-key"
FROM_EMAIL="noreply@euaiactlab.com"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# Monitoring
SENTRY_DSN="your-sentry-dsn"

# Analytics
ANALYTICS_ENABLED="true"
PLAUSIBLE_DOMAIN="euaiactlab.com"
```

**.env.production (Production)**
```bash
# Same structure but production values
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://app.euaiactlab.com"
# ... etc
```

---

## Development Environment

### Prerequisites

- Node.js 18+ (LTS)
- pnpm 8+
- PostgreSQL 15+
- Redis 7+ (optional, for caching)
- Git

### Setup Instructions

```bash
# 1. Clone repository
git clone https://github.com/your-org/eu-aiact-lab.git
cd eu-aiact-lab

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Start PostgreSQL (Docker)
docker run --name euaiact-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=euaiact_dev \
  -p 5432:5432 \
  -d postgres:15

# 5. Run database migrations
pnpm prisma migrate dev

# 6. Seed database (optional)
pnpm prisma db seed

# 7. Start development server
pnpm dev
```

Application runs at `http://localhost:3000`

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "test": "vitest",
    "test:e2e": "playwright test",
    "prepare": "husky install"
  }
}
```

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \
      / E2E\          10% - End-to-End (Playwright)
     /______\
    /        \
   /Integration\      30% - Integration Tests (API routes)
  /____________\
 /              \
/   Unit Tests   \    60% - Unit Tests (Components, utils)
/________________\
```

### Unit Tests (Vitest)

**What to test:**
- Utility functions
- React components (isolated)
- Form validation logic
- Data transformation functions

**Example:**
```typescript
// lib/utils/risk-score.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRiskScore, getRiskLevel } from './risk-score';

describe('calculateRiskScore', () => {
  it('should calculate risk score correctly', () => {
    expect(calculateRiskScore(5, 5)).toBe(25);
    expect(calculateRiskScore(1, 1)).toBe(1);
  });
});

describe('getRiskLevel', () => {
  it('should return correct risk level', () => {
    expect(getRiskLevel(25)).toBe('HIGH');
    expect(getRiskLevel(10)).toBe('MEDIUM');
    expect(getRiskLevel(3)).toBe('LOW');
  });
});
```

### Integration Tests (Vitest + Node test utils)

**What to test:**
- API routes
- Database operations
- Service layer logic

**Example:**
```typescript
// app/api/systems/__tests__/create-system.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '../route';

describe('POST /api/systems', () => {
  it('should create an AI system', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test System',
            businessPurpose: 'Testing',
            primaryUsers: ['INTERNAL_EMPLOYEES'],
            deploymentStatus: 'PLANNING',
            dataCategories: ['PERSONAL_DATA'],
          }),
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.name).toBe('Test System');
      },
    });
  });
});
```

### End-to-End Tests (Playwright)

**What to test:**
- Critical user flows
- Multi-step wizards
- Export generation
- Authentication flows

**Example:**
```typescript
// e2e/create-system-and-classify.spec.ts
import { test, expect } from '@playwright/test';

test('create AI system and classify as high-risk', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to systems
  await page.click('text=AI Systems');
  await page.click('text=Add AI System');

  // Fill form
  await page.fill('[name="name"]', 'Fraud Detection');
  await page.fill('[name="businessPurpose"]', 'Detect fraudulent transactions');
  await page.check('[value="INTERNAL_EMPLOYEES"]');
  await page.selectOption('[name="deploymentStatus"]', 'PRODUCTION');
  await page.check('[value="FINANCIAL_DATA"]');
  await page.click('button:has-text("Save")');

  // Classify system
  await page.click('text=Classify Now');
  await page.click('text=Next'); // Skip prohibited
  await page.check('text=Creditworthiness assessment'); // High-risk category
  await page.click('text=Next');
  await page.check('text=Yes'); // Interacts with persons
  await page.click('text=Submit Classification');

  // Verify classification
  await expect(page.locator('text=High-risk')).toBeVisible();
});
```

### Test Coverage Goals

- **Overall:** >80%
- **Critical paths:** 100% (auth, classification, export)
- **Utilities:** >90%
- **Components:** >70%

---

## Performance Optimization

### Database Optimization

1. **Indexing Strategy:**
   - Foreign keys (automatically indexed)
   - Frequently queried fields (status, dates, categories)
   - Composite indexes for common filter combinations

2. **Query Optimization:**
   - Use `select` to limit returned fields
   - Eager load related data with `include` instead of N+1 queries
   - Pagination for large result sets

3. **Connection Pooling:**
   ```typescript
   // lib/db/prisma.ts
   const prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL,
       },
     },
     log: ['query', 'error', 'warn'],
   });

   // Connection pool (for serverless)
   export const prisma = global.prisma || new PrismaClient();
   if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
   ```

### Caching Strategy

**Redis Caching (Optional):**
- Compliance dashboard data (5-minute TTL)
- Organization settings (15-minute TTL)
- AI system list (2-minute TTL)
- User sessions

**Next.js Caching:**
- Static pages: ISR (Incremental Static Regeneration)
- API routes: Response caching with `revalidate`

### Code Splitting

- Route-based code splitting (automatic with Next.js App Router)
- Dynamic imports for heavy components:
  ```typescript
  const ChartComponent = dynamic(() => import('@/components/ChartComponent'), {
    loading: () => <Spinner />,
  });
  ```

### Image Optimization

- Use Next.js `<Image>` component
- Serve images from CDN
- Lazy load images below fold
- WebP format with fallbacks

### Bundle Optimization

- Tree-shaking (automatic with Next.js)
- Remove unused dependencies
- Analyze bundle: `pnpm build && pnpm analyze`

---

## Security Considerations

### Input Validation

- Zod schemas for all user inputs
- Server-side validation (never trust client)
- Sanitize HTML inputs to prevent XSS

### SQL Injection Prevention

- Prisma ORM (parameterized queries)
- No raw SQL except where necessary (with parameterization)

### CSRF Protection

- Next.js built-in CSRF tokens
- SameSite cookie attribute

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
});

// Usage in API route
const { success } = await ratelimit.limit(userId);
if (!success) {
  return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

### File Upload Security

- Validate file types (MIME type + extension)
- Scan for malware (ClamAV)
- Limit file sizes
- Randomize file names
- Store in isolated bucket

---

**End of Technical Specification**

*This document provides the complete technical foundation for implementing the EU AI Act Implementation Lab. Refer to PRD.md for product requirements, UI_WIREFRAMES.md for user interface details, and GEMINI_INTEGRATION.md for AI document generation specifications.*

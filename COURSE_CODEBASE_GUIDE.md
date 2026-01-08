# EU AI Act Implementation Lab - Codebase Guide for Course Creation

**Date:** January 6, 2026
**Version:** 1.0
**Audience:** Online Course Creators and Instructors

---

## Table of Contents

1. [Executive Overview](#executive-overview)
2. [Application Purpose & Vision](#application-purpose--vision)
3. [Key Features & Functionality](#key-features--functionality)
4. [Technology Stack](#technology-stack)
5. [Data Model & Entities](#data-model--entities)
6. [User Workflows & Use Cases](#user-workflows--use-cases)
7. [Module-by-Module Breakdown](#module-by-module-breakdown)
8. [Important Files & Directory Structure](#important-files--directory-structure)

---

## Executive Overview

### What Is This Application?

The **EU AI Act Implementation Lab** is a comprehensive, web-based compliance tool that transforms theoretical knowledge about EU AI Act regulations into practical, audit-ready compliance artifacts. It's designed to complement online courses while also functioning as a standalone compliance sandbox for SMEs and consultants.

### Core Problem It Solves

Most EU AI Act educational content remains purely theoretical. Learners complete courses understanding the regulation but lacking:
- Practical application experience
- Usable compliance artifacts (inventories, assessments, documentation)
- Step-by-step implementation guidance
- Exportable evidence for regulatory review

### Key Differentiator

**AI-powered document generation** using Google Gemini Flash 2.0 transforms user inputs into professional, regulation-compliant documentation at each step.

---

## Application Purpose & Vision

### Product Vision Statement

> "EU AI Act Implementation Lab is a web-based learning and compliance platform that transforms theoretical EU AI Act knowledge into practical, audit-ready compliance artifacts."

### Target Users

**Primary Users:**
1. **Compliance Officers** - Need practical tools to implement requirements
2. **AI/Data Governance Professionals** - Need structured AI system classification
3. **Risk Managers** - Need AI-specific risk methodologies
4. **Internal Auditors** - Need audit-ready documentation and evidence trails
5. **Product Managers** - Need understanding of compliance requirements

**Secondary Users:** Consultants, SMEs, ISO/IEC 42001 practitioners

---

## Key Features & Functionality

### 1. Organization & Profile Management
- Set up organization details (name, industry, size, EU presence)
- Manage team members and roles
- Track organization compliance status
- Configure organizational settings

### 2. AI System Inventory
- Catalog all AI systems across organization
- Track business purpose, deployment status, data categories
- Document primary users and integration points
- Monitor system lifecycle

### 3. Risk Classification
- Guided risk classification wizard
- Classify systems into 4 EU AI Act categories:
  - **PROHIBITED** - Unacceptable risks
  - **HIGH** - Significant risks requiring strict compliance
  - **LIMITED** - Limited risk requiring transparency
  - **MINIMAL** - Minimal/no risk
- AI-powered recommendations
- Export professional classification reports

### 4. Gap Assessment
- Category-by-category compliance evaluation
- Assessment wizard with guided questions
- AI-generated gap analysis narratives
- Evidence tracking
- Export comprehensive reports (PDF/Word)

### 5. AI Governance Framework
- Build governance organizational structure
- Define roles and responsibilities
- Create AI governance policies
- Version control for policies

### 6. Risk Management
- Detailed risk register with risk scoring
- Inherent vs residual risk assessment
- Mitigation action tracking
- Human oversight documentation
- Export risk assessment reports

### 7. Technical Documentation
- Article 11-specific documentation (8 required sections):
  1. Intended purpose & reasonably foreseeable misuse
  2. Data governance documentation
  3. DPIA/RAIA results
  4. Training records
  5. Testing & validation procedures
  6. Quality assurance processes
  7. Monitoring & assessment procedures
  8. Human oversight procedures
- AI-powered content generation per section
- Document versioning
- Professional export (PDF/Word)

### 8. Training Tracking
- Define AI literacy requirements by role
- Track training completion
- Support multiple training methods
- Generate training compliance reports

### 9. Incident Logging & Management
- Create comprehensive incident reports
- Track severity levels
- Document business and compliance impact
- Root cause analysis
- Assess notification requirements to authorities
- Resolution and closure workflows

### 10. Compliance Dashboard
- Real-time compliance overview
- System inventory summary
- Compliance progress visualization
- Risk distribution charts
- Recent incidents and alerts
- Export executive summary for stakeholders

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Data Fetching:** React Query (@tanstack/react-query)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Notifications:** Sonner

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Next.js API Routes (serverless)
- **Database:** PostgreSQL 14+
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **AI Integration:** Google Gemini Flash 2.0 API

### Database
- PostgreSQL with Prisma ORM
- 40+ models representing EU AI Act concepts
- Full ACID compliance
- JSON support

### AI Integration
- **Google Gemini Flash 2.0 API**
- Document generation at each step
- Rate limited: 15 requests/minute (free tier)
- Temperature: 0.7 (balance creativity with consistency)

### Document Generation
- **DOCX:** docx library for Word documents
- **PDF:** LibreOffice command-line conversion
- **Export:** Optional AWS S3 or Cloudflare R2 storage

### Testing
- **Unit Tests:** Vitest
- **Component Tests:** React Testing Library
- **Integration Tests:** Vitest + Supertest
- **E2E Tests:** Playwright
- **Coverage:** Target >80%

---

## Data Model & Entities

### Core Relationships

```
User → Organization → AISystem

AISystem relationships:
├── RiskClassification (1-to-1)
├── GapAssessment (1-to-1)
├── AIGovernance (1-to-1)
├── AIRiskRegister (1-to-1)
├── TechnicalDocumentation (1-to-1)
├── Incidents (1-to-many)
└── MonitoringIndicators (1-to-many)

Other key models:
- TrainingRecord (tracks compliance training)
- Incident (incident logging and management)
- MonitoringIndicator (tracks system performance)
- ScheduledReport (automated reporting)
- AuditLog (compliance audit trail)
```

### Key Enums

**Risk Categories (EU AI Act):**
- PROHIBITED, HIGH, LIMITED, MINIMAL

**Deployment Status:**
- PLANNING, DEVELOPMENT, TESTING, PRODUCTION, RETIRED

**Incident Severity:**
- CRITICAL, HIGH, MEDIUM, LOW

**Compliance Status:**
- COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, NOT_ASSESSED

---

## User Workflows & Use Cases

### Workflow 1: Organization Setup (15-30 min)
Create organization profile → Set up team → Configure settings → View empty dashboard

### Workflow 2: AI System Inventory (10-20 min per system)
Navigate to AI Systems → Click Add New → Fill system details → Save to inventory

### Workflow 3: Risk Classification (20-40 min per system)
Start Risk Classification wizard → Answer guided questions → Review AI recommendation → Document decision → Export report (PDF/Word)

### Workflow 4: Gap Assessment (45-90 min per system)
Start Gap Assessment → Answer questions → System calculates score → Review Gemini-generated narrative → Get recommendations → Export report

### Workflow 5: Technical Documentation (2-6 hours total)
For each of 8 required sections: Review requirements → Input information → Review AI-generated content → Edit and refine → Attach evidence → Mark complete → Export package

### Workflow 6: Risk Management (30-60 min per risk)
Describe risk → Score inherent risk → Identify mitigations → Document human oversight → Score residual risk → Export register

### Workflow 7: Training Tracking (30-60 min setup + ongoing)
Define literacy requirements → Set frequency → Create records for team members → Track completion → Generate reports

### Workflow 8: Incident Management (20-30 min per incident)
Create report → Assess severity → Document impact → Plan remediation → Track resolution

### Workflow 9: Executive Reporting (15-30 min per report)
Navigate dashboard → Review metrics → Export Executive Summary → Share with stakeholders

---

## Module-by-Module Breakdown

| Module | Duration | Key Learning | Technical Component |
|--------|----------|--------------|-------------------|
| **1. Organization & Profile** | 15-30 min | Organizational foundation | Organization CRUD API |
| **2. AI System Inventory** | 20-30 min/system | Identify all systems | AISystem CRUD, dashboard |
| **3. Risk Classification** | 20-40 min/system | EU AI Act risk levels | Classification wizard, Gemini |
| **4. Gap Assessment** | 45-90 min/system | Compliance evaluation | Assessment API, report generator |
| **5. AI Governance** | 60-120 min | Governance frameworks | Governance API, policy creation |
| **6. Risk Management** | 30-60 min/risk | Risk identification & mitigation | Risk register, scoring, Gemini |
| **7. Technical Documentation** | 2-6 hours | Article 11 sections (8 required) | Documentation editor, Gemini |
| **8. Training Tracking** | 30-60 min setup | AI literacy programs | Training API, compliance tracking |
| **9. Incident & Dashboard** | 20-30 min/incident | Incident response & monitoring | Incident API, Dashboard analytics |

---

## Important Files & Directory Structure

### Root Level Documentation
- **README.md** - Quick start and overview
- **PRD.md** - Product requirements and business context (97KB)
- **TECHNICAL_SPEC.md** - System architecture (57KB)
- **API_DOCUMENTATION.md** - Complete API reference (52KB)
- **GEMINI_INTEGRATION.md** - AI integration guide (37KB)
- **EXPORT_SYSTEM_IMPLEMENTATION.md** - Document generation (16KB)
- **TESTING_GUIDE.md** - Testing strategy (48KB)
- **DEPLOYMENT_GUIDE.md** - Production deployment (34KB)
- **UI_WIREFRAMES.md** - Visual design (109KB)

### Critical Application Files

**Configuration:**
- `package.json` - Dependencies and scripts
- `.env.example` - Environment variable template
- `prisma/schema.prisma` - Database schema (945 lines, 40+ models)
- `prisma/seed.ts` - Demo data seeding

**Authentication:**
- `lib/auth.ts` - NextAuth configuration
- `app/auth/` - Login, signup, verification pages

**API Routes (by Module):**
```
app/api/
├── organization/          # Organization CRUD
├── systems/               # AI System CRUD
├── risk-classification/   # Risk classification
├── gap-assessment/        # Gap assessment evaluation
├── governance/            # Governance management
├── risk-management/       # Risk register and scoring
├── technical-documentation/ # Documentation generation
├── incidents/             # Incident logging
├── export/                # Document export (PDF/Word)
└── ai/                    # Gemini integration
```

**UI Components by Module:**
```
components/
├── dashboard/             # Dashboard, navigation, header
├── classification/        # Risk classification wizard
├── gap-assessment/        # Gap assessment UI
├── risk-management/       # Risk register UI
├── governance/            # Governance framework UI
├── technical-documentation/ # Documentation editor
├── incidents/             # Incident logging UI
├── settings/              # Organization and user settings
└── ui/                    # Reusable shadcn/ui components
```

**Business Logic:**
```
lib/
├── gemini.ts              # Gemini API client (Flash 2.0)
├── pdf-converter.ts       # DOCX to PDF conversion
├── document-generators/   # Report generators:
│   ├── gap-assessment-report.ts
│   ├── risk-register-report.ts
│   └── executive-summary.ts
├── constants.ts           # Risk categories, statuses, etc.
├── utils.ts               # Utility functions
└── errors.ts              # Custom error classes
```

**Database:**
- `prisma/schema.prisma` - Complete data model with 40+ models

**Testing:**
- `tests/unit/` - Unit tests
- `tests/e2e/` - Playwright E2E tests
- `tests/helpers/` - Test utilities
- `tests/demos/` - Demo video scripts
- `playwright.config.ts` - Playwright configuration
- `vitest.config.ts` - Vitest configuration

---

## Recommended Course Structure

### Course Title
**"EU AI Act Compliance Masterclass: From Theory to Implementation"**

### 10-Module Course Outline

**Module 1:** Understanding the EU AI Act
- What is the EU AI Act?
- Risk categories and obligations
- Activity: Set up in app

**Module 2:** Organization & Governance
- Organizational foundation
- Defining roles and responsibilities
- Activity: Set up organization in app

**Module 3:** AI System Identification
- Identifying AI systems
- Understanding the scope
- Activity: Create system inventory (5-10 systems)

**Module 4:** Risk Classification
- The 4 risk levels
- Classification methodology
- Activity: Classify systems, export report

**Module 5:** Gap Analysis & Planning
- Systematic compliance evaluation
- Identifying improvement areas
- Activity: Complete gap assessment, export report

**Module 6:** Building AI Governance
- Governance frameworks
- Policy development
- Activity: Design governance structure

**Module 7:** Risk Management Processes
- Risk identification and assessment
- Mitigation strategy development
- Activity: Build risk register, export report

**Module 8:** Technical Documentation (Article 11)
- The 8 critical documentation sections
- What regulators expect to see
- Activity: Complete all 8 sections (main project)

**Module 9:** Organizational Learning
- AI literacy requirements
- Training program design
- Activity: Set up training program

**Module 10:** Incident Management & Continuous Monitoring
- Incident response procedures
- Regulatory notification requirements
- Activity: Export Executive Summary, practice scenarios

**Capstone:** Complete Compliance Package
- Integrate all modules
- Create audit-ready documentation
- Deliverable: PDF compliance package

---

## Key Takeaways for Course Creators

### This Application Solves the "Theory-to-Practice Gap"

Rather than students finishing your course with only knowledge, they finish with:
- **Practical artifacts:** Real compliance documents
- **Hands-on experience:** Interactive workflows
- **Audit-ready output:** Professional PDF/Word reports
- **Continuous engagement:** Can return to update systems
- **Real-world value:** Documents can be used in actual organizations

### Teaching Points Enabled by the App

1. **Risk categorization isn't theoretical** - Students classify real systems
2. **Compliance requires documentation** - Students generate actual reports
3. **Governance is ongoing** - Dashboard shows status, not one-time checkbox
4. **AI assists but humans decide** - Gemini makes suggestions, students validate
5. **Audit readiness matters** - Export feature shows what auditors expect

### Engagement Metrics You Can Track

- % of students who create systems in app
- % who complete gap assessments
- % who export reports (shows real intent)
- Average time spent per module
- Return visits (engagement indicator)

---

## Conclusion

The EU AI Act Implementation Lab is a comprehensive, production-ready platform designed specifically to bridge the gap between theoretical EU AI Act knowledge and practical compliance implementation. By integrating hands-on use of this application into your course, you transform student learning from passive knowledge absorption into active creation of audit-ready compliance artifacts.

The 10 modules align perfectly with the practical steps organizations must take to achieve compliance, while the AI-powered document generation ensures professional-quality outputs that demonstrate real competency.


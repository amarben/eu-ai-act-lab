# EU AI Act Implementation Lab - Codebase Exploration Summary

**Exploration Date:** January 6, 2026
**Explored By:** Claude Code
**Project Location:** /Users/amarbendou/Documents/Claude/EU AI Act Lab

---

## Overview Summary

This is a **production-ready, comprehensive web application** for EU AI Act compliance implementation. It's designed to bridge the gap between theoretical knowledge and practical implementation by providing hands-on compliance workflows with AI-assisted document generation.

---

## 1. Main Purpose of the Application

The **EU AI Act Implementation Lab** transforms theoretical EU AI Act regulatory knowledge into practical, audit-ready compliance artifacts.

**Core Problem Solved:**
- Most EU AI Act educational content is purely theoretical
- Learners finish courses with knowledge but lack practical application experience
- Organizations struggle to create audit-ready compliance documentation
- Gap between understanding regulations and implementing them in practice

**Unique Solution:**
- Interactive, guided workflows for each compliance step
- AI-powered (Gemini Flash 2.0) document generation at each stage
- Exportable professional PDF/Word reports for regulators
- Hands-on practice with real compliance tasks
- Can be used standalone OR integrated into online courses

---

## 2. Key Features & Functionality (10 Core Modules)

### Module 1: Organization & Profile Management
**Purpose:** Establish organizational foundation for compliance
- Set up organization details (name, industry, size, EU presence)
- Manage team members and assign roles
- Configure compliance settings
- Track organizational compliance status

### Module 2: AI System Inventory
**Purpose:** Catalog all AI systems needing compliance review
- Create comprehensive inventory of AI systems
- Track business purpose, deployment status, data categories
- Document primary users (employees, customers, partners, public)
- Monitor system lifecycle (planning → production → retirement)
- **Course Value:** Teaches scope of compliance challenge

### Module 3: Risk Classification
**Purpose:** Classify AI systems according to EU AI Act risk levels
- Guided wizard for classification decisions
- 4 risk categories: PROHIBITED | HIGH | LIMITED | MINIMAL
- AI-powered recommendations based on system characteristics
- Evidence tracking for audit trail
- Export professional classification reports (PDF/Word)
- **Course Value:** Core EU AI Act requirement with hands-on practice

### Module 4: Gap Assessment
**Purpose:** Identify compliance gaps systematically
- Category-by-category compliance evaluation
- Assessment wizard with guided questions
- Compliance scoring by category
- AI-generated gap analysis narratives (Gemini)
- Evidence tracking for each gap
- Actionable recommendations for remediation
- Export comprehensive reports
- **Course Value:** Teaches systematic compliance evaluation

### Module 5: AI Governance Framework
**Purpose:** Build sustainable governance structures
- Define organizational governance structure
- Establish roles and responsibilities
- Create and manage governance policies
- Document governance processes
- AI-powered policy generation templates
- Version control for policies
- **Course Value:** Shows governance is ongoing, not one-time

### Module 6: Risk Management
**Purpose:** Comprehensive risk assessment and mitigation
- Detailed risk register with risk scoring
- Inherent vs. residual risk assessment
- Mitigation action identification and tracking
- Human oversight documentation
- Color-coded risk visualization (Critical/High/Medium/Low)
- Export risk assessment reports with AI narratives
- **Course Value:** Practical risk management methodology

### Module 7: Technical Documentation (MOST CRITICAL)
**Purpose:** Generate the 8 required Article 11 documentation sections
- Section 1: Intended purpose & reasonably foreseeable misuse
- Section 2: Data governance documentation
- Section 3: DPIA/RAIA results
- Section 4: Training records
- Section 5: Testing & validation procedures
- Section 6: Quality assurance processes
- Section 7: Monitoring & assessment procedures
- Section 8: Human oversight procedures
- AI-powered content generation per section
- Document versioning and history
- Professional export (PDF/Word)
- **Course Value:** The most critical deliverable - creates audit-ready documentation

### Module 8: Training Tracking
**Purpose:** Monitor AI literacy and compliance training
- Define AI literacy requirements by role
- Track training completion
- Support multiple training methods (online, workshop, certification)
- Generate training compliance reports
- Compliance status monitoring
- **Course Value:** EU AI Act requires documented AI literacy

### Module 9: Incident Logging & Management
**Purpose:** Document and manage AI system incidents
- Create comprehensive incident reports
- Track severity levels (Critical/High/Medium/Low)
- Document business and compliance impact
- Root cause analysis tracking
- Assess notification requirements to authorities
- Remediation action item management
- Resolution and closure workflows
- **Course Value:** Real-world compliance includes incident management

### Module 10: Compliance Dashboard & Executive Reporting
**Purpose:** Real-time compliance overview and stakeholder communication
- System inventory overview
- Compliance progress visualization
- Risk distribution charts
- Recent incidents and alerts
- Training compliance metrics
- Export comprehensive Executive Summary report
- **Course Value:** Shows continuous monitoring importance

---

## 3. Technology Stack

### Frontend Stack
- **Framework:** Next.js 14 with App Router (SSR, file-based routing)
- **Language:** TypeScript (type safety, better DX)
- **Styling:** Tailwind CSS + shadcn/ui (modern, accessible components)
- **State Management:** Zustand (lightweight client state)
- **Data Fetching:** React Query (caching, synchronization)
- **Forms:** React Hook Form + Zod (validation)
- **Charts:** Recharts (compliance metrics visualization)
- **Notifications:** Sonner (toast notifications)

### Backend Stack
- **Runtime:** Node.js 18+
- **Framework:** Next.js API Routes (serverless functions)
- **Database:** PostgreSQL 14+ (ACID compliance, JSON support)
- **ORM:** Prisma 5.7.1 (type-safe database access)
- **Authentication:** NextAuth.js 4.24.5 (email/password, OAuth ready)
- **AI Integration:** Google Gemini Flash 2.0 API (document generation)

### Key Dependencies
```
Core Libraries:
- @prisma/client (5.7.1) - Database access
- next-auth (4.24.5) - Authentication
- @google/generative-ai (0.2.0) - Gemini integration
- docx (8.5.0) - Word document generation
- recharts (2.10.3) - Charts for compliance metrics
- zod (3.22.4) - Schema validation
- zustand (4.4.7) - State management

UI Components:
- @radix-ui/* (various) - Accessible UI primitives
- lucide-react (0.303.0) - Icons
- sonner (2.0.7) - Toast notifications
- tailwind-merge (2.2.0) - CSS utility merging

Infrastructure:
- @upstash/ratelimit, @upstash/redis - Rate limiting & caching
- aws-sdk (2.1528.0) - AWS S3 integration
- nodemailer (6.9.7) - Email sending
- bcryptjs (2.4.3) - Password hashing
```

### Document Generation
- **DOCX Generation:** docx library (professional Word documents)
- **PDF Conversion:** LibreOffice command-line (graceful fallback to DOCX)
- **Optional Storage:** AWS S3 or Cloudflare R2 for exports

### Testing Stack
- **Unit Tests:** Vitest (fast, Vite-native)
- **Component Tests:** React Testing Library
- **Integration Tests:** Vitest + Supertest
- **E2E Tests:** Playwright 1.57.0
- **Coverage:** Target >80%

---

## 4. Data Model Overview

### Core Entities (40+ Models)

**User & Organization:**
- User (email, password, roles, organization membership)
- Organization (name, industry, size, eu_presence)
- Account (OAuth provider integration)
- Session (NextAuth sessions)

**AI System Compliance:**
- AISystem (core entity - business purpose, deployment status, data categories)
- RiskClassification (1-to-1 with AISystem - PROHIBITED|HIGH|LIMITED|MINIMAL)
- GapAssessment (1-to-1 with AISystem - compliance evaluation)
- AIGovernance (1-to-1 with AISystem - governance structure)
- AIRiskRegister (1-to-1 with AISystem - risk scoring and mitigation)
- TechnicalDocumentation (1-to-1 with AISystem - Article 11 sections)

**Risk & Compliance:**
- Risk (risk items in register, scoring, mitigation)
- MitigationAction (remediation tracking)
- Evidence (supporting documentation)

**Incidents:**
- Incident (incident reports with severity, impact, remediation)
- NotificationAssessment (regulatory notification requirements)
- ActionItem (incident remediation tasks)

**Training & Monitoring:**
- AILiteracyRequirement (AI literacy by role)
- TrainingRecord (training completion tracking)
- MonitoringIndicator (system performance metrics)
- IndicatorValue (monitoring data points)

**Audit & Reporting:**
- AuditLog (compliance audit trail)
- ScheduledReport (automated compliance reporting)

### Key Enums

**Risk Levels (EU AI Act):**
- PROHIBITED - Unacceptable risks
- HIGH - Significant risks
- LIMITED - Limited risk
- MINIMAL - Minimal/no risk

**Deployment Status:**
- PLANNING → DEVELOPMENT → TESTING → PRODUCTION → RETIRED

**Incident Severity:**
- CRITICAL, HIGH, MEDIUM, LOW

**Compliance Status:**
- COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, NOT_ASSESSED

---

## 5. User Workflows & Use Cases

### Primary User Journeys

**Workflow 1: Complete Organization Setup (15-30 minutes)**
User creates account → Creates organization → Sets up team → Configures settings → Views empty dashboard with guidance

**Workflow 2: Create AI System Inventory (10-20 min per system)**
Click "Add System" → Fill system details → Save to inventory → System appears on dashboard

**Workflow 3: Risk Classification (20-40 min per system)**
Start wizard → Answer guided questions → Review Gemini recommendation → Document decision → Export report (PDF/Word)

**Workflow 4: Gap Assessment (45-90 min per system)**
Answer compliance questions → System scores compliance → Gemini generates analysis narrative → Get recommendations → Export report

**Workflow 5: Technical Documentation (2-6 hours total)**
For each of 8 sections: Review requirements → Input information → Review AI content → Edit → Attach evidence → Mark complete → Export package

**Workflow 6: Risk Management (30-60 min per risk)**
Describe risk → Score inherent risk → Identify mitigations → Score residual risk → Export register

**Workflow 7: Training Setup (30-60 min)**
Define literacy requirements → Assign to roles → Track completion → Generate reports

**Workflow 8: Incident Management (20-30 min per incident)**
Create report → Assess severity → Assign remediation → Close incident

**Workflow 9: Executive Reporting (15-30 min)**
Review dashboard → Export Executive Summary → Share with stakeholders

---

## 6. Critical Files & Directory Structure

### Documentation (All in Root)
- **README.md** (8KB) - Quick start
- **PRD.md** (97KB) - Product requirements, user personas, success metrics
- **TECHNICAL_SPEC.md** (57KB) - Architecture, technology choices, component design
- **API_DOCUMENTATION.md** (52KB) - Complete API reference
- **GEMINI_INTEGRATION.md** (37KB) - AI integration guide
- **EXPORT_SYSTEM_IMPLEMENTATION.md** (16KB) - Document generation system
- **TESTING_GUIDE.md** (48KB) - Testing strategy
- **DEPLOYMENT_GUIDE.md** (34KB) - Production deployment
- **UI_WIREFRAMES.md** (109KB) - Visual design specifications

### Application Structure

```
EU AI Act Lab/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── organization/         # Organization CRUD
│   │   ├── systems/              # AI System CRUD
│   │   ├── risk-classification/  # Classification API
│   │   ├── gap-assessment/       # Gap assessment API
│   │   ├── governance/           # Governance API
│   │   ├── risk-management/      # Risk register API
│   │   ├── technical-documentation/
│   │   ├── incidents/            # Incident logging
│   │   ├── export/               # Document export (PDF/Word)
│   │   └── ai/                   # Gemini integration
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Protected routes
│   │   ├── page.tsx              # Main dashboard
│   │   ├── systems/              # AI systems list/detail
│   │   ├── classification/       # Risk classification
│   │   ├── gap-assessment/       # Gap assessment
│   │   ├── governance/           # Governance
│   │   ├── risk-management/      # Risk register
│   │   ├── documentation/        # Technical documentation
│   │   ├── incidents/            # Incident logging
│   │   └── settings/             # Organization settings
│   └── layout.tsx, page.tsx      # Root layout and home
│
├── components/                   # React components
│   ├── dashboard/               # Dashboard widgets
│   ├── classification/          # Classification wizard
│   ├── gap-assessment/          # Gap assessment UI
│   ├── risk-management/         # Risk register UI
│   ├── governance/              # Governance UI
│   ├── technical-documentation/ # Documentation editor
│   ├── incidents/               # Incident UI
│   ├── settings/                # Settings forms
│   ├── ui/                      # shadcn/ui components
│   └── providers.tsx            # Context providers
│
├── lib/                          # Business logic
│   ├── auth.ts                  # NextAuth configuration
│   ├── gemini.ts                # Gemini Flash 2.0 client
│   ├── pdf-converter.ts         # DOCX→PDF conversion
│   ├── document-generators/     # Report generators
│   │   ├── gap-assessment-report.ts
│   │   ├── risk-register-report.ts
│   │   └── executive-summary.ts
│   ├── constants.ts             # Risk categories, statuses
│   ├── utils.ts                 # Utility functions
│   ├── errors.ts                # Custom errors
│   └── validations/             # Zod schemas
│
├── types/                        # TypeScript definitions
│   ├── index.ts
│   ├── database.ts
│   └── api.ts
│
├── prisma/                       # Database
│   ├── schema.prisma            # Database schema (945 lines, 40+ models)
│   ├── seed.ts                  # Demo data seeding
│   └── migrations/              # Schema migrations
│
├── tests/                        # Test files
│   ├── unit/                    # Unit tests
│   ├── e2e/                     # Playwright E2E tests
│   ├── helpers/                 # Test utilities
│   └── demos/                   # Demo video scripts
│
├── public/                       # Static assets
│
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript config
├── next.config.js               # Next.js config
├── prisma.config.ts             # Prisma config
├── playwright.config.ts         # Playwright config
├── vitest.config.ts             # Vitest config
└── .env.example                 # Environment template
```

### Most Important Files for Understanding

**Database Schema:**
- `/prisma/schema.prisma` (945 lines)
  - Complete data model with 40+ models
  - Relationships between all compliance entities
  - Enums for risk categories, statuses, etc.

**API Routes:** 
- `/app/api/` directory
  - Demonstrates serverless backend pattern
  - Each module has its own CRUD routes
  - Document export routes for PDF/Word generation

**Key Components:**
- `/components/classification/risk-classification-wizard.tsx` - Core classification wizard
- `/components/dashboard/` - Dashboard widgets and navigation
- `/components/technical-documentation/documentation-editor.tsx` - Article 11 editor

**Business Logic:**
- `/lib/gemini.ts` - AI integration for document generation
- `/lib/document-generators/` - Report generation logic
- `/lib/constants.ts` - Compliance categories and enums

**UI Pages:**
- `/app/page.tsx` - Marketing/home page
- `/app/dashboard/page.tsx` - Main compliance dashboard
- `/app/dashboard/[module]/` - Individual module pages

---

## 7. Tech Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | Next.js | 14 | SSR, API routes, file-based routing |
| **Frontend Language** | TypeScript | 5+ | Type safety |
| **Frontend Styling** | Tailwind CSS | 3+ | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Accessible, customizable |
| **State Management** | Zustand | 4.4.7 | Client state |
| **Data Fetching** | React Query | 5.17.0 | Caching, sync |
| **Backend Runtime** | Node.js | 18+ | JavaScript runtime |
| **Database** | PostgreSQL | 14+ | ACID-compliant relational DB |
| **ORM** | Prisma | 5.7.1 | Type-safe database access |
| **Authentication** | NextAuth.js | 4.24.5 | OAuth, sessions |
| **AI Integration** | Gemini Flash 2.0 | Latest | Document generation |
| **Document Generation** | docx library | 8.5.0 | Word document creation |
| **PDF Conversion** | LibreOffice CLI | - | DOCX→PDF conversion |
| **Unit Tests** | Vitest | 1.1.0 | Fast unit testing |
| **E2E Tests** | Playwright | 1.57.0 | Browser automation |
| **Package Manager** | pnpm | 8.12.1 | Fast npm alternative |

---

## 8. AI Integration (Gemini Flash 2.0)

### Key Capabilities

The application uses **Google Gemini Flash 2.0 API** for:
1. **Risk Classification Recommendations** - Suggest risk level based on system characteristics
2. **Gap Analysis Narratives** - Generate executive summaries of compliance gaps
3. **Risk Assessment Narratives** - Professional risk descriptions and business impact
4. **Technical Documentation Content** - AI-assisted content for Article 11 sections
5. **Policy Generation** - Templates for governance policies
6. **Executive Summaries** - Organization-wide compliance overviews

### Configuration

```typescript
Model: gemini-2.0-flash-exp
Temperature: 0.7 (balance creativity with consistency)
Rate Limit: 15 requests/minute (free tier)
Max Tokens: 8,192 output
```

### Why Gemini Flash 2.0?

- **Free Tier:** 15 requests/minute, 1,500 requests/day
- **Speed:** 2-3 seconds typical response time
- **Quality:** Professional business document output
- **Cost:** Free tier for MVP, very low cost at scale
- **Context Window:** 1M tokens input capacity

---

## 9. Course Integration Points

### How Courses Use This Application

**Typical Course Flow:**

1. **Module 1 (Lesson):** Teach EU AI Act framework
   - **Activity:** Create organization in app

2. **Module 2 (Lesson):** Teach AI system identification
   - **Activity:** Create system inventory

3. **Module 3 (Lesson):** Teach risk categories
   - **Activity:** Classify 3+ systems

4. **Module 4 (Lesson):** Teach gap assessment
   - **Activity:** Complete gap assessment for each system

5. **Module 5 (Lesson):** Teach governance
   - **Activity:** Design governance structure

6. **Module 6 (Lesson):** Teach risk management
   - **Activity:** Build risk register

7. **Module 7 (Lesson):** Teach Article 11 documentation (8 sections)
   - **Activity:** Complete all 8 documentation sections (MAIN PROJECT)

8. **Module 8 (Lesson):** Teach training requirements
   - **Activity:** Set up training program

9. **Module 9 (Lesson):** Teach incident management
   - **Activity:** Create incident scenarios

10. **Capstone:** Deliver complete compliance package
    - **Deliverable:** PDF exports of all modules

### Course Outcomes

Students finish with:
- Practical knowledge of EU AI Act
- Hands-on experience with compliance workflows
- Audit-ready documentation (exportable PDFs)
- Working examples they can use/adapt
- Understanding of continuous compliance (not one-time)

---

## 10. Key Implementation Highlights

### Production-Ready Features

1. **Security:**
   - NextAuth.js for secure authentication
   - Password hashing with bcryptjs
   - Session management
   - CSRF protection built-in
   - Audit logging of all changes

2. **Scalability:**
   - PostgreSQL for data persistence
   - Prisma ORM for efficient queries
   - Rate limiting with Upstash
   - Optional S3/R2 for file storage
   - Vercel deployment ready

3. **Quality:**
   - TypeScript throughout
   - Comprehensive testing (unit, E2E)
   - Code linting and formatting
   - Pre-commit hooks with Husky

4. **AI Integration:**
   - Gemini Flash 2.0 for cost-effective AI
   - Professional document generation
   - Fallback strategies if API fails
   - Rate limit management

5. **Documentation:**
   - Extensive guides (PRD, Technical Spec, API docs)
   - Deployment instructions
   - Testing strategy
   - Gemini integration guide

### Developer Experience

- Modern Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for rapid styling
- shadcn/ui for accessible components
- Prisma for database operations
- Hot reload for development

---

## 11. Files You Need to Review for Course Creation

**Essential Documentation:**
1. `/README.md` - Quick start and overview
2. `/PRD.md` - Product requirements, user personas
3. `/TECHNICAL_SPEC.md` - System architecture
4. `/COURSE_CODEBASE_GUIDE.md` - This file (comprehensive guide for course creators)

**For Understanding User Workflows:**
- `/UI_WIREFRAMES.md` - Visual flows and interactions
- `/API_DOCUMENTATION.md` - API endpoints and data structures

**For Understanding AI Features:**
- `/GEMINI_INTEGRATION.md` - How Gemini is integrated
- `/EXPORT_SYSTEM_IMPLEMENTATION.md` - Document generation system

**For Understanding Deployment:**
- `/DEPLOYMENT_GUIDE.md` - How to deploy application

---

## 12. Recommended Next Steps for Course Creators

1. **Review Full Documentation**
   - Read PRD.md (product requirements, user personas)
   - Read TECHNICAL_SPEC.md (architecture overview)
   - Read COURSE_CODEBASE_GUIDE.md (detailed guide)

2. **Set Up Local Instance**
   - Follow README.md for installation
   - Create demo organization and systems
   - Practice each workflow end-to-end

3. **Design Your Course Structure**
   - Map 10 application modules to course modules
   - Design lesson → activity → assessment flow
   - Create case studies for students to work with

4. **Create Demo Videos**
   - Screen capture workflows in application
   - Demonstrate each major module
   - Show export/reporting features

5. **Develop Activities & Assessments**
   - Application usage activities
   - Document export deliverables
   - Capstone compliance package

6. **Create Case Studies**
   - Sample organizations/systems for students
   - Realistic compliance scenarios
   - Incident examples

7. **Build Learning Community**
   - Discussion forums for Q&A
   - Peer review of compliance packages
   - Shared resources

---

## Conclusion

The EU AI Act Implementation Lab is a **sophisticated, production-ready application** that effectively bridges the theory-to-practice gap in EU AI Act compliance training. By integrating hands-on use of this application into your course, you transform student learning from passive knowledge absorption into active creation of audit-ready compliance artifacts.

The application provides:
- **10 core compliance modules** that map directly to course content
- **AI-assisted document generation** for professional outputs
- **Hands-on workflows** for practical skills development
- **Export capabilities** for audit-ready deliverables
- **Continuous monitoring** teaching (not one-time checkbox)
- **Real-world value** that students can apply in their organizations

This is everything needed to create a world-class, practical EU AI Act compliance course.


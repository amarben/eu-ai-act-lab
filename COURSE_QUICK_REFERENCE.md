# EU AI Act Implementation Lab - Quick Reference for Course Creators

**Quick lookup guide for key information**

---

## Application at a Glance

| Aspect | Details |
|--------|---------|
| **Purpose** | Transform EU AI Act theory into practical, audit-ready compliance artifacts |
| **Type** | Web application with 10 core compliance modules |
| **Key Feature** | AI-powered (Gemini Flash 2.0) document generation |
| **Target Users** | Compliance officers, risk managers, auditors, product managers |
| **Deliverables** | Professional PDF/Word compliance documents |
| **Course Integration** | Hands-on practice for each course module |

---

## 10 Core Modules (Perfect for 10-Module Course)

| # | Module | Duration | Core Activity |
|---|--------|----------|----------------|
| 1 | Organization Setup | 15-30 min | Create organization profile |
| 2 | AI System Inventory | 10-20 min/system | List all AI systems |
| 3 | Risk Classification | 20-40 min/system | Classify systems (PROHIBITED\|HIGH\|LIMITED\|MINIMAL) |
| 4 | Gap Assessment | 45-90 min/system | Evaluate compliance gaps |
| 5 | AI Governance | 60-120 min | Design governance structure |
| 6 | Risk Management | 30-60 min/risk | Create risk register |
| 7 | Technical Documentation | 2-6 hours | Complete 8 Article 11 sections |
| 8 | Training Tracking | 30-60 min | Set up AI literacy program |
| 9 | Incident Management | 20-30 min/incident | Log and track incidents |
| 10 | Dashboard & Reporting | 15-30 min | Review status & export summary |

---

## Tech Stack (One Line Each)

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Next.js API Routes + NextAuth.js
- **Database:** PostgreSQL with Prisma ORM
- **AI:** Google Gemini Flash 2.0 API
- **Documents:** docx library + LibreOffice CLI (PDF conversion)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Deployment:** Vercel (recommended)

---

## File Locations (Most Important)

```
Root Documentation:
├── README.md                           # Quick start (8KB)
├── PRD.md                              # Product requirements (97KB)
├── TECHNICAL_SPEC.md                   # Architecture (57KB)
├── API_DOCUMENTATION.md                # API reference (52KB)
├── GEMINI_INTEGRATION.md               # AI integration (37KB)
├── COURSE_CODEBASE_GUIDE.md           # Detailed course guide (NEW)
└── CODEBASE_EXPLORATION_SUMMARY.md    # This summary (NEW)

Source Code (Most Relevant to Course):
├── app/dashboard/                      # Main UI pages
├── components/                         # Module-specific components
│   ├── classification/                 # Risk classification wizard
│   ├── gap-assessment/                 # Gap assessment UI
│   ├── risk-management/                # Risk register UI
│   ├── governance/                     # Governance framework UI
│   ├── technical-documentation/        # Article 11 editor
│   └── dashboard/                      # Dashboard widgets
├── lib/gemini.ts                       # AI client (Gemini Flash 2.0)
├── lib/document-generators/            # Report generation
└── prisma/schema.prisma                # Data model (40+ entities)
```

---

## Key Workflows at a Glance

### Workflow 1: Risk Classification (Core Module)
User fills form → Gemini recommends risk level → User validates → Export report

### Workflow 2: Gap Assessment (Core Module)
User answers questions → System scores compliance → Gemini generates narrative → Export report

### Workflow 3: Technical Documentation (MOST IMPORTANT)
For each of 8 sections: User inputs info → Review Gemini draft → Edit → Attach evidence → Export

### Workflow 4: Executive Reporting (Capstone)
Review dashboard metrics → Click export → Professional report generated → Share with stakeholders

---

## Data Model Essentials

### Core Entities
- **User** → belongs to **Organization**
- **Organization** → has many **AISystem**
- **AISystem** → has one each of:
  - RiskClassification (PROHIBITED|HIGH|LIMITED|MINIMAL)
  - GapAssessment (compliance evaluation)
  - AIGovernance (governance structure)
  - AIRiskRegister (risk scoring)
  - TechnicalDocumentation (Article 11 sections)
  - Incidents (incident reports)
  - MonitoringIndicators (performance tracking)

### Key Enums
- **Risk Categories:** PROHIBITED, HIGH, LIMITED, MINIMAL
- **Deployment:** PLANNING, DEVELOPMENT, TESTING, PRODUCTION, RETIRED
- **Incident Severity:** CRITICAL, HIGH, MEDIUM, LOW
- **Compliance Status:** COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, NOT_ASSESSED

---

## AI Integration (Gemini Flash 2.0)

**What It Generates:**
- Risk classification recommendations
- Gap analysis narratives
- Risk assessment descriptions
- Article 11 documentation content
- Executive summaries
- Policy templates

**Configuration:**
- Model: gemini-2.0-flash-exp
- Rate Limit: 15 req/min (free tier)
- Cost: Free tier or very low paid

---

## Course Structure Template

```
MODULE 1: Understanding EU AI Act
├── Lesson: What is the EU AI Act?
├── Activity: Create organization in app
└── Assessment: Organization profile complete

MODULE 2: AI System Identification
├── Lesson: What systems need compliance?
├── Activity: Create 5-10 systems in app
└── Assessment: Inventory screenshot

MODULE 3: Risk Classification
├── Lesson: The 4 risk levels explained
├── Activity: Classify systems using app
└── Assessment: Export classification report (PDF)

MODULE 4: Gap Assessment
├── Lesson: Systematic compliance evaluation
├── Activity: Complete gap assessment for systems
└── Assessment: Export gap report (PDF) with recommendations

MODULE 5: AI Governance
├── Lesson: Building governance structures
├── Activity: Design governance in app
└── Assessment: Governance framework document

MODULE 6: Risk Management
├── Lesson: Risk identification and mitigation
├── Activity: Create risk register
└── Assessment: Export risk report (PDF)

MODULE 7: Technical Documentation
├── Lesson: Article 11 requirements (8 sections)
├── Activity: Complete all 8 documentation sections (MAIN PROJECT)
└── Assessment: Export documentation package (PDF)

MODULE 8: Training Programs
├── Lesson: AI literacy requirements
├── Activity: Set up training program
└── Assessment: Training compliance tracking

MODULE 9: Incident Management
├── Lesson: Incident response procedures
├── Activity: Log incident scenarios
└── Assessment: Incident reports

MODULE 10: Continuous Monitoring
├── Lesson: Compliance is ongoing
├── Activity: Review dashboard metrics
└── Assessment: Export Executive Summary

CAPSTONE: Complete Compliance Package
├── Deliverable: All PDF exports combined
├── Includes: Inventory, classifications, assessments, risk register, documentation, summary
└── Grade: Rubric based on completeness and professionalism
```

---

## Getting Started as Course Creator

1. **Understand the App (30 min)**
   - Read: COURSE_CODEBASE_GUIDE.md
   - Skim: PRD.md, TECHNICAL_SPEC.md

2. **Set Up Local (1-2 hours)**
   - Follow: README.md
   - Install dependencies: `pnpm install`
   - Configure database and Gemini API key
   - Create demo organization and systems

3. **Practice Workflows (2-3 hours)**
   - Go through each of 10 modules
   - Try risk classification, gap assessment, documentation
   - Export reports in PDF format
   - Understand what students will experience

4. **Design Course (4-8 hours)**
   - Map application modules to course modules
   - Create lesson outlines
   - Design practice activities
   - Create assessment rubrics
   - Develop case studies

5. **Create Content (Variable)**
   - Write lesson content
   - Record demo videos
   - Create instructor guides
   - Write activity instructions
   - Build discussion prompts

---

## Key Success Metrics for Your Course

**Engagement:**
- % of students who create systems in app
- % who complete gap assessments
- % who export reports (shows real intent)
- Average session duration (target: >20 min)

**Outcomes:**
- % who complete capstone project
- Quality of exported compliance packages
- Student satisfaction with hands-on practice
- % who mention "practical" in reviews

---

## Important Files to Reference

| File | Purpose | Read Time |
|------|---------|-----------|
| **README.md** | Quick start and overview | 10 min |
| **PRD.md** | Product requirements, personas, vision | 30 min |
| **TECHNICAL_SPEC.md** | System architecture, tech stack | 20 min |
| **COURSE_CODEBASE_GUIDE.md** | Detailed guide for course creators | 40 min |
| **API_DOCUMENTATION.md** | Complete API reference | 20 min |
| **GEMINI_INTEGRATION.md** | AI integration guide | 15 min |
| **EXPORT_SYSTEM_IMPLEMENTATION.md** | Document generation system | 10 min |
| **UI_WIREFRAMES.md** | Visual design and user flows | 15 min |
| **TESTING_GUIDE.md** | Testing strategy | 10 min |

---

## Common Questions Answered

**Q: How much time should students spend in the app per module?**
A: 30-120 minutes per module depending on module and organization complexity. Total course: 15-30 hours hands-on practice.

**Q: Can students see other students' work?**
A: The application is organization-scoped. Instructors can create shared demo organizations for peer learning.

**Q: What documents do students export?**
A: PDF or Word reports including: Risk classifications, gap assessments, risk registers, technical documentation, executive summaries.

**Q: Can students continue after course ends?**
A: Yes! They can keep their organizations and continue implementing. The app has standalone value.

**Q: What if students don't have Gemini API access?**
A: The app gracefully falls back to templates. Students can still complete all work, just with less AI assistance.

**Q: How do I grade the capstone project?**
A: Create rubric based on: completeness of all 10 modules, quality of documentation, evidence of understanding, professional presentation of exports.

---

## Resources & Links

**Official Documentation:**
- All in `/` root directory
- Detailed guides in README.md

**Tech Stack Docs:**
- Next.js: nextjs.org
- TypeScript: typescriptlang.org
- Prisma: prisma.io
- Gemini: ai.google.dev
- shadcn/ui: ui.shadcn.com

**EU AI Act Resources:**
- Official: artificialintelligenceact.eu
- NIST AI: nist.gov/ai-risk-management-framework

---

## Final Notes

This is a **production-ready application** that's been designed specifically to bridge the theory-to-practice gap in EU AI Act compliance training. Every feature exists to help students:

1. Understand the regulation through hands-on practice
2. Create real compliance artifacts
3. See professional documentation quality
4. Experience continuous compliance (not one-time)
5. Leave with audit-ready deliverables

Your course, combined with this application, creates a powerful learning experience where students finish with both knowledge AND practical deliverables they can use in their organizations.

**Good luck with your course creation!**


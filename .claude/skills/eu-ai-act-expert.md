# EU AI Act Implementation Lab - Expert Skill

Expert guidance for working on the EU AI Act Implementation Lab project, including course creation, demo video generation, and compliance module development.

## Project Overview

The EU AI Act Implementation Lab is a comprehensive web application that helps organizations achieve compliance with the EU AI Act regulation. It includes:

- **Risk Classification** - Assess AI systems against prohibited practices and high-risk categories
- **Gap Assessment** - Evaluate compliance across 8 EU AI Act requirement categories (24 total requirements)
- **Governance Framework** - Define AI governance structure, roles, and policies
- **Risk Management** - Track AI risks and mitigation actions
- **Technical Documentation** - Maintain Article 11 technical documentation
- **Incident Management** - Report and manage serious incidents per Article 73

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Testing**: Playwright for E2E tests and demo video generation
- **Deployment**: Port 4000 (configured in CLAUDE.md and playwright.config.ts)

## Course Structure

### Complete Lecture Series (9 Lectures)

All lecture files are located in `/course/` directory:

1. **Lecture-01-Introduction.md** (16K) - Course overview and learning objectives
2. **Lecture-02-Understanding-EU-AI-Act.md** (19K) - Legislative background and key concepts
3. **Lecture-03-Risk-Classification.md** (21K) - Risk classification methodology
4. **Lecture-04-Gap-Assessment.md** (23K) - Compliance gap assessment workflow
5. **Lecture-05-Governance.md** (25K) - AI governance framework implementation
6. **Lecture-06-Risk-Management.md** (26K) - Risk assessment and mitigation
7. **Lecture-07-Technical-Documentation.md** (29K) - Article 11 documentation requirements
8. **Lecture-08-Incident-Management.md** (28K) - Serious incident reporting
9. **Lecture-09-Conclusion.md** (24K) - Course wrap-up and next steps

**Total Content**: 180K+ words, professionally formatted for Udemy/Coursera platforms

### Lecture Content Structure

Each lecture follows the professional online course format:

```markdown
# [Module Title]

## Introduction (200-300 words)
- Opening narration paragraph
- Learning objectives overview
- Module context

## Slide 1: [Topic]
**Visual**: [Description of what appears on slide]
**Instructor Notes**: [Professional narration in paragraph form, 200-500 words]

## Slide 2-N: [More Topics]
[Same format repeated]

## Video Demo: [Practical Demonstration]
**Demo Script**: [Step-by-step screen-guided narration using "we" language]

## Practical Assignment
**Objective**: [Real-world task]
**Tasks**: [Structured checklist]
**Expected Outcome**: [Professional deliverable]

## Conclusion (150-250 words)
- Summary paragraph
- Key takeaways
- Next steps
```

**Key Content Principles**:
- Use flowing narrative paragraphs (not bullet points)
- Write in instructor narration style ("In this lecture, we will explore...")
- Use "we" language for demos ("Let's navigate to...", "Now we'll click...")
- Formal vocabulary with multi-clause sentences
- Connected language between sections

## Demo Video Generation System

### Demo Video Files

All demo test specs are in `/tests/demos/` directory:

- **gap-assessment-demo.spec.ts** - Gap assessment workflow (Lecture 4)
- **governance-demo.spec.ts** - Governance framework setup (Lecture 5)
- **risk-management-demo.spec.ts** - Risk tracking workflow (Lecture 6)
- **technical-documentation-demo.spec.ts** - Article 11 documentation (Lecture 7)
- **incidents-demo.spec.ts** - Incident reporting and notification (Lecture 8)
- **risk-classification.spec.ts** - Risk classification process (Lecture 3)

Generated videos are stored in `/demo-videos/`:

- `03-gap-assessment.webm` (13M) - 6 text field interactions
- `04-governance.webm` (12M) - 10 text field interactions
- `05-incidents.webm` (22M) - 5 text field interactions
- `06-risk-management.webm` (11M) - Navigation and viewing
- `07-technical-documentation.webm` (22M) - Navigation and scrolling

### Recording Configuration

**Playwright Config** (`playwright.config.ts`):
```typescript
use: {
  baseURL: 'http://localhost:4000',
  viewport: { width: 1920, height: 1080 },
  video: {
    mode: 'on',
    size: { width: 1920, height: 1080 }, // Full HD quality
  },
}
```

**DEMO_SPEED Environment Variable**:
- `fast` - 0.5x multiplier (development/testing)
- `normal` - 1.0x multiplier (default)
- `slow` - 2.0x multiplier (production video recording)

**Command Format**:
```bash
# Development (fast)
npx playwright test tests/demos/[demo-name].spec.ts --headed

# Production video recording (slow)
DEMO_SPEED=slow npx playwright test tests/demos/[demo-name].spec.ts --headed --project=chromium
```

### Cursor Tracking System

All demos use professional cursor tracking for video appearance:

**Helper Functions** (from `/tests/helpers/cursor-tracker.ts`):

```typescript
// Initial injection after login
await enableCursorTracking(page);

// Re-inject after navigation (DOM clears on page.goto())
await reEnableCursorTracking(page);

// Smooth cursor movement + click
await smoothClick(page, locator);

// Smooth cursor movement + visible typing
await smoothType(page, locator, 'Text to type');
```

**Implementation Details**:
- Red semi-transparent circle (20px diameter, 50% opacity)
- Follows all mouse movements via `mousemove` event
- Injected into DOM via `page.evaluate()`
- Must be re-enabled after `page.goto()` navigation
- Uses `.pressSequentially(text, {delay: wait(50)})` for typing animation

### Demo Test Structure

All demo tests follow this pattern:

```typescript
test.describe('Module Demo', () => {
  test.setTimeout(timeout(900000)); // 15 min base = 30 min with DEMO_SPEED=slow

  test.beforeAll(async () => {
    await seedAdminDemoUser();
    await cleanupTestData();
    await seedModuleDemoData();
  });

  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('should demonstrate complete workflow', async ({ page }) => {
    logSpeedConfig();
    await enableCursorTracking(page);

    // Scene 1: Login
    await login(page);
    await page.waitForTimeout(wait(2000));

    // Scene 2: Navigation
    await page.goto('/dashboard/module');
    await page.waitForLoadState('networkidle');
    await reEnableCursorTracking(page); // Critical after goto!
    await page.waitForTimeout(wait(3000));

    // Scene 3: Interactions
    await smoothClick(page, page.getByTestId('button'));
    await smoothType(page, page.getByLabel('Field'), 'Input text');

    // Etc...
  });
});
```

### Common Demo Issues and Solutions

#### Issue 1: Strict Mode Violations

**Problem**: `Error: strict mode violation: getByRole() resolved to 2 elements`

**Solution**: Add `.first()` or `.nth(index)` to selector:
```typescript
// BEFORE (fails if multiple matches)
await page.getByRole('heading', { name: 'Title' }).click();

// AFTER (works with multiple matches)
await page.getByRole('heading', { name: 'Title' }).first().click();
```

**Example**: technical-documentation-demo.spec.ts had 4 heading selectors that needed `.first()`

#### Issue 2: Timeout on Long Demos

**Problem**: Demo times out at ~35 minutes with base timeout of 300000ms (5 min)

**Root Cause**: DEMO_SPEED=slow doubles all waits, making demos take 35-40 minutes

**Solution**: Increase base timeout to 900000ms (15 min base = 30 min with slow):
```typescript
test.setTimeout(timeout(900000)); // 15 minutes base
```

#### Issue 3: Cursor Disappears After Navigation

**Problem**: Cursor tracking stops working after `page.goto()`

**Root Cause**: DOM is cleared on navigation, removing injected cursor element

**Solution**: Always call `reEnableCursorTracking(page)` after `page.goto()`:
```typescript
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');
await reEnableCursorTracking(page); // Critical!
```

#### Issue 4: Multiple Tests Cause Database Conflicts

**Problem**: Login fails with navigation timeout when running multiple demos simultaneously

**Root Cause**: Database seeding conflicts between parallel test runs

**Solution**: Run demos sequentially, not in parallel:
```bash
# WRONG - causes conflicts
DEMO_SPEED=slow npx playwright test tests/demos/ --headed

# RIGHT - run one at a time
DEMO_SPEED=slow npx playwright test tests/demos/incidents-demo.spec.ts --headed
```

#### Issue 5: Video Not Generated

**Problem**: Test passes but no video file found in test-results

**Root Cause**: Video recording requires `--headed` flag and correct playwright.config.ts settings

**Solution**: Always use `--headed` flag for recording:
```bash
DEMO_SPEED=slow npx playwright test tests/demos/[demo].spec.ts --headed --project=chromium
```

### Video File Management

**Finding Generated Videos**:
```bash
# Videos are in deep test-results folders with hashed names
find test-results -name "video.webm" -type f

# Example output:
test-results/demos-incidents-demo-Incid-6fab8-ncident-management-workflow-chromium/video.webm
```

**Copying to Demo Videos Folder**:
```bash
cp "test-results/[long-hashed-path]/video.webm" "demo-videos/05-incidents.webm"
```

**Naming Convention**:
- `03-gap-assessment.webm` - Matches Lecture 3 (Risk Classification)
- `04-governance.webm` - Matches Lecture 4 (Gap Assessment)
- `05-incidents.webm` - Matches Lecture 5 (Governance)
- `06-risk-management.webm` - Matches Lecture 6 (Risk Management)
- `07-technical-documentation.webm` - Matches Lecture 7 (Technical Documentation)

**Note**: Numbering is offset because Lectures 1-2 are introductory content without demos

## Database Seeding for Demos

Each demo requires specific seeded data:

### Common Seeds (All Demos)

```typescript
await seedAdminDemoUser(); // Creates demo@example.com user
await cleanupTestData(); // Removes old test data
```

### Module-Specific Seeds

**Gap Assessment**:
```typescript
await createTestAISystem(organizationId, {
  name: 'AI Recruitment Assistant',
  businessPurpose: 'Automated resume screening',
  deploymentStatus: 'PRODUCTION',
});
await createTestRiskClassification(systemId, {
  category: 'HIGH_RISK',
  highRiskCategories: ['Employment, workers management'],
});
```

**Governance**:
```typescript
await seedDashboardDemoData(); // Creates AI systems
await seedGovernanceDemoData(); // Creates governance framework
```

**Risk Management**:
```typescript
await seedDashboardDemoData(); // Creates AI systems
await seedRiskManagementDemoData(); // Creates risks and mitigation actions
```

**Technical Documentation**:
```typescript
await seedDashboardDemoData(); // Creates AI systems
await seedTechnicalDocumentationDemoData(); // Creates documentation records
```

**Incidents**:
```typescript
await seedIncidentDemoData(); // Creates incident records
```

## Best Practices

### Demo Recording Workflow

1. **Clean old processes**: Kill any running Playwright tests
2. **Run headless first**: Test with `npx playwright test` (no --headed) for quick validation
3. **Record with slow mode**: Use `DEMO_SPEED=slow npx playwright test --headed` for final video
4. **Verify video quality**: Check video.webm file size (should be 10-25M for 4-10 min demos)
5. **Copy to demo-videos**: Use consistent naming convention
6. **Sequential execution**: Never run multiple demos in parallel (causes DB conflicts)

### Test Development Workflow

1. **Use TestIDs**: Prefer `getByTestId()` over role/text selectors for reliability
2. **Add cursor tracking early**: Include `enableCursorTracking()` and `reEnableCursorTracking()` from the start
3. **Use smoothClick/smoothType**: Always use smooth helpers instead of direct `.click()` or `.fill()`
4. **Test strict mode**: Run tests to catch multiple element matches early
5. **Set generous timeouts**: Use 900000ms base for demos with many scenes
6. **Verify assertions**: Use `await expect().toBeVisible()` to confirm UI state

### Content Creation Workflow

1. **Structure first**: Define lecture structure with slide titles and key points
2. **Write narratives**: Create flowing paragraph content (200-500 words per slide)
3. **Add demo scripts**: Write step-by-step narration using "we" language
4. **Create assignments**: Define practical tasks with structured outcomes
5. **Review flow**: Ensure smooth transitions between sections
6. **Check length**: Aim for 15-25 min per lecture (3K-5K words)

## Key Files Reference

### Configuration Files

- `/playwright.config.ts` - Playwright test configuration (port 4000, video settings)
- `/CLAUDE.md` - Project-specific instructions (always run server on port 4000)
- `/.env.local` - Environment variables for database and auth

### Test Helper Files

- `/tests/helpers/auth.ts` - Login helper function
- `/tests/helpers/cursor-tracker.ts` - Cursor tracking and smooth interaction helpers
- `/tests/helpers/demo-config.ts` - DEMO_SPEED configuration and wait() helper
- `/tests/helpers/database.ts` - Database seeding and cleanup functions

### Demo Test Files

- `/tests/demos/gap-assessment/gap-assessment-demo.spec.ts` - Gap assessment demo
- `/tests/demos/governance-demo.spec.ts` - Governance framework demo
- `/tests/demos/risk-management-demo.spec.ts` - Risk management demo
- `/tests/demos/technical-documentation-demo.spec.ts` - Technical documentation demo
- `/tests/demos/incidents-demo.spec.ts` - Incident management demo
- `/tests/demos/risk-classification.spec.ts` - Risk classification demo

### Course Content Files

- `/course/Lecture-01-Introduction.md` through `/course/Lecture-09-Conclusion.md`
- All lectures follow consistent formatting for online learning platforms

### Generated Assets

- `/demo-videos/*.webm` - Professional demo videos with cursor tracking
- `/test-results/` - Playwright test results and raw video files (auto-generated)

## Quick Commands Reference

```bash
# Start development server
PORT=4000 npm run dev

# Run demo test (development - fast)
npx playwright test tests/demos/[demo-name].spec.ts --headed

# Record demo video (production - slow with cursor tracking)
DEMO_SPEED=slow npx playwright test tests/demos/[demo-name].spec.ts --headed --project=chromium

# Find generated video files
find test-results -name "video.webm" -type f

# Copy video to demo folder
cp "test-results/[path]/video.webm" "demo-videos/[number]-[name].webm"

# Database operations
npx prisma db push  # Apply schema changes
npm run db:seed     # Seed database with demo data

# Kill background processes
killall node        # Kill all Node processes (use with caution!)
```

## Course Completion Status

**✅ ALL LECTURES COMPLETE** (9/9)
**✅ ALL DEMO VIDEOS COMPLETE** (5/5 main modules)
**✅ COURSE 100% READY FOR PRODUCTION**

Total course content:
- 180K+ words of professional lecture content
- 99M of demo video files (Full HD 1920x1080)
- 5 main module demos with cursor tracking and visible typing
- Professional formatting for Udemy/Coursera platforms
- Complete assignments and practical exercises

## When to Use This Skill

Invoke this skill when:

- Creating new demo videos for course modules
- Updating existing demos with cursor tracking or smooth typing
- Troubleshooting Playwright test failures in demo recordings
- Writing new lecture content following the established format
- Understanding the EU AI Act compliance module structure
- Debugging video generation or timeout issues
- Setting up database seeding for new demo scenarios
- Planning course structure or content updates
- Checking completion status or next steps

## Related Global Skills

This skill complements the global skills available in all projects:

- **`/playwright-expert`** - General Playwright testing and automation guidance
- **`/document-generation-expert`** - Document generation and PDF export workflows
- **`/course-creator-expert`** - General online course creation guidance

This EU AI Act skill provides project-specific context, patterns, and workflows that build on those global foundations.

---

**Last Updated**: January 7, 2025
**Status**: Course complete, all demos recorded with cursor tracking
**Contact**: For questions about course content or demo videos, refer to this skill documentation

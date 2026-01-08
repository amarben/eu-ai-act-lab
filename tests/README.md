# Playwright Demo Tests

This directory contains automated demo tests for the EU AI Act Implementation Lab.

## Running Tests

### Fast Development Mode
```bash
DEMO_SPEED=fast npx playwright test tests/demos/
```

### Generate Demo Videos
```bash
DEMO_SPEED=slow npx playwright test tests/demos/ai-system-creation.spec.ts --headed
```

## Test Data Management

### Why Multiple AI Systems Appear

Each test run creates a new "AI Recruitment Assistant" in the database. Over multiple test runs, duplicates accumulate.

### Manual Cleanup (Recommended)

Before generating demo videos, run the cleanup script to start with a clean slate:

```bash
npx tsx scripts/cleanup-test-data.ts
```

This will delete all test AI systems named "AI Recruitment Assistant" and show you how many were removed.

### Test Structure

```
tests/
├── demos/                          # Demo test scripts
│   ├── ai-system-creation.spec.ts  # Full AI system creation workflow
│   └── ai-system-creation.smoke.spec.ts  # TestID verification
├── helpers/                        # Test utilities
│   ├── auth.ts                     # Authentication helper
│   ├── cursor-tracker.ts           # Professional cursor animations
│   ├── demo-config.ts              # Speed configuration
│   ├── database.ts                 # Database cleanup utilities
│   └── seed-data.ts                # Consistent test data
└── README.md                       # This file

scripts/
└── cleanup-test-data.ts            # Manual cleanup script
```

## Demo Speed Configuration

Control demo speed with the `DEMO_SPEED` environment variable:

- **`DEMO_SPEED=fast`** - 0.2x speed (~9s) - Development & debugging
- **`DEMO_SPEED=normal`** - 1x speed (~30s) - Quick previews
- **`DEMO_SPEED=slow`** - 2x speed (~1m) - Professional videos

The multiplier applies to all `wait()` calls in the demo scripts.

## Best Practices for Demo Videos

1. **Clean up test data first**:
   ```bash
   npx tsx scripts/cleanup-test-data.ts
   ```

2. **Run tests headless first** to verify they pass:
   ```bash
   DEMO_SPEED=fast npx playwright test tests/demos/
   ```

3. **Generate video** with slow speed:
   ```bash
   DEMO_SPEED=slow npx playwright test tests/demos/ai-system-creation.spec.ts --headed
   ```

4. **Find the video** in `test-results/`:
   ```bash
   find test-results -name "*.webm"
   ```

## Troubleshooting

### "Multiple AI Recruitment Assistants appear"
Run the cleanup script before generating videos.

### "Tests fail at login"
Check that the development server is running on port 4000:
```bash
PORT=4000 npm run dev
```

### "Database connection error"
Ensure `.env.local` exists with valid `DATABASE_URL`.

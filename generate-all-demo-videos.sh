#!/bin/bash

# Generate All Demo Videos Script
# This script generates professional demo videos for all workflow steps
# and saves them to the demo-videos directory

set -e  # Exit on error

echo "======================================"
echo "EU AI Act Lab - Demo Video Generation"
echo "======================================"
echo ""

# Create demo-videos directory if it doesn't exist
mkdir -p demo-videos

# Step 0: Dashboard Overview (Intro) - TEMPORARILY SKIPPED DUE TO TIMEOUT ISSUES
# TODO: Fix dashboard demo timeout with DEMO_SPEED=slow
# echo "📹 [0/9] Generating Dashboard Overview demo..."
# for i in {1..3}; do
#     if DEMO_SPEED=slow npx playwright test tests/demos/dashboard-demo.spec.ts --project=chromium --headed --reporter=list; then
#         break
#     fi
#     if [ $i -lt 3 ]; then
#         echo "⚠️  Attempt $i failed, retrying..."
#         sleep 2
#     else
#         echo "❌ Error: Dashboard Overview demo failed after 3 attempts"
#         exit 1
#     fi
# done
# VIDEO_PATH=$(find test-results -name "video.webm" -type f | head -1)
# if [ -n "$VIDEO_PATH" ]; then
#     cp "$VIDEO_PATH" demo-videos/00-dashboard-overview.webm
#     echo "✅ Saved: demo-videos/00-dashboard-overview.webm"
# else
#     echo "❌ Error: Video not found for Dashboard Overview"
#     exit 1
# fi
# echo ""

echo "⏭️  [0/9] Skipping Dashboard Overview (timeout issues with DEMO_SPEED=slow)"
echo ""

# Step 1: AI System Creation
echo "📹 [1/9] Generating AI System Creation demo..."

# Retry logic (up to 3 attempts)
for i in {1..3}; do
    if DEMO_SPEED=slow npx playwright test tests/demos/ai-system-creation.spec.ts --project=chromium --headed --reporter=list; then
        break
    fi
    if [ $i -lt 3 ]; then
        echo "⚠️  Attempt $i failed, retrying..."
        sleep 2
    else
        echo "❌ Error: AI System Creation demo failed after 3 attempts"
        exit 1
    fi
done

# Find and copy the video
VIDEO_PATH=$(find test-results -name "video.webm" -type f | head -1)
if [ -n "$VIDEO_PATH" ]; then
    cp "$VIDEO_PATH" demo-videos/01-ai-system-creation.webm
    echo "✅ Saved: demo-videos/01-ai-system-creation.webm"
else
    echo "❌ Error: Video not found for AI System Creation"
    exit 1
fi

echo ""

# Step 2: Risk Classification
echo "📹 [2/9] Generating Risk Classification demo..."

# Retry logic (up to 3 attempts)
for i in {1..3}; do
    if DEMO_SPEED=slow npx playwright test tests/demos/risk-classification-demo.spec.ts --project=chromium --headed --reporter=list; then
        break
    fi
    if [ $i -lt 3 ]; then
        echo "⚠️  Attempt $i failed, retrying..."
        sleep 2
    else
        echo "❌ Error: Risk Classification demo failed after 3 attempts"
        exit 1
    fi
done

VIDEO_PATH=$(find test-results -name "video.webm" -type f | head -1)
if [ -n "$VIDEO_PATH" ]; then
    cp "$VIDEO_PATH" demo-videos/02-risk-classification.webm
    echo "✅ Saved: demo-videos/02-risk-classification.webm"
else
    echo "❌ Error: Video not found for Risk Classification"
    exit 1
fi

echo ""

# Step 3: Gap Assessment
echo "📹 [3/9] Generating Gap Assessment demo..."

# Retry logic (up to 3 attempts)
for i in {1..3}; do
    if DEMO_SPEED=slow npx playwright test tests/demos/gap-assessment/gap-assessment-demo.spec.ts --project=chromium --headed --reporter=list; then
        break
    fi
    if [ $i -lt 3 ]; then
        echo "⚠️  Attempt $i failed, retrying..."
        sleep 2
    else
        echo "❌ Error: Gap Assessment demo failed after 3 attempts"
        exit 1
    fi
done

VIDEO_PATH=$(find test-results -name "video.webm" -type f | head -1)
if [ -n "$VIDEO_PATH" ]; then
    cp "$VIDEO_PATH" demo-videos/03-gap-assessment.webm
    echo "✅ Saved: demo-videos/03-gap-assessment.webm"
else
    echo "❌ Error: Video not found for Gap Assessment"
    exit 1
fi

echo ""

# Step 4: Governance
echo "📹 [4/9] Generating Governance demo..."

# Retry logic (up to 3 attempts)
for i in {1..3}; do
    if DEMO_SPEED=slow npx playwright test tests/demos/governance/governance-demo.spec.ts --project=chromium --headed --reporter=list; then
        break
    fi
    if [ $i -lt 3 ]; then
        echo "⚠️  Attempt $i failed, retrying..."
        sleep 2
    else
        echo "❌ Error: Governance demo failed after 3 attempts"
        exit 1
    fi
done

VIDEO_PATH=$(find test-results -name "video.webm" -type f | head -1)
if [ -n "$VIDEO_PATH" ]; then
    cp "$VIDEO_PATH" demo-videos/04-governance.webm
    echo "✅ Saved: demo-videos/04-governance.webm"
else
    echo "❌ Error: Video not found for Governance"
    exit 1
fi

echo ""

# Step 5: Incidents
echo "📹 [5/9] Generating Incidents demo..."

# Retry logic (up to 3 attempts)
for i in {1..3}; do
    if DEMO_SPEED=slow npx playwright test tests/demos/incidents-demo.spec.ts --project=chromium --headed --reporter=list; then
        break
    fi
    if [ $i -lt 3 ]; then
        echo "⚠️  Attempt $i failed, retrying..."
        sleep 2
    else
        echo "❌ Error: Incidents demo failed after 3 attempts"
        exit 1
    fi
done

VIDEO_PATH=$(find test-results -name "video.webm" -type f | head -1)
if [ -n "$VIDEO_PATH" ]; then
    cp "$VIDEO_PATH" demo-videos/05-incidents.webm
    echo "✅ Saved: demo-videos/05-incidents.webm"
else
    echo "❌ Error: Video not found for Incidents"
    exit 1
fi

echo ""

# Step 6: Risk Management
echo "📹 [6/9] Generating Risk Management demo..."

# Retry logic (up to 3 attempts)
for i in {1..3}; do
    if DEMO_SPEED=slow npx playwright test tests/demos/risk-management-demo.spec.ts --project=chromium --headed --reporter=list; then
        break
    fi
    if [ $i -lt 3 ]; then
        echo "⚠️  Attempt $i failed, retrying..."
        sleep 2
    else
        echo "❌ Error: Risk Management demo failed after 3 attempts"
        exit 1
    fi
done

VIDEO_PATH=$(find test-results -name "video.webm" -type f | head -1)
if [ -n "$VIDEO_PATH" ]; then
    cp "$VIDEO_PATH" demo-videos/06-risk-management.webm
    echo "✅ Saved: demo-videos/06-risk-management.webm"
else
    echo "❌ Error: Video not found for Risk Management"
    exit 1
fi

echo ""

# Step 7: Technical Documentation
echo "📹 [7/9] Generating Technical Documentation demo..."

# Retry logic (up to 3 attempts)
for i in {1..3}; do
    if DEMO_SPEED=slow npx playwright test tests/demos/technical-documentation-demo.spec.ts --project=chromium --headed --reporter=list; then
        break
    fi
    if [ $i -lt 3 ]; then
        echo "⚠️  Attempt $i failed, retrying..."
        sleep 2
    else
        echo "❌ Error: Technical Documentation demo failed after 3 attempts"
        exit 1
    fi
done

VIDEO_PATH=$(find test-results -name "video.webm" -type f | head -1)
if [ -n "$VIDEO_PATH" ]; then
    cp "$VIDEO_PATH" demo-videos/07-technical-documentation.webm
    echo "✅ Saved: demo-videos/07-technical-documentation.webm"
else
    echo "❌ Error: Video not found for Technical Documentation"
    exit 1
fi

echo ""

# Step 8: Organization Settings
echo "📹 [8/9] Generating Organization Settings demo..."

# Retry logic (up to 3 attempts)
for i in {1..3}; do
    if DEMO_SPEED=slow npx playwright test tests/demos/settings-demo.spec.ts --project=chromium --headed --reporter=list; then
        break
    fi
    if [ $i -lt 3 ]; then
        echo "⚠️  Attempt $i failed, retrying..."
        sleep 2
    else
        echo "❌ Error: Organization Settings demo failed after 3 attempts"
        exit 1
    fi
done

VIDEO_PATH=$(find test-results -name "video.webm" -type f | head -1)
if [ -n "$VIDEO_PATH" ]; then
    cp "$VIDEO_PATH" demo-videos/08-organization-settings.webm
    echo "✅ Saved: demo-videos/08-organization-settings.webm"
else
    echo "❌ Error: Video not found for Organization Settings"
    exit 1
fi

echo ""
echo "======================================"
echo "✨ All demo videos generated successfully!"
echo "======================================"
echo ""
echo "📂 Videos saved to: demo-videos/"
ls -lh demo-videos/*.webm
echo ""

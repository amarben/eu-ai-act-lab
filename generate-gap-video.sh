#!/bin/bash

echo "📹 Generating Gap Assessment demo with retry..."

for i in {1..3}; do
    if DEMO_SPEED=slow npx playwright test tests/demos/gap-assessment/gap-assessment-demo.spec.ts --project=chromium --headed --reporter=list; then
        break
    fi
    if [ $i -lt 3 ]; then
        echo "⚠️  Attempt $i failed, retrying..."
        sleep 2
    else
        echo "❌ Failed after 3 attempts"
        exit 1
    fi
done

VIDEO_PATH=$(find test-results -name "video.webm" -type f | head -1)
if [ -n "$VIDEO_PATH" ]; then
    cp "$VIDEO_PATH" demo-videos/03-gap-assessment.webm
    echo "✅ Saved: demo-videos/03-gap-assessment.webm"
    ls -lh demo-videos/03-gap-assessment.webm
else
    echo "❌ Video not found"
    exit 1
fi

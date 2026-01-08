/**
 * Demo Speed Configuration
 * 
 * Controls timing for automated demos to support different use cases:
 * - FAST: Quick iteration during development
 * - NORMAL: Regular testing speed  
 * - SLOW: Professional demo videos for presentations
 */

export type DemoSpeed = 'fast' | 'normal' | 'slow';

const DEMO_SPEED: DemoSpeed = (process.env.DEMO_SPEED as DemoSpeed) || 'normal';

const SPEED_MULTIPLIERS: Record<DemoSpeed, number> = {
  fast: 0.2,    // 5x faster
  normal: 1.0,  // Standard speed
  slow: 2.0,    // 2x slower for videos
};

const multiplier = SPEED_MULTIPLIERS[DEMO_SPEED];

/**
 * Scale wait times based on DEMO_SPEED environment variable
 * Usage: await page.waitForTimeout(wait(1000))
 */
export function wait(ms: number): number {
  return Math.floor(ms * multiplier);
}

/**
 * Scale test timeouts based on DEMO_SPEED
 * Usage: test.setTimeout(timeout(300000))
 */
export function timeout(ms: number): number {
  return Math.floor(ms * multiplier);
}

/**
 * Log current speed configuration
 */
export function logSpeedConfig(): void {
  const speedUpper = DEMO_SPEED.toUpperCase();
  console.log('\n🎬 Demo Speed: ' + speedUpper + ' (' + multiplier + 'x)');
  console.log('   Example: wait(1000) = ' + wait(1000) + 'ms\n');
}

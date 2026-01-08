/**
 * Gemini AI Health Check API Endpoint
 *
 * Checks Gemini AI API connectivity and response time.
 * Used for monitoring external service dependencies.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          service: 'gemini-ai',
          error: 'API key not configured',
          timestamp: new Date().toISOString(),
        },
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Make a lightweight test request to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'ping'
            }]
          }]
        }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json(
        {
          status: 'unhealthy',
          service: 'gemini-ai',
          httpStatus: response.status,
          responseTime: `${responseTime}ms`,
          error: errorData.error?.message || 'API request failed',
          timestamp: new Date().toISOString(),
        },
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        service: 'gemini-ai',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error('Gemini AI health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'gemini-ai',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Service check failed',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

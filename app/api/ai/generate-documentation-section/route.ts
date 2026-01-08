import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorResponse } from '@/lib/api-response';
import { UnauthorizedError, ValidationError } from '@/lib/errors';
import { z } from 'zod';
import { generateText, isGeminiConfigured } from '@/lib/gemini';

const generateSectionSchema = z.object({
  aiSystemName: z.string(),
  businessPurpose: z.string().optional(),
  sectionId: z.string(),
  existingContent: z.string().optional(),
});

const SECTION_PROMPTS: Record<string, string> = {
  intendedUse: `Generate professional technical documentation for the "Intended Purpose" section of an EU AI Act Article 11 compliance document.

Include:
- Clear statement of the AI system's intended purpose
- Specific use cases and application scenarios
- Target users and beneficiaries
- Expected operational environment
- Performance expectations
- Regulatory context (EU AI Act compliance)

Write in a formal, professional tone suitable for regulatory submission. Use 300-500 words.`,

  foreseeableMisuse: `Generate professional technical documentation for the "Foreseeable Misuse" section of an EU AI Act Article 11 compliance document.

Include:
- Potential misuse scenarios
- Unintended use cases
- Risk mitigation measures
- User guidance and warnings
- Monitoring and detection mechanisms
- Preventive controls

Write in a formal, professional tone suitable for regulatory submission. Use 300-500 words.`,

  systemArchitecture: `Generate professional technical documentation for the "System Architecture and Design" section of an EU AI Act Article 11 compliance document.

Include:
- High-level system architecture
- Key components and modules
- Data flow and processing pipeline
- Integration points and APIs
- Infrastructure and deployment model
- Technical stack overview

Write in a formal, professional tone suitable for regulatory submission. Use 300-500 words.`,

  trainingData: `Generate professional technical documentation for the "Training Data Governance" section of an EU AI Act Article 11 compliance document.

Include:
- Data sources and collection methods
- Data quality assurance processes
- Data preprocessing and curation
- Bias detection and mitigation
- Data privacy and security measures
- Data versioning and lineage

Write in a formal, professional tone suitable for regulatory submission. Use 300-500 words.`,

  modelPerformance: `Generate professional technical documentation for the "Performance Metrics and Limitations" section of an EU AI Act Article 11 compliance document.

Include:
- Key performance metrics (accuracy, precision, recall, etc.)
- Benchmark results and comparisons
- Known limitations and edge cases
- Performance across different user groups
- Failure modes and error analysis
- Continuous monitoring approach

Write in a formal, professional tone suitable for regulatory submission. Use 300-500 words.`,

  validationTesting: `Generate professional technical documentation for the "Validation and Testing Procedures" section of an EU AI Act Article 11 compliance document.

Include:
- Testing methodology and framework
- Test coverage and scenarios
- Validation datasets and benchmarks
- Acceptance criteria
- Test results and findings
- Ongoing testing and quality assurance

Write in a formal, professional tone suitable for regulatory submission. Use 300-500 words.`,

  humanOversightDoc: `Generate professional technical documentation for the "Human Oversight Mechanisms" section of an EU AI Act Article 11 compliance document.

Include:
- Human-in-the-loop processes
- Human oversight roles and responsibilities
- Override and intervention mechanisms
- Decision review processes
- Escalation procedures
- Training and competency requirements

Write in a formal, professional tone suitable for regulatory submission. Use 300-500 words.`,

  cybersecurity: `Generate professional technical documentation for the "Cybersecurity Measures" section of an EU AI Act Article 11 compliance document.

Include:
- Security architecture and controls
- Access control and authentication
- Data encryption and protection
- Threat detection and response
- Vulnerability management
- Compliance with security standards (ISO 27001, etc.)

Write in a formal, professional tone suitable for regulatory submission. Use 300-500 words.`,
};

/**
 * POST /api/ai/generate-documentation-section
 * Generate AI-powered content for a technical documentation section
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      throw new UnauthorizedError('You must be logged in');
    }

    if (!isGeminiConfigured()) {
      throw new ValidationError('AI generation is not configured. Please set GEMINI_API_KEY.');
    }

    const body = await request.json();
    const validatedData = generateSectionSchema.parse(body);

    const sectionPrompt = SECTION_PROMPTS[validatedData.sectionId];
    if (!sectionPrompt) {
      throw new ValidationError('Invalid section ID');
    }

    // Build full prompt with context
    const fullPrompt = `${sectionPrompt}

AI System Name: ${validatedData.aiSystemName}
${validatedData.businessPurpose ? `Business Purpose: ${validatedData.businessPurpose}` : ''}
${validatedData.existingContent ? `\nExisting Content (enhance or expand on this):\n${validatedData.existingContent}` : ''}

Generate professional, compliance-ready technical documentation content:`;

    // Generate content using Gemini
    const content = await generateText(fullPrompt);

    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return errorResponse(error);
  }
}

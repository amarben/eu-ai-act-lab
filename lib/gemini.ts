import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Use Gemini Flash 1.5 model for improved quality and speed
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7, // Balanced creativity
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
});

/**
 * Generate text content using Gemini AI
 * @param prompt - The prompt to send to Gemini
 * @param context - Optional context information to include
 * @returns Generated text content
 */
export async function generateText(
  prompt: string,
  context?: string
): Promise<string> {
  try {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw new Error("Failed to generate content with Gemini AI");
  }
}

/**
 * Generate executive summary for gap assessment
 * @param assessmentData - Gap assessment data
 * @returns Executive summary text
 */
export async function generateGapAssessmentSummary(assessmentData: {
  systemName: string;
  overallScore: number;
  categories: Array<{
    name: string;
    score: number;
    total: number;
    requirements: Array<{
      requirement: string;
      status: string;
      notes?: string;
    }>;
  }>;
}): Promise<string> {
  const context = `You are an EU AI Act compliance expert. Generate a professional executive summary for a gap assessment report.

Assessment Details:
- AI System: ${assessmentData.systemName}
- Overall Compliance Score: ${assessmentData.overallScore}%
- Categories Assessed: ${assessmentData.categories.length}

Category Breakdown:
${assessmentData.categories
  .map(
    (cat) => `
- ${cat.name}: ${cat.score}/${cat.total} requirements implemented (${Math.round((cat.score / cat.total) * 100)}%)
  ${cat.requirements
    .filter((req) => req.status !== "Implemented")
    .map((req) => `  • ${req.requirement}: ${req.status}`)
    .join("\n  ")}
`
  )
  .join("\n")}`;

  const prompt = `Write a concise executive summary (3-4 paragraphs, 200-300 words) that:

1. Opens with an overview of the AI system and assessment purpose
2. Highlights the overall compliance score and what it means
3. Identifies key gaps and areas requiring immediate attention
4. Provides 2-3 specific recommendations for achieving full compliance

Use professional, formal language suitable for executive stakeholders and auditors. Focus on actionable insights rather than technical details.`;

  return generateText(prompt, context);
}

/**
 * Generate detailed gap analysis for a specific category
 * @param categoryData - Category assessment data
 * @returns Detailed gap analysis text
 */
export async function generateCategoryGapAnalysis(categoryData: {
  categoryName: string;
  requirements: Array<{
    requirement: string;
    status: string;
    notes?: string;
    evidence?: Array<{ fileName: string }>;
  }>;
}): Promise<string> {
  const context = `You are an EU AI Act compliance expert. Generate a detailed gap analysis for the "${categoryData.categoryName}" compliance category.

Requirements Status:
${categoryData.requirements
  .map(
    (req, idx) => `
${idx + 1}. ${req.requirement}
   Status: ${req.status}
   ${req.notes ? `Notes: ${req.notes}` : ""}
   ${req.evidence && req.evidence.length > 0 ? `Evidence: ${req.evidence.map((e) => e.fileName).join(", ")}` : "No evidence attached"}
`
  )
  .join("\n")}`;

  const prompt = `Write a detailed gap analysis (2-3 paragraphs, 150-250 words) that:

1. Summarizes the current state of compliance for this category
2. Identifies specific gaps and their potential impact
3. Provides concrete recommendations for closing each gap
4. Highlights any requirements with missing evidence

Use professional language suitable for compliance documentation. Be specific and actionable.`;

  return generateText(prompt, context);
}

/**
 * Generate compliance recommendations based on assessment results
 * @param assessmentData - Full assessment data
 * @returns Prioritized recommendations
 */
export async function generateComplianceRecommendations(assessmentData: {
  systemName: string;
  riskCategory: string;
  overallScore: number;
  categories: Array<{
    name: string;
    score: number;
    total: number;
  }>;
}): Promise<string> {
  const context = `You are an EU AI Act compliance expert. Generate prioritized compliance recommendations for a ${assessmentData.riskCategory} AI system.

System: ${assessmentData.systemName}
Overall Compliance: ${assessmentData.overallScore}%
Risk Category: ${assessmentData.riskCategory}

Category Scores:
${assessmentData.categories.map((cat) => `- ${cat.name}: ${Math.round((cat.score / cat.total) * 100)}%`).join("\n")}`;

  const prompt = `Generate a prioritized list of 5-7 specific, actionable recommendations to improve compliance. For each recommendation:

1. State the specific action required
2. Explain why it's important (link to EU AI Act requirements)
3. Estimate the effort level (Low/Medium/High)
4. Suggest a timeline (Immediate/Short-term/Long-term)

Format as a numbered list with clear, concise recommendations. Focus on the lowest-scoring categories first.`;

  return generateText(prompt, context);
}

/**
 * Generate executive summary for organization compliance
 * @param orgData - Organization compliance data
 * @returns Executive summary text
 */
export async function generateExecutiveSummary(orgData: {
  organizationName: string;
  overallReadiness: number;
  systemsCount: number;
  highRiskSystems: number;
  topGaps: string[];
  topRisks: string[];
}): Promise<string> {
  const context = `You are an expert compliance consultant specializing in the EU AI Act.

Organization: ${orgData.organizationName}
Current Date: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

Compliance Data:
- Overall Readiness: ${orgData.overallReadiness}%
- Total AI Systems: ${orgData.systemsCount}
- High-Risk Systems: ${orgData.highRiskSystems}
- Critical Gaps: ${orgData.topGaps.join(', ')}
- Top Risks: ${orgData.topRisks.join(', ')}`;

  const prompt = `Generate a 400-600 word executive summary for a board presentation with the following structure:

1. Opening (1-2 sentences)
   - Current compliance readiness status
   - High-level assessment (excellent/good/needs improvement/critical)

2. Key Achievements (100 words)
   - What has been accomplished
   - Systems assessed and classified
   - Documentation completed

3. Critical Gaps (150 words)
   - Most important compliance gaps
   - Specific regulatory requirements at risk
   - Business impact if not addressed

4. High-Priority Risks (100 words)
   - Top AI-related risks
   - Potential regulatory or business consequences
   - Current mitigation status

5. Recommended Actions (100 words)
   - Top 3-5 immediate actions with specific deadlines
   - Resource requirements
   - Expected impact on readiness score

6. Timeline & Next Steps (50 words)
   - Key milestones for next 3-6 months
   - Target readiness percentage

Tone: Professional, factual, action-oriented
Audience: C-level executives and board members
Focus: Business impact and regulatory compliance
Avoid: Technical jargon, overly complex explanations`;

  return generateText(prompt, context);
}

/**
 * Generate risk assessment narrative for AI system
 * @param riskData - Risk assessment data
 * @returns Risk assessment narrative
 */
export async function generateRiskAssessmentNarrative(riskData: {
  systemName: string;
  risks: Array<{
    title: string;
    type: string;
    inherentScore: number;
    residualScore: number;
    mitigations: string[];
    oversight: string;
  }>;
}): Promise<string> {
  const context = `You are an AI risk management expert.

AI System: ${riskData.systemName}

Risk Data:
${riskData.risks.map((r, i) => `
${i + 1}. ${r.title} (${r.type})
   - Inherent Risk Score: ${r.inherentScore}
   - Residual Risk Score: ${r.residualScore}
   - Mitigations: ${r.mitigations.join(', ')}
   - Oversight: ${r.oversight}
`).join('\n')}`;

  const prompt = `Generate a risk assessment narrative (400-600 words) with:

1. Risk Overview (100 words)
   - Total risks identified
   - Risk distribution (high/medium/low)
   - Primary risk categories

2. High-Priority Risks (200 words)
   For each high-priority risk:
   - Risk description in plain language
   - Business and regulatory impact
   - Inherent risk assessment
   - Mitigation strategy and effectiveness
   - Residual risk evaluation
   - Human oversight measures

3. Risk Treatment Strategy (150 words)
   - Overall approach to risk management
   - Effectiveness of current mitigations
   - Areas needing additional controls
   - Timeline for residual risk reduction

4. Ongoing Monitoring (100 words)
   - Monitoring mechanisms in place
   - Review frequency
   - Escalation procedures

Tone: Professional, risk-focused, balanced
Audience: Risk committee and compliance team
Focus: Clear risk characterization and mitigation effectiveness`;

  return generateText(prompt, context);
}

/**
 * Generate technical documentation introduction and transitions
 * @param techData - Technical documentation data
 * @returns Formatted technical documentation sections
 */
export async function generateTechnicalDocumentation(techData: {
  systemName: string;
  sections: {
    intendedUse?: string;
    foreseeableMisuse?: string;
    architecture?: string;
    trainingData?: string;
    performance?: string;
    testing?: string;
    oversight?: string;
    cybersecurity?: string;
  };
}): Promise<{
  introduction: string;
  transitions: Record<string, string>;
  conclusion: string;
}> {
  const context = `You are a technical writer specializing in AI system documentation for regulatory compliance.

AI System: ${techData.systemName}

User-Provided Sections: ${Object.keys(techData.sections).join(', ')}`;

  const introPrompt = `Generate a professional document introduction (150 words) that includes:
- Purpose of this technical documentation
- Regulatory basis (EU AI Act Article 11)
- Document scope and structure
- Intended audience

Tone: Technical, formal, regulatory-appropriate`;

  const conclusionPrompt = `Generate a document conclusion (100 words) that includes:
- Summary of technical characteristics
- Confirmation of regulatory compliance approach
- Version control statement
- Review and update schedule

Tone: Technical, formal, professional`;

  const [introduction, conclusion] = await Promise.all([
    generateText(introPrompt, context),
    generateText(conclusionPrompt, context),
  ]);

  return {
    introduction,
    transitions: {}, // Can add section transitions if needed
    conclusion,
  };
}

/**
 * Check if Gemini API is configured and available
 * @returns true if API key is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0;
}

/**
 * QUICK WIN 1: Analyze requirements and detect evidence gaps
 * @param assessmentData - Gap assessment data with requirements and evidence
 * @returns Evidence gap analysis with specific missing documentation
 */
export async function generateEvidenceGapAnalysis(assessmentData: {
  systemName: string;
  categories: Array<{
    name: string;
    requirements: Array<{
      requirement: string;
      status: string;
      evidence?: Array<{ fileName: string }>;
      notes?: string;
    }>;
  }>;
}): Promise<string> {
  const context = `You are an EU AI Act compliance auditor. Analyze the gap assessment and identify requirements that lack sufficient evidence or documentation.

AI System: ${assessmentData.systemName}

Requirements Analysis:
${assessmentData.categories
  .map(
    (cat) => `
${cat.name}:
${cat.requirements
  .map(
    (req) => `
  - ${req.requirement}
    Status: ${req.status}
    Evidence: ${req.evidence && req.evidence.length > 0 ? req.evidence.map((e) => e.fileName).join(", ") : "NONE"}
    ${req.notes ? `Notes: ${req.notes}` : ""}
`
  )
  .join("\n")}
`
  )
  .join("\n")}`;

  const prompt = `Identify and analyze evidence gaps (200-300 words):

1. List requirements with missing or insufficient evidence
2. For each gap, explain:
   - What documentation is needed
   - Why this evidence is critical for compliance
   - Suggested documentation approach (policy, procedure, record, test report, etc.)
3. Highlight any patterns (e.g., "All data governance requirements lack evidence")
4. Recommend priority order for addressing documentation gaps

Format as a clear, actionable analysis suitable for compliance teams.`;

  return generateText(prompt, context);
}

/**
 * QUICK WIN 2: Intelligently prioritize gaps by urgency, impact, and effort
 * @param assessmentData - Gap assessment data
 * @returns Prioritized gap list with scoring matrix
 */
export async function generateGapPrioritization(assessmentData: {
  systemName: string;
  riskCategory: string;
  categories: Array<{
    name: string;
    requirements: Array<{
      requirement: string;
      status: string;
      notes?: string;
    }>;
  }>;
}): Promise<string> {
  const context = `You are an EU AI Act compliance strategist. Prioritize compliance gaps for a ${assessmentData.riskCategory} AI system.

AI System: ${assessmentData.systemName}
Risk Category: ${assessmentData.riskCategory}

Identified Gaps:
${assessmentData.categories
  .map(
    (cat) => `
${cat.name}:
${cat.requirements
  .filter((req) => req.status !== "Implemented")
  .map((req) => `  - ${req.requirement} [${req.status}] ${req.notes ? `(${req.notes})` : ""}`)
  .join("\n")}
`
  )
  .join("\n")}`;

  const prompt = `Create an intelligent gap prioritization (250-350 words):

For each gap, score on 3 dimensions (1-5 scale):
1. **Regulatory Urgency**: How critical for EU AI Act compliance?
2. **Business Impact**: What happens if this gap isn't addressed?
3. **Implementation Effort**: How much work is required?

Then calculate Priority Score = (Urgency × 2) + (Impact × 1.5) + (5 - Effort)
(Formula favors high urgency/impact and low effort)

Present results as:
1. Priority Matrix table showing top 5-7 gaps with scores
2. "Quick Wins" section (high priority, low effort)
3. "Must-Do" section (high priority, high effort)
4. "Future Work" section (lower priority)

Use clear, decision-ready formatting suitable for planning meetings.`;

  return generateText(prompt, context);
}

/**
 * QUICK WIN 3: Generate step-by-step implementation roadmap
 * @param assessmentData - Gap assessment data
 * @returns Phased implementation roadmap with timelines
 */
export async function generateImplementationRoadmap(assessmentData: {
  systemName: string;
  overallScore: number;
  categories: Array<{
    name: string;
    score: number;
    total: number;
    requirements: Array<{
      requirement: string;
      status: string;
    }>;
  }>;
}): Promise<string> {
  const context = `You are an EU AI Act implementation consultant. Create a practical roadmap to achieve full compliance.

AI System: ${assessmentData.systemName}
Current Compliance: ${assessmentData.overallScore}%
Target: 100% compliance

Category Status:
${assessmentData.categories
  .map((cat) => {
    const percentage = Math.round((cat.score / cat.total) * 100);
    const missing = cat.requirements.filter((r) => r.status !== "Implemented");
    return `
${cat.name}: ${percentage}% (${missing.length} gaps)
${missing.map((r) => `  - ${r.requirement}`).join("\n")}
`;
  })
  .join("\n")}`;

  const prompt = `Generate a phased implementation roadmap (350-450 words):

**Phase 1: Foundation (Weeks 1-4)**
- Quick wins and critical documentation gaps
- Focus on highest-priority items
- Deliverables and success criteria

**Phase 2: Core Compliance (Weeks 5-12)**
- Medium-effort requirements
- Policy and procedure development
- Testing and validation setup

**Phase 3: Full Compliance (Weeks 13-24)**
- Complex technical requirements
- Advanced governance measures
- Final documentation and audits

For each phase, include:
- Specific tasks and dependencies
- Estimated effort (hours/weeks)
- Required resources (team, tools, budget)
- Key milestones and checkpoints
- Expected compliance score improvement

Add a timeline visualization (text-based):
Week 1-4: ████████░░░░░░░░░░░░ 40%
Week 5-12: ████████████░░░░░░░░ 75%
Week 13-24: ████████████████████ 100%

Use actionable language suitable for project planning.`;

  return generateText(prompt, context);
}

/**
 * QUICK WIN 4: Analyze trends by comparing current vs historical assessments
 * @param currentAssessment - Current gap assessment data
 * @param previousAssessment - Previous assessment data (optional)
 * @returns Trend analysis with progress indicators
 */
export async function generateTrendAnalysis(
  currentAssessment: {
    systemName: string;
    overallScore: number;
    assessmentDate: Date;
    categories: Array<{
      name: string;
      score: number;
      total: number;
    }>;
  },
  previousAssessment?: {
    overallScore: number;
    assessmentDate: Date;
    categories: Array<{
      name: string;
      score: number;
      total: number;
    }>;
  }
): Promise<string> {
  if (!previousAssessment) {
    // First assessment - provide baseline analysis
    const context = `AI System: ${currentAssessment.systemName}
Assessment Date: ${currentAssessment.assessmentDate.toLocaleDateString()}
Overall Score: ${currentAssessment.overallScore}%

This is the baseline assessment.`;

    const prompt = `Generate a baseline trend analysis (150-200 words):

1. State this is the initial assessment establishing a compliance baseline
2. Highlight current compliance level and category breakdown
3. Provide predictive insights:
   - "At current pace, expect X% improvement per month"
   - "Full compliance achievable by [estimated date] with focused effort"
   - "Critical path: address [category] first for fastest improvement"

Include recommendations for tracking progress in future assessments.`;

    return generateText(prompt, context);
  }

  // Compare current vs previous
  const scoreDelta = currentAssessment.overallScore - previousAssessment.overallScore;
  const daysBetween = Math.round(
    (currentAssessment.assessmentDate.getTime() - previousAssessment.assessmentDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const categoryComparisons = currentAssessment.categories.map((curr) => {
    const prev = previousAssessment.categories.find((p) => p.name === curr.name);
    if (!prev) return null;

    const currPercent = Math.round((curr.score / curr.total) * 100);
    const prevPercent = Math.round((prev.score / prev.total) * 100);
    const delta = currPercent - prevPercent;

    return {
      name: curr.name,
      current: currPercent,
      previous: prevPercent,
      delta,
    };
  }).filter(Boolean);

  const context = `AI System: ${currentAssessment.systemName}

Previous Assessment (${previousAssessment.assessmentDate.toLocaleDateString()}): ${previousAssessment.overallScore}%
Current Assessment (${currentAssessment.assessmentDate.toLocaleDateString()}): ${currentAssessment.overallScore}%
Change: ${scoreDelta > 0 ? "+" : ""}${scoreDelta}% over ${daysBetween} days

Category Trends:
${categoryComparisons
  .map((c) => `- ${c.name}: ${c.previous}% → ${c.current}% (${c.delta > 0 ? "+" : ""}${c.delta}%)`)
  .join("\n")}`;

  const prompt = `Generate a trend analysis (250-350 words):

1. **Overall Progress**
   - Compliance score change and direction
   - Rate of improvement (% per month)
   - Assessment of progress (on track / ahead / behind)

2. **Category Performance**
   - Identify improving categories (rising scores)
   - Identify stagnant/declining categories
   - Highlight best performers and areas needing focus

3. **Predictive Insights**
   - At current rate, when will you reach 100% compliance?
   - What needs to accelerate?
   - Which categories are critical path?

4. **Actionable Recommendations**
   - Should you maintain current pace or accelerate?
   - Which areas need more resources?
   - Suggested next assessment date

Use data-driven language with specific numbers and timelines.`;

  return generateText(prompt, context);
}

/**
 * QUICK WIN 5: Expand bullet points into professional narrative paragraphs
 * @param bulletPoints - User's bullet point content
 * @param context - Section context (what this content is about)
 * @returns Flowing narrative paragraphs
 */
export async function expandBulletPointsToNarrative(
  bulletPoints: string,
  context: {
    systemName: string;
    sectionType: string; // e.g., "Intended Use", "Architecture", "Training Data"
    purpose: string; // e.g., "EU AI Act Article 11 compliance"
  }
): Promise<string> {
  const promptContext = `You are a technical writer specializing in AI compliance documentation.

AI System: ${context.systemName}
Section: ${context.sectionType}
Purpose: ${context.purpose}

User's Bullet Points:
${bulletPoints}`;

  const prompt = `Transform the bullet points into professional flowing narrative paragraphs (300-500 words):

Requirements:
1. Convert ALL bullet points into connected prose
2. Use formal, professional vocabulary appropriate for regulatory documentation
3. Employ multi-clause sentences with connecting language ("Furthermore", "Additionally", "However", "Consequently")
4. Maintain technical accuracy while improving readability
5. Add context and transitions between concepts
6. Keep all specific details from the original bullets

Structure:
- Opening paragraph: Introduce the topic and its significance
- Body paragraphs: Expand each major bullet into a full paragraph
- Closing paragraph: Summarize key points and connect to compliance requirements

Tone: Technical, formal, regulatory-appropriate
Avoid: Bullet points, numbered lists, overly casual language
Goal: Create documentation that looks professionally written, not just assembled from notes`;

  return generateText(prompt, promptContext);
}

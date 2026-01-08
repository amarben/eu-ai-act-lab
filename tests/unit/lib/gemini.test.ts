/**
 * Unit Tests: Gemini AI Integration
 *
 * Tests for AI-powered text generation functions using Gemini API.
 * Uses mocks to avoid actual API calls and costs during testing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as gemini from '@/lib/gemini';

// Mock Google Generative AI SDK
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn();
  const mockGetGenerativeModel = vi.fn(() => ({
    generateContent: mockGenerateContent,
  }));

  return {
    GoogleGenerativeAI: vi.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
    // Export mocks for access in tests
    __mockGenerateContent: mockGenerateContent,
    __mockGetGenerativeModel: mockGetGenerativeModel,
  };
});

// Access the mocked functions
const { GoogleGenerativeAI } = await import('@google/generative-ai');
const mockInstance = new GoogleGenerativeAI('test');
const mockModel = mockInstance.getGenerativeModel({ model: 'test' });
const mockGenerateContent = mockModel.generateContent as ReturnType<typeof vi.fn>;

describe('Gemini AI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  describe('isGeminiConfigured', () => {
    it('should return true when API key is configured', () => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      expect(gemini.isGeminiConfigured()).toBe(true);
    });

    it('should return false when API key is empty string', () => {
      process.env.GEMINI_API_KEY = '';
      expect(gemini.isGeminiConfigured()).toBe(false);
    });

    it('should return false when API key is undefined', () => {
      delete process.env.GEMINI_API_KEY;
      expect(gemini.isGeminiConfigured()).toBe(false);
    });
  });

  describe('generateText', () => {
    it('should generate text from prompt successfully', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Generated text response',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await gemini.generateText('Test prompt');

      expect(result).toBe('Generated text response');
      expect(mockGenerateContent).toHaveBeenCalledWith('Test prompt');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should include context when provided', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Generated text with context',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await gemini.generateText('Test prompt', 'Test context');

      expect(result).toBe('Generated text with context');
      expect(mockGenerateContent).toHaveBeenCalledWith('Test context\n\nTest prompt');
    });

    it('should handle API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(gemini.generateText('Test prompt')).rejects.toThrow(
        'Failed to generate content with Gemini AI'
      );
    });

    it('should handle network errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network error'));

      await expect(gemini.generateText('Test prompt')).rejects.toThrow(
        'Failed to generate content with Gemini AI'
      );
    });
  });

  describe('generateGapAssessmentSummary', () => {
    const mockAssessmentData = {
      systemName: 'TalentMatch AI',
      overallScore: 45.5,
      categories: [
        {
          name: 'Risk Management',
          score: 2,
          total: 5,
          requirements: [
            {
              requirement: 'Article 9: Risk Management System',
              status: 'Missing',
              notes: 'No formal risk management system',
            },
            {
              requirement: 'Article 10: Data Governance',
              status: 'Partial',
              notes: 'Data governance incomplete',
            },
          ],
        },
      ],
    };

    it('should generate executive summary successfully', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () =>
            'Executive summary of gap assessment showing 45.5% compliance with critical gaps in risk management.',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await gemini.generateGapAssessmentSummary(mockAssessmentData);

      expect(result).toContain('45.5%');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('TalentMatch AI')
      );
    });

    it('should include category breakdown in context', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Summary with category details',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateGapAssessmentSummary(mockAssessmentData);

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg).toContain('Risk Management');
      expect(callArg).toContain('Article 9: Risk Management System');
    });

    it('should handle API errors during summary generation', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API quota exceeded'));

      await expect(
        gemini.generateGapAssessmentSummary(mockAssessmentData)
      ).rejects.toThrow('Failed to generate content with Gemini AI');
    });
  });

  describe('generateCategoryGapAnalysis', () => {
    const mockCategoryData = {
      categoryName: 'Risk Management',
      requirements: [
        {
          requirement: 'Article 9: Risk Management System',
          status: 'Missing',
          notes: 'No formal risk management system in place',
          evidence: [],
        },
        {
          requirement: 'Article 10: Data Governance',
          status: 'Partial',
          notes: 'Data governance measures incomplete',
          evidence: [{ fileName: 'data-policy.pdf' }],
        },
      ],
    };

    it('should generate category gap analysis successfully', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Detailed gap analysis for Risk Management category',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await gemini.generateCategoryGapAnalysis(mockCategoryData);

      expect(result).toBe('Detailed gap analysis for Risk Management category');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should include requirement status and evidence in context', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Gap analysis',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateCategoryGapAnalysis(mockCategoryData);

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg).toContain('Article 9: Risk Management System');
      expect(callArg).toContain('Status: Missing');
      expect(callArg).toContain('data-policy.pdf');
      expect(callArg).toContain('No evidence attached');
    });

    it('should handle requirements with no evidence', async () => {
      const dataWithNoEvidence = {
        categoryName: 'Testing',
        requirements: [
          {
            requirement: 'Test Requirement',
            status: 'Missing',
          },
        ],
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Analysis',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateCategoryGapAnalysis(dataWithNoEvidence);

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg).toContain('No evidence attached');
    });
  });

  describe('generateComplianceRecommendations', () => {
    const mockAssessmentData = {
      systemName: 'TalentMatch AI',
      riskCategory: 'HIGH_RISK',
      overallScore: 45.5,
      categories: [
        { name: 'Risk Management', score: 2, total: 5 },
        { name: 'Data Governance', score: 3, total: 5 },
        { name: 'Technical Documentation', score: 1, total: 4 },
      ],
    };

    it('should generate compliance recommendations successfully', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () =>
            '1. Establish risk management system (High effort, Immediate)\n2. Complete data governance framework (Medium effort, Short-term)',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await gemini.generateComplianceRecommendations(mockAssessmentData);

      expect(result).toContain('risk management');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should include risk category and scores in context', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Recommendations',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateComplianceRecommendations(mockAssessmentData);

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg).toContain('HIGH_RISK');
      expect(callArg).toContain('45.5%');
      expect(callArg).toContain('Risk Management');
      expect(callArg).toContain('Data Governance');
      expect(callArg).toContain('Technical Documentation');
    });

    it('should handle different risk categories', async () => {
      const limitedRiskData = {
        ...mockAssessmentData,
        riskCategory: 'LIMITED_RISK',
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Recommendations for limited risk',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateComplianceRecommendations(limitedRiskData);

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg).toContain('LIMITED_RISK');
    });
  });

  describe('generateExecutiveSummary', () => {
    const mockOrgData = {
      organizationName: 'TalentTech Solutions GmbH',
      overallReadiness: 45.5,
      systemsCount: 3,
      highRiskSystems: 2,
      topGaps: ['Risk Management', 'Data Governance', 'Technical Documentation'],
      topRisks: ['Bias in candidate screening', 'Data privacy violations'],
    };

    it('should generate executive summary successfully', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () =>
            'Executive summary for TalentTech Solutions showing 45.5% readiness with 3 AI systems including 2 high-risk systems. Critical gaps in risk management and data governance require immediate attention.',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await gemini.generateExecutiveSummary(mockOrgData);

      expect(result).toContain('TalentTech Solutions');
      expect(result).toContain('45.5%');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should include organization details in context', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Summary',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateExecutiveSummary(mockOrgData);

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg).toContain('TalentTech Solutions GmbH');
      expect(callArg).toContain('Overall Readiness: 45.5%');
      expect(callArg).toContain('Total AI Systems: 3');
      expect(callArg).toContain('High-Risk Systems: 2');
      expect(callArg).toContain('Risk Management');
      expect(callArg).toContain('Bias in candidate screening');
    });

    it('should handle organizations with no high-risk systems', async () => {
      const noHighRiskData = {
        ...mockOrgData,
        highRiskSystems: 0,
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Summary for low-risk organization',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateExecutiveSummary(noHighRiskData);

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg).toContain('High-Risk Systems: 0');
    });
  });

  describe('generateRiskAssessmentNarrative', () => {
    const mockRiskData = {
      systemName: 'TalentMatch AI',
      risks: [
        {
          title: 'Discriminatory Bias',
          type: 'BIAS',
          inherentScore: 8,
          residualScore: 4,
          mitigations: ['Bias testing', 'Diverse training data', 'Regular audits'],
          oversight: 'Human review of all AI decisions',
        },
        {
          title: 'Data Privacy Breach',
          type: 'PRIVACY',
          inherentScore: 7,
          residualScore: 3,
          mitigations: ['Encryption', 'Access controls', 'GDPR compliance'],
          oversight: 'Data protection officer review',
        },
      ],
    };

    it('should generate risk assessment narrative successfully', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () =>
            'Risk assessment narrative identifying discriminatory bias and data privacy as primary risks with effective mitigation strategies reducing residual risk.',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await gemini.generateRiskAssessmentNarrative(mockRiskData);

      expect(result).toContain('risk');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should include risk scores and mitigations in context', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Narrative',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateRiskAssessmentNarrative(mockRiskData);

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg).toContain('Discriminatory Bias');
      expect(callArg).toContain('BIAS');
      expect(callArg).toContain('Inherent Risk Score: 8');
      expect(callArg).toContain('Residual Risk Score: 4');
      expect(callArg).toContain('Bias testing');
      expect(callArg).toContain('Human review of all AI decisions');
    });

    it('should handle multiple risk types', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Multi-risk narrative',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateRiskAssessmentNarrative(mockRiskData);

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg).toContain('Discriminatory Bias');
      expect(callArg).toContain('Data Privacy Breach');
    });
  });

  describe('generateTechnicalDocumentation', () => {
    const mockTechData = {
      systemName: 'TalentMatch AI',
      sections: {
        intendedUse: 'Automated candidate screening for recruitment',
        foreseeableMisuse: 'Could be misused for discriminatory hiring',
        architecture: 'Neural network with data preprocessing',
        trainingData: 'Historical recruitment data from 2020-2024',
        performance: '87% accuracy in candidate-job matching',
        testing: 'Bias testing, accuracy validation, fairness audits',
        oversight: 'Human review of all hiring decisions',
        cybersecurity: 'Encryption, access controls, security audits',
      },
    };

    it('should generate technical documentation successfully', async () => {
      const mockIntroResponse = {
        response: Promise.resolve({
          text: () =>
            'This technical documentation provides comprehensive information about TalentMatch AI in accordance with EU AI Act Article 11 requirements.',
        }),
      };
      const mockConclusionResponse = {
        response: Promise.resolve({
          text: () =>
            'This documentation will be reviewed and updated quarterly to ensure continued compliance with EU AI Act requirements.',
        }),
      };

      mockGenerateContent
        .mockResolvedValueOnce(mockIntroResponse)
        .mockResolvedValueOnce(mockConclusionResponse);

      const result = await gemini.generateTechnicalDocumentation(mockTechData);

      expect(result).toHaveProperty('introduction');
      expect(result).toHaveProperty('conclusion');
      expect(result).toHaveProperty('transitions');
      expect(result.introduction).toContain('TalentMatch AI');
      expect(result.conclusion).toContain('documentation');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('should include section names in context', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Generated text',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateTechnicalDocumentation(mockTechData);

      const firstCallArg = mockGenerateContent.mock.calls[0][0];
      expect(firstCallArg).toContain('TalentMatch AI');
      expect(firstCallArg).toContain('intendedUse');
      expect(firstCallArg).toContain('architecture');
    });

    it('should handle partial sections', async () => {
      const partialData = {
        systemName: 'Test System',
        sections: {
          intendedUse: 'Test use case',
          architecture: 'Test architecture',
        },
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Partial documentation',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await gemini.generateTechnicalDocumentation(partialData);

      expect(result).toHaveProperty('introduction');
      expect(result).toHaveProperty('conclusion');
    });

    it('should generate introduction and conclusion in parallel', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Generated text',
        }),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await gemini.generateTechnicalDocumentation(mockTechData);

      // Both calls should happen in parallel via Promise.all
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw descriptive error when API key is missing', async () => {
      delete process.env.GEMINI_API_KEY;
      mockGenerateContent.mockRejectedValue(new Error('API key not configured'));

      await expect(gemini.generateText('Test')).rejects.toThrow(
        'Failed to generate content with Gemini AI'
      );
    });

    it('should handle rate limiting errors', async () => {
      mockGenerateContent.mockRejectedValue(
        new Error('429: Rate limit exceeded')
      );

      await expect(gemini.generateText('Test')).rejects.toThrow(
        'Failed to generate content with Gemini AI'
      );
    });

    it('should handle timeout errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Request timeout'));

      await expect(gemini.generateText('Test')).rejects.toThrow(
        'Failed to generate content with Gemini AI'
      );
    });

    it('should handle malformed responses', async () => {
      const mockBadResponse = {
        response: Promise.resolve({
          text: () => {
            throw new Error('Malformed response');
          },
        }),
      };
      mockGenerateContent.mockResolvedValue(mockBadResponse);

      await expect(gemini.generateText('Test')).rejects.toThrow(
        'Failed to generate content with Gemini AI'
      );
    });
  });

});

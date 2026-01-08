/**
 * Seed Data for Consistent Demos
 * 
 * Provides realistic test data for EU AI Act compliance demos
 * Use this to ensure demos have professional, consistent data
 */

export interface AISystemData {
  name: string;
  businessPurpose: string;
  deploymentStatus: string;
  primaryUsers: string[];
  dataCategories: string[];
  technicalDescription?: string;
}

export interface ClassificationData {
  aiSystemId: string;
  category: 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK';
  prohibitedPractices: string[];
  highRiskCategories: string[];
  interactsWithPersons: boolean;
  reasoning: string;
  applicableRequirements: string[];
}

/**
 * Sample AI System: HR Recruitment Assistant
 * HIGH_RISK system for employment decisions
 */
export const sampleHRSystem: AISystemData = {
  name: 'AI Recruitment Assistant',
  businessPurpose: 'Automated resume screening and candidate ranking for job applications. Analyzes CVs, cover letters, and LinkedIn profiles to identify top candidates based on job requirements and company culture fit.',
  deploymentStatus: 'PRODUCTION',
  primaryUsers: ['INTERNAL_EMPLOYEES', 'PUBLIC'],
  dataCategories: ['PERSONAL_DATA', 'SENSITIVE_DATA'],
  technicalDescription: 'Machine learning model trained on 50,000+ successful hires. Uses NLP for skills extraction and ranking algorithm for candidate scoring.'
};

/**
 * Sample AI System: Customer Service Chatbot
 * LIMITED_RISK system for customer interactions
 */
export const sampleChatbotSystem: AISystemData = {
  name: 'Customer Service Chatbot',
  businessPurpose: 'Provides automated customer support for common inquiries, troubleshooting, and product information. Available 24/7 to handle first-line customer service requests before escalating to human agents.',
  deploymentStatus: 'PRODUCTION',
  primaryUsers: ['EXTERNAL_CUSTOMERS'],
  dataCategories: ['PERSONAL_DATA', 'BEHAVIORAL_DATA'],
  technicalDescription: 'GPT-based conversational AI with custom fine-tuning on company knowledge base. Integrates with CRM for personalized responses.'
};

/**
 * Sample AI System: Inventory Optimizer
 * MINIMAL_RISK system for internal operations
 */
export const sampleInventorySystem: AISystemData = {
  name: 'Inventory Optimization System',
  businessPurpose: 'Predicts demand patterns and optimizes stock levels across warehouses. Reduces overstock and stockouts through machine learning forecasting of sales trends and seasonal variations.',
  deploymentStatus: 'TESTING',
  primaryUsers: ['INTERNAL_EMPLOYEES', 'PARTNERS'],
  dataCategories: ['NO_PERSONAL_DATA'],
  technicalDescription: 'Time-series forecasting model using historical sales data, weather patterns, and market trends. Updates predictions daily.'
};

/**
 * Sample Classification: HR System as HIGH_RISK
 *
 * Note: This HR system could fall under multiple high-risk categories:
 * 1. Employment - primary use case for recruitment
 * 2. Access to essential services - if used for workforce planning in essential sectors
 * 3. Biometric identification - if CV screening includes photo analysis
 */
export const sampleHRClassification: Partial<ClassificationData> = {
  category: 'HIGH_RISK',
  prohibitedPractices: [],
  highRiskCategories: [
    'Employment, workers management and access to self-employment',
    'Biometric identification and categorization'
  ],
  interactsWithPersons: true,
  reasoning: 'This AI system is classified as high-risk for multiple reasons: (1) It is used for employment decisions, specifically for screening and ranking job candidates, which falls under Annex III Category 4 (Employment and workers management). (2) If the system analyzes candidate photos or video interviews, it may involve biometric categorization, which is also high-risk under Annex III Category 1. The system directly impacts individuals\' access to employment opportunities and processes biometric data, requiring strict compliance with EU AI Act requirements including conformity assessment, human oversight, and transparency obligations.',
  applicableRequirements: [
    'Article 9 - Risk management system',
    'Article 10 - Data and data governance',
    'Article 13 - Transparency and provision of information to deployers',
    'Article 14 - Human oversight',
    'Article 15 - Accuracy, robustness and cybersecurity'
  ]
};

/**
 * Sample Classification: Chatbot as LIMITED_RISK
 */
export const sampleChatbotClassification: Partial<ClassificationData> = {
  category: 'LIMITED_RISK',
  prohibitedPractices: [],
  highRiskCategories: [],
  interactsWithPersons: true,
  reasoning: 'This customer service chatbot interacts directly with natural persons (customers) but does not fall under any prohibited practices or high-risk categories defined in the EU AI Act. As it interacts with people, it must comply with transparency obligations under Article 52, ensuring users are aware they are interacting with an AI system.',
  applicableRequirements: [
    'Article 52 - Transparency obligations for certain AI systems'
  ]
};

/**
 * Sample Classification: Inventory System as MINIMAL_RISK
 */
export const sampleInventoryClassification: Partial<ClassificationData> = {
  category: 'MINIMAL_RISK',
  prohibitedPractices: [],
  highRiskCategories: [],
  interactsWithPersons: false,
  reasoning: 'This inventory optimization system is used purely for internal business operations and does not interact with natural persons or fall under any prohibited practices or high-risk categories. It presents minimal risk under the EU AI Act and has no specific compliance obligations, though voluntary codes of conduct are encouraged.',
  applicableRequirements: []
};

/**
 * Gap Assessment Data Types
 */
export interface GapAssessmentRequirement {
  category: string;
  title: string;
  description: string;
  regulatoryReference: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'NOT_APPLICABLE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
  assignedTo?: string;
  dueDate?: string;
}

export interface GapAssessmentData {
  aiSystemId: string;
  requirements: GapAssessmentRequirement[];
  overallScore: number;
}

/**
 * Sample Gap Assessment for HR Recruitment System
 * Shows partially completed assessment with some requirements implemented
 */
export const sampleHRGapAssessment: GapAssessmentData = {
  aiSystemId: '', // Will be set dynamically with actual system ID
  overallScore: 37.5, // 9 out of 24 requirements implemented
  requirements: [
    // RISK_MANAGEMENT
    {
      category: 'RISK_MANAGEMENT',
      title: 'Risk Management System',
      description: 'Establish, implement, document and maintain a risk management system',
      regulatoryReference: 'Article 9(1)',
      status: 'IMPLEMENTED',
      priority: 'CRITICAL',
      notes: 'Risk management framework implemented using ISO 31000 methodology. Documentation maintained in Confluence.',
      assignedTo: 'Sarah Chen - CTO',
      dueDate: '2024-01-15'
    },
    {
      category: 'RISK_MANAGEMENT',
      title: 'Continuous Risk Assessment',
      description: 'Continuous iterative process run throughout the AI system lifecycle',
      regulatoryReference: 'Article 9(2)',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      notes: 'Monthly risk reviews scheduled. Working on automating risk monitoring dashboard.',
      assignedTo: 'Sarah Chen - CTO',
      dueDate: '2024-03-01'
    },
    {
      category: 'RISK_MANAGEMENT',
      title: 'Risk Identification',
      description: 'Identification and analysis of known and foreseeable risks',
      regulatoryReference: 'Article 9(2)(a)',
      status: 'IMPLEMENTED',
      priority: 'CRITICAL',
      notes: 'Comprehensive risk register created covering bias, privacy, discrimination, and technical failure scenarios.',
      assignedTo: 'Sarah Chen - CTO',
      dueDate: '2024-01-20'
    },
    // DATA_GOVERNANCE
    {
      category: 'DATA_GOVERNANCE',
      title: 'Training Data Governance',
      description: 'Data governance practices for training, validation and testing datasets',
      regulatoryReference: 'Article 10(2)',
      status: 'IMPLEMENTED',
      priority: 'CRITICAL',
      notes: 'Data governance policy established. Training data versioned and documented with lineage tracking.',
      assignedTo: 'Michael Rodriguez - Data Lead',
      dueDate: '2024-02-01'
    },
    {
      category: 'DATA_GOVERNANCE',
      title: 'Data Quality',
      description: 'Ensure data is relevant, representative, free of errors and complete',
      regulatoryReference: 'Article 10(3)',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      notes: 'Data quality metrics defined. Working on automated validation pipeline for ongoing monitoring.',
      assignedTo: 'Michael Rodriguez - Data Lead',
      dueDate: '2024-03-15'
    },
    {
      category: 'DATA_GOVERNANCE',
      title: 'Data Examination',
      description: 'Examine datasets for possible biases and identify data gaps',
      regulatoryReference: 'Article 10(2)(f)',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      notes: 'Bias analysis completed for gender and age. Need to expand to other protected characteristics.',
      assignedTo: 'Michael Rodriguez - Data Lead',
      dueDate: '2024-04-01'
    },
    // TECHNICAL_DOCUMENTATION
    {
      category: 'TECHNICAL_DOCUMENTATION',
      title: 'Technical Documentation',
      description: 'Draw up technical documentation before placing on market',
      regulatoryReference: 'Article 11(1)',
      status: 'IMPLEMENTED',
      priority: 'CRITICAL',
      notes: 'Comprehensive technical documentation created following Annex IV requirements. Reviewed by legal.',
      assignedTo: 'Emma Thompson - Tech Writer',
      dueDate: '2024-02-15'
    },
    {
      category: 'TECHNICAL_DOCUMENTATION',
      title: 'System Description',
      description: 'General description of AI system including intended purpose',
      regulatoryReference: 'Annex IV(1)',
      status: 'IMPLEMENTED',
      priority: 'HIGH',
      notes: 'System description document covers intended purpose, use cases, and user personas.',
      assignedTo: 'Emma Thompson - Tech Writer',
      dueDate: '2024-02-10'
    },
    {
      category: 'TECHNICAL_DOCUMENTATION',
      title: 'Development Process',
      description: 'Detailed description of system development process',
      regulatoryReference: 'Annex IV(2)',
      status: 'IMPLEMENTED',
      priority: 'MEDIUM',
      notes: 'Development lifecycle documented including design decisions, training methodology, and testing procedures.',
      assignedTo: 'Emma Thompson - Tech Writer',
      dueDate: '2024-02-20'
    },
    // RECORD_KEEPING
    {
      category: 'RECORD_KEEPING',
      title: 'Automatic Logging',
      description: 'Technical capability for automatic recording of events (logs)',
      regulatoryReference: 'Article 12(1)',
      status: 'IMPLEMENTED',
      priority: 'CRITICAL',
      notes: 'Comprehensive logging implemented using Datadog. Logs include all predictions, user interactions, and system events.',
      assignedTo: 'James Kumar - DevOps',
      dueDate: '2024-01-30'
    },
    {
      category: 'RECORD_KEEPING',
      title: 'Log Retention',
      description: 'Keep logs for period appropriate to intended purpose, minimum 6 months',
      regulatoryReference: 'Article 12(1)',
      status: 'IMPLEMENTED',
      priority: 'HIGH',
      notes: '12-month log retention policy implemented with automated archival to S3 Glacier.',
      assignedTo: 'James Kumar - DevOps',
      dueDate: '2024-01-30'
    },
    {
      category: 'RECORD_KEEPING',
      title: 'Cybersecurity Logging',
      description: 'Logs protected by appropriate cybersecurity measures',
      regulatoryReference: 'Article 12(1)',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      notes: 'Encryption at rest implemented. Working on tamper-proof logging mechanism.',
      assignedTo: 'James Kumar - DevOps',
      dueDate: '2024-03-20'
    },
    // TRANSPARENCY
    {
      category: 'TRANSPARENCY',
      title: 'User Instructions',
      description: 'Provide clear and adequate instructions for use',
      regulatoryReference: 'Article 13(1)',
      status: 'IMPLEMENTED',
      priority: 'CRITICAL',
      notes: 'User manual and onboarding guides created. Covers system capabilities, limitations, and proper usage.',
      assignedTo: 'Emma Thompson - Tech Writer',
      dueDate: '2024-02-25'
    },
    {
      category: 'TRANSPARENCY',
      title: 'System Characteristics',
      description: 'Information on AI system characteristics, capabilities and limitations',
      regulatoryReference: 'Article 13(3)(a)',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      notes: 'Capabilities documented. Need to expand limitations section with edge cases.',
      assignedTo: 'Emma Thompson - Tech Writer',
      dueDate: '2024-04-05'
    },
    {
      category: 'TRANSPARENCY',
      title: 'Performance Information',
      description: 'Information on level of accuracy, robustness and cybersecurity',
      regulatoryReference: 'Article 13(3)(b)',
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      notes: 'Waiting for final benchmark results before documenting.',
      assignedTo: 'Michael Rodriguez - Data Lead',
      dueDate: '2024-05-01'
    },
    // HUMAN_OVERSIGHT
    {
      category: 'HUMAN_OVERSIGHT',
      title: 'Human Oversight Measures',
      description: 'Design system to enable effective oversight by natural persons',
      regulatoryReference: 'Article 14(1)',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      notes: 'HR managers can review all AI recommendations. Working on explainability dashboard.',
      assignedTo: 'Sarah Chen - CTO',
      dueDate: '2024-04-10'
    },
    {
      category: 'HUMAN_OVERSIGHT',
      title: 'Oversight Capabilities',
      description: 'Provide measures to fully understand system outputs',
      regulatoryReference: 'Article 14(4)(a)',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      notes: 'SHAP explainability integrated. Need user training on interpretation.',
      assignedTo: 'Sarah Chen - CTO',
      dueDate: '2024-04-15'
    },
    {
      category: 'HUMAN_OVERSIGHT',
      title: 'Intervention Capability',
      description: 'Ability to intervene or interrupt system operation',
      regulatoryReference: 'Article 14(4)(c)',
      status: 'IMPLEMENTED',
      priority: 'CRITICAL',
      notes: 'Emergency stop functionality and manual override capabilities implemented and tested.',
      assignedTo: 'Sarah Chen - CTO',
      dueDate: '2024-02-05'
    },
    // ACCURACY_ROBUSTNESS
    {
      category: 'ACCURACY_ROBUSTNESS',
      title: 'Accuracy Level',
      description: 'Achieve appropriate level of accuracy as per intended purpose',
      regulatoryReference: 'Article 15(1)',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      notes: 'Current accuracy: 87%. Target: 90%. Retraining model with additional data.',
      assignedTo: 'Michael Rodriguez - Data Lead',
      dueDate: '2024-04-20'
    },
    {
      category: 'ACCURACY_ROBUSTNESS',
      title: 'Robustness',
      description: 'System resilient against errors, faults, and inconsistencies',
      regulatoryReference: 'Article 15(3)',
      status: 'NOT_STARTED',
      priority: 'HIGH',
      notes: 'Robustness testing plan drafted. Awaiting resource allocation.',
      assignedTo: 'Michael Rodriguez - Data Lead',
      dueDate: '2024-05-10'
    },
    {
      category: 'ACCURACY_ROBUSTNESS',
      title: 'Technical Resilience',
      description: 'Resilience against attempts to alter use or performance',
      regulatoryReference: 'Article 15(4)',
      status: 'NOT_STARTED',
      priority: 'HIGH',
      notes: 'Adversarial testing not yet conducted.',
      assignedTo: 'Michael Rodriguez - Data Lead',
      dueDate: '2024-05-20'
    },
    // CYBERSECURITY
    {
      category: 'CYBERSECURITY',
      title: 'Cybersecurity Measures',
      description: 'Resilient against unauthorized third parties',
      regulatoryReference: 'Article 15(1)',
      status: 'IMPLEMENTED',
      priority: 'CRITICAL',
      notes: 'SOC 2 Type II certified. Penetration testing completed with no critical findings.',
      assignedTo: 'James Kumar - DevOps',
      dueDate: '2024-02-28'
    },
    {
      category: 'CYBERSECURITY',
      title: 'Security by Design',
      description: 'Cybersecurity measures integrated into system design',
      regulatoryReference: 'Article 15(1)',
      status: 'IMPLEMENTED',
      priority: 'HIGH',
      notes: 'Threat modeling conducted during design phase. Security controls implemented across all layers.',
      assignedTo: 'James Kumar - DevOps',
      dueDate: '2024-01-25'
    },
    {
      category: 'CYBERSECURITY',
      title: 'Data Protection',
      description: 'Protection against data poisoning and model manipulation',
      regulatoryReference: 'Article 15(4)',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      notes: 'Input validation implemented. Working on model integrity monitoring system.',
      assignedTo: 'James Kumar - DevOps',
      dueDate: '2024-04-25'
    }
  ]
};

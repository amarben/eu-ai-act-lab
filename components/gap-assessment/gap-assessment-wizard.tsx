'use client';

/**
 * Gap Assessment Wizard Component
 *
 * TestIDs for Playwright demos:
 * - System Selection: gap-assessment-system-select
 * - Navigation: gap-assessment-next-step, gap-assessment-prev-step
 * - Category tabs: gap-assessment-category-{category} (lowercase, underscores)
 * - Requirement cards: gap-assessment-requirement-{index}
 * - Status selects: gap-assessment-requirement-{index}-status
 * - Priority selects: gap-assessment-requirement-{index}-priority
 * - Notes textarea: gap-assessment-requirement-{index}-notes
 * - Assigned input: gap-assessment-requirement-{index}-assigned
 * - Due date input: gap-assessment-requirement-{index}-due-date
 * - Submit button: gap-assessment-submit-button
 * - Overall score: gap-assessment-overall-score
 * - Progress bar: gap-assessment-progress-bar
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileCheck,
  Database,
  FileText,
  BookOpen,
  Eye,
  Shield,
  Lock,
  Users,
} from 'lucide-react';

// EU AI Act high-risk requirements by category
const requirementsByCategory = {
  RISK_MANAGEMENT: [
    {
      title: 'Risk Management System',
      description: 'Establish, implement, document and maintain a risk management system',
      regulatoryReference: 'Article 9(1)',
      priority: 'CRITICAL' as const,
    },
    {
      title: 'Continuous Risk Assessment',
      description: 'Continuous iterative process run throughout the AI system lifecycle',
      regulatoryReference: 'Article 9(2)',
      priority: 'HIGH' as const,
    },
    {
      title: 'Risk Identification',
      description: 'Identification and analysis of known and foreseeable risks',
      regulatoryReference: 'Article 9(2)(a)',
      priority: 'CRITICAL' as const,
    },
  ],
  DATA_GOVERNANCE: [
    {
      title: 'Training Data Governance',
      description: 'Data governance practices for training, validation and testing datasets',
      regulatoryReference: 'Article 10(2)',
      priority: 'CRITICAL' as const,
    },
    {
      title: 'Data Quality',
      description: 'Ensure data is relevant, representative, free of errors and complete',
      regulatoryReference: 'Article 10(3)',
      priority: 'HIGH' as const,
    },
    {
      title: 'Data Examination',
      description: 'Examine datasets for possible biases and identify data gaps',
      regulatoryReference: 'Article 10(2)(f)',
      priority: 'HIGH' as const,
    },
  ],
  TECHNICAL_DOCUMENTATION: [
    {
      title: 'Technical Documentation',
      description: 'Draw up technical documentation before placing on market',
      regulatoryReference: 'Article 11(1)',
      priority: 'CRITICAL' as const,
    },
    {
      title: 'System Description',
      description: 'General description of AI system including intended purpose',
      regulatoryReference: 'Annex IV(1)',
      priority: 'HIGH' as const,
    },
    {
      title: 'Development Process',
      description: 'Detailed description of system development process',
      regulatoryReference: 'Annex IV(2)',
      priority: 'MEDIUM' as const,
    },
  ],
  RECORD_KEEPING: [
    {
      title: 'Automatic Logging',
      description: 'Technical capability for automatic recording of events (logs)',
      regulatoryReference: 'Article 12(1)',
      priority: 'CRITICAL' as const,
    },
    {
      title: 'Log Retention',
      description: 'Keep logs for period appropriate to intended purpose, minimum 6 months',
      regulatoryReference: 'Article 12(1)',
      priority: 'HIGH' as const,
    },
    {
      title: 'Cybersecurity Logging',
      description: 'Logs protected by appropriate cybersecurity measures',
      regulatoryReference: 'Article 12(1)',
      priority: 'HIGH' as const,
    },
  ],
  TRANSPARENCY: [
    {
      title: 'User Instructions',
      description: 'Provide clear and adequate instructions for use',
      regulatoryReference: 'Article 13(1)',
      priority: 'CRITICAL' as const,
    },
    {
      title: 'System Characteristics',
      description: 'Information on AI system characteristics, capabilities and limitations',
      regulatoryReference: 'Article 13(3)(a)',
      priority: 'HIGH' as const,
    },
    {
      title: 'Performance Information',
      description: 'Information on level of accuracy, robustness and cybersecurity',
      regulatoryReference: 'Article 13(3)(b)',
      priority: 'MEDIUM' as const,
    },
  ],
  HUMAN_OVERSIGHT: [
    {
      title: 'Human Oversight Measures',
      description: 'Design system to enable effective oversight by natural persons',
      regulatoryReference: 'Article 14(1)',
      priority: 'CRITICAL' as const,
    },
    {
      title: 'Oversight Capabilities',
      description: 'Provide measures to fully understand system outputs',
      regulatoryReference: 'Article 14(4)(a)',
      priority: 'HIGH' as const,
    },
    {
      title: 'Intervention Capability',
      description: 'Ability to intervene or interrupt system operation',
      regulatoryReference: 'Article 14(4)(c)',
      priority: 'CRITICAL' as const,
    },
  ],
  ACCURACY_ROBUSTNESS: [
    {
      title: 'Accuracy Level',
      description: 'Achieve appropriate level of accuracy as per intended purpose',
      regulatoryReference: 'Article 15(1)',
      priority: 'CRITICAL' as const,
    },
    {
      title: 'Robustness',
      description: 'System resilient against errors, faults, and inconsistencies',
      regulatoryReference: 'Article 15(3)',
      priority: 'HIGH' as const,
    },
    {
      title: 'Technical Resilience',
      description: 'Resilience against attempts to alter use or performance',
      regulatoryReference: 'Article 15(4)',
      priority: 'HIGH' as const,
    },
  ],
  CYBERSECURITY: [
    {
      title: 'Cybersecurity Measures',
      description: 'Resilient against unauthorized third parties',
      regulatoryReference: 'Article 15(1)',
      priority: 'CRITICAL' as const,
    },
    {
      title: 'Security by Design',
      description: 'Cybersecurity measures integrated into system design',
      regulatoryReference: 'Article 15(1)',
      priority: 'HIGH' as const,
    },
    {
      title: 'Data Protection',
      description: 'Protection against data poisoning and model manipulation',
      regulatoryReference: 'Article 15(4)',
      priority: 'CRITICAL' as const,
    },
  ],
};

const categoryIcons = {
  RISK_MANAGEMENT: Shield,
  DATA_GOVERNANCE: Database,
  TECHNICAL_DOCUMENTATION: FileText,
  RECORD_KEEPING: BookOpen,
  TRANSPARENCY: Eye,
  HUMAN_OVERSIGHT: Users,
  ACCURACY_ROBUSTNESS: CheckCircle2,
  CYBERSECURITY: Lock,
};

const formSchema = z.object({
  aiSystemId: z.string().min(1, 'Please select an AI system'),
  requirements: z.array(
    z.object({
      category: z.string(),
      title: z.string(),
      description: z.string(),
      regulatoryReference: z.string(),
      status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'IMPLEMENTED', 'NOT_APPLICABLE']),
      priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
      notes: z.string().optional(),
      assignedTo: z.string().optional(),
      dueDate: z.string().optional(),
    })
  ),
});

interface System {
  id: string;
  name: string;
  businessPurpose: string;
  deploymentStatus: string;
}

interface GapAssessmentWizardProps {
  systems: System[];
  preselectedSystemId?: string;
}

export function GapAssessmentWizard({ systems, preselectedSystemId }: GapAssessmentWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof requirementsByCategory>('RISK_MANAGEMENT');

  // Initialize form with all requirements
  const initialRequirements = Object.entries(requirementsByCategory).flatMap(([category, reqs]) =>
    reqs.map((req) => ({
      category,
      ...req,
      status: 'NOT_STARTED' as const,
      notes: '',
      assignedTo: '',
      dueDate: '',
    }))
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      aiSystemId: preselectedSystemId || '',
      requirements: initialRequirements,
    },
  });

  const watchedSystemId = form.watch('aiSystemId');
  const watchedRequirements = form.watch('requirements');

  const currentSystem = systems.find((s) => s.id === watchedSystemId);

  // Calculate overall progress
  const progress = useMemo(() => {
    const totalRequirements = watchedRequirements.filter((r) => r.status !== 'NOT_APPLICABLE').length;
    const implementedRequirements = watchedRequirements.filter((r) => r.status === 'IMPLEMENTED').length;
    return totalRequirements > 0 ? (implementedRequirements / totalRequirements) * 100 : 0;
  }, [watchedRequirements]);

  // Group requirements by category for current view
  const requirementsByCurrentCategory = watchedRequirements
    .map((req, index) => ({ ...req, originalIndex: index }))
    .filter((req) => req.category === selectedCategory);

  // Count stats per category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; implemented: number; inProgress: number }> = {};
    Object.keys(requirementsByCategory).forEach((cat) => {
      const categoryReqs = watchedRequirements.filter((r) => r.category === cat && r.status !== 'NOT_APPLICABLE');
      stats[cat] = {
        total: categoryReqs.length,
        implemented: categoryReqs.filter((r) => r.status === 'IMPLEMENTED').length,
        inProgress: categoryReqs.filter((r) => r.status === 'IN_PROGRESS').length,
      };
    });
    return stats;
  }, [watchedRequirements]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/gap-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create gap assessment');
      }

      const result = await response.json();
      const assessmentId = result.data?.gapAssessment?.id;

      if (assessmentId) {
        router.push(`/dashboard/gap-assessment/${assessmentId}`);
      } else {
        router.push('/dashboard/gap-assessment');
      }
      router.refresh();
    } catch (error) {
      console.error('Error creating gap assessment:', error);
      alert(error instanceof Error ? error.message : 'Failed to create gap assessment');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Select AI System */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select AI System</CardTitle>
              <CardDescription>
                Choose the high-risk AI system for gap assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="aiSystemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI System</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!preselectedSystemId}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="gap-assessment-system-select">
                          <SelectValue placeholder="Select a high-risk AI system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {systems.map((system) => (
                          <SelectItem key={system.id} value={system.id}>
                            {system.name} - {system.deploymentStatus}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Gap assessment is required for high-risk AI systems under the EU AI Act
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {currentSystem && (
                <div className="mt-4 p-4 bg-accent rounded-lg">
                  <h4 className="font-semibold mb-2">System Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Purpose:</span> {currentSystem.businessPurpose}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {currentSystem.deploymentStatus}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!watchedSystemId}
                  data-testid="gap-assessment-next-step"
                >
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Assess Requirements */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Gap Assessment Progress</CardTitle>
                <CardDescription>
                  Track compliance status across all requirement categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Compliance Score</span>
                    <span className="text-2xl font-bold" data-testid="gap-assessment-overall-score">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" data-testid="gap-assessment-progress-bar" />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Assessment Instructions</AlertTitle>
                  <AlertDescription>
                    Review each requirement category and update the compliance status. Mark requirements as
                    Implemented, In Progress, or Not Applicable based on your current state.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Requirements by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Requirement Assessment</CardTitle>
                <CardDescription>
                  Assess compliance for each EU AI Act requirement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
                  <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
                    {Object.keys(requirementsByCategory).map((category) => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons];
                      const stats = categoryStats[category];
                      return (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="flex flex-col gap-1 p-2"
                          data-testid={`gap-assessment-category-${category.toLowerCase()}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs hidden lg:inline">
                            {category.replace('_', ' ')}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {stats.implemented}/{stats.total}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {Object.keys(requirementsByCategory).map((category) => (
                    <TabsContent key={category} value={category} className="space-y-4">
                      {requirementsByCurrentCategory.map((req, idx) => {
                        const reqIndex = req.originalIndex;
                        return (
                          <Card key={reqIndex} data-testid={`gap-assessment-requirement-${idx}`}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base">{req.title}</CardTitle>
                                  <CardDescription>{req.description}</CardDescription>
                                  <Badge variant="outline" className="mt-2">
                                    {req.regulatoryReference}
                                  </Badge>
                                </div>
                                {req.status === 'IMPLEMENTED' && (
                                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name={`requirements.${reqIndex}.status`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Compliance Status</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid={`gap-assessment-requirement-${idx}-status`}>
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                          <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
                                          <SelectItem value="NOT_APPLICABLE">Not Applicable</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`requirements.${reqIndex}.priority`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Priority</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid={`gap-assessment-requirement-${idx}-priority`}>
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="CRITICAL">Critical</SelectItem>
                                          <SelectItem value="HIGH">High</SelectItem>
                                          <SelectItem value="MEDIUM">Medium</SelectItem>
                                          <SelectItem value="LOW">Low</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`requirements.${reqIndex}.assignedTo`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Assigned To</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Person responsible"
                                          data-testid={`gap-assessment-requirement-${idx}-assigned`}
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`requirements.${reqIndex}.dueDate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Due Date</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="date"
                                          data-testid={`gap-assessment-requirement-${idx}-due-date`}
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name={`requirements.${reqIndex}.notes`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Implementation Notes</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Add notes about current state, plans, or evidence..."
                                        className="min-h-[80px]"
                                        data-testid={`gap-assessment-requirement-${idx}-notes`}
                                        {...field}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </Card>
                        );
                      })}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                data-testid="gap-assessment-prev-step"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="gap-assessment-submit-button">
                {isSubmitting ? 'Saving Assessment...' : 'Complete Assessment'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}

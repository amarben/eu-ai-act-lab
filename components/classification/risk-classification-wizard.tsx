'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Ban, Info, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';

const prohibitedPracticesOptions = [
  'Subliminal manipulation',
  'Exploitation of vulnerabilities',
  'Social scoring by public authorities',
  'Real-time biometric identification in public spaces',
  'Predictive policing based solely on profiling',
];

const highRiskCategoriesOptions = [
  'Biometric identification and categorization',
  'Management and operation of critical infrastructure',
  'Education and vocational training',
  'Employment, workers management and access to self-employment',
  'Access to essential private and public services',
  'Law enforcement',
  'Migration, asylum and border control management',
  'Administration of justice and democratic processes',
];

const formSchema = z.object({
  aiSystemId: z.string().min(1, 'Please select an AI system'),
  prohibitedPractices: z.array(z.string()),
  highRiskCategories: z.array(z.string()),
  interactsWithPersons: z.boolean(),
  reasoning: z.string().min(50, 'Please provide detailed reasoning (minimum 50 characters)'),
  applicableRequirements: z.string(),
});

interface System {
  id: string;
  name: string;
  businessPurpose: string;
  deploymentStatus: string;
  primaryUsers: string[];
  dataCategories: string[];
}

interface RiskClassificationWizardProps {
  systems: System[];
  preselectedSystemId?: string;
  selectedSystem?: System | null;
}

export function RiskClassificationWizard({
  systems,
  preselectedSystemId,
  selectedSystem,
}: RiskClassificationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      aiSystemId: preselectedSystemId || '',
      prohibitedPractices: [],
      highRiskCategories: [],
      interactsWithPersons: false,
      reasoning: '',
      applicableRequirements: '',
    },
  });

  const watchedProhibited = form.watch('prohibitedPractices');
  const watchedHighRisk = form.watch('highRiskCategories');
  const watchedInteracts = form.watch('interactsWithPersons');
  const watchedSystemId = form.watch('aiSystemId');

  // Determine risk category based on selections
  const determinedRiskCategory = () => {
    if (watchedProhibited.length > 0) {
      return 'PROHIBITED';
    } else if (watchedHighRisk.length > 0) {
      return 'HIGH_RISK';
    } else if (watchedInteracts) {
      return 'LIMITED_RISK';
    } else {
      return 'MINIMAL_RISK';
    }
  };

  const riskCategory = determinedRiskCategory();

  const getRiskInfo = (category: string) => {
    switch (category) {
      case 'PROHIBITED':
        return {
          icon: <Ban className="h-8 w-8" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/10',
          borderColor: 'border-red-200 dark:border-red-900',
          title: 'Prohibited AI Practice',
          description:
            'This AI system falls under prohibited practices and must not be deployed in the EU.',
        };
      case 'HIGH_RISK':
        return {
          icon: <AlertTriangle className="h-8 w-8" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/10',
          borderColor: 'border-orange-200 dark:border-orange-900',
          title: 'High-Risk AI System',
          description:
            'This system requires strict compliance with EU AI Act requirements including conformity assessment.',
        };
      case 'LIMITED_RISK':
        return {
          icon: <Info className="h-8 w-8" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/10',
          borderColor: 'border-yellow-200 dark:border-yellow-900',
          title: 'Limited Risk AI System',
          description:
            'This system must comply with transparency obligations (Article 52).',
        };
      case 'MINIMAL_RISK':
        return {
          icon: <ShieldCheck className="h-8 w-8" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/10',
          borderColor: 'border-green-200 dark:border-green-900',
          title: 'Minimal Risk AI System',
          description:
            'This system has no specific obligations under the EU AI Act but voluntary codes of conduct may apply.',
        };
      default:
        return {
          icon: <Info className="h-8 w-8" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Unknown Risk',
          description: 'Complete the assessment to determine risk category.',
        };
    }
  };

  const riskInfo = getRiskInfo(riskCategory);

  const currentSystem = systems.find((s) => s.id === watchedSystemId) || selectedSystem;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/risk-classification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          category: riskCategory,
          applicableRequirements: values.applicableRequirements
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create classification');
      }

      router.push('/dashboard/classification');
      router.refresh();
    } catch (error) {
      console.error('Error creating classification:', error);
      alert(error instanceof Error ? error.message : 'Failed to create classification');
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
                Choose the AI system you want to classify
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
                        <SelectTrigger data-testid="classification-system-select">
                          <SelectValue placeholder="Select an AI system" />
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
                      Select the AI system to classify for EU AI Act compliance
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
                    <div>
                      <span className="font-medium">Primary Users:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {currentSystem.primaryUsers.map((user) => (
                          <Badge key={user} variant="secondary">
                            {user.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!watchedSystemId}
                  data-testid="classification-step1-next"
                >
                  Next: Prohibited Practices
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Prohibited Practices */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Prohibited Practices</CardTitle>
              <CardDescription>
                Check if the AI system involves any prohibited practices (Article 5)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="prohibitedPractices"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Does this system involve any of the following?</FormLabel>
                      <FormDescription>
                        These practices are prohibited under the EU AI Act
                      </FormDescription>
                    </div>
                    {prohibitedPracticesOptions.map((practice) => (
                      <FormField
                        key={practice}
                        control={form.control}
                        name="prohibitedPractices"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 border p-4 rounded-lg">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(practice)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, practice])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== practice)
                                      );
                                }}
                                data-testid={`classification-prohibited-checkbox-${practice.toLowerCase().replace(/\s+/g, '-')}`}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal cursor-pointer">
                                {practice}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  data-testid="classification-step2-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  data-testid="classification-step2-next"
                >
                  Next: High-Risk Categories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: High-Risk Categories */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: High-Risk Categories</CardTitle>
              <CardDescription>
                Check if the AI system falls under high-risk categories (Annex III)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="highRiskCategories"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Does this system fall under any of these categories?</FormLabel>
                      <FormDescription>
                        High-risk AI systems have strict compliance requirements
                      </FormDescription>
                    </div>
                    {highRiskCategoriesOptions.map((category) => (
                      <FormField
                        key={category}
                        control={form.control}
                        name="highRiskCategories"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 border p-4 rounded-lg">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, category])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== category)
                                      );
                                }}
                                data-testid={`classification-highrisk-checkbox-${category.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '')}`}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal cursor-pointer">
                                {category}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  data-testid="classification-step3-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(4)}
                  data-testid="classification-step3-next"
                >
                  Next: Additional Questions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Additional Questions */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Additional Questions</CardTitle>
              <CardDescription>
                Answer these questions to complete the classification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="interactsWithPersons"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 border p-4 rounded-lg">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="classification-interacts-checkbox"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        This AI system interacts with natural persons
                      </FormLabel>
                      <FormDescription>
                        Systems that interact with people may have transparency obligations
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reasoning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classification Reasoning</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed reasoning for this classification..."
                        className="min-h-[120px]"
                        data-testid="classification-reasoning-textarea"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain why this classification is appropriate (minimum 50 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicableRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicable Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Article 52 - Transparency, Article 13 - Data Governance"
                        data-testid="classification-requirements-textarea"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      List applicable EU AI Act articles (comma-separated)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  data-testid="classification-step4-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(5)}
                  data-testid="classification-step4-next"
                >
                  Review Classification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review and Submit */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 5: Review Classification</CardTitle>
              <CardDescription>
                Review your classification before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Category Result */}
              <Alert className={`${riskInfo.bgColor} ${riskInfo.borderColor}`}>
                <div className={riskInfo.color}>{riskInfo.icon}</div>
                <AlertTitle className={riskInfo.color}>{riskInfo.title}</AlertTitle>
                <AlertDescription>{riskInfo.description}</AlertDescription>
              </Alert>

              {/* Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">AI System</h4>
                  <p className="text-sm text-muted-foreground">{currentSystem?.name}</p>
                </div>

                {watchedProhibited.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Prohibited Practices</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {watchedProhibited.map((practice) => (
                        <li key={practice}>{practice}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {watchedHighRisk.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">High-Risk Categories</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {watchedHighRisk.map((category) => (
                        <li key={category}>{category}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Interacts with Persons</h4>
                  <p className="text-sm text-muted-foreground">
                    {watchedInteracts ? 'Yes' : 'No'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Classification Reasoning</h4>
                  <p className="text-sm text-muted-foreground">{form.getValues('reasoning')}</p>
                </div>

                {form.getValues('applicableRequirements') && (
                  <div>
                    <h4 className="font-semibold mb-2">Applicable Requirements</h4>
                    <p className="text-sm text-muted-foreground">
                      {form.getValues('applicableRequirements')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(4)}
                  disabled={isSubmitting}
                  data-testid="classification-step5-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} data-testid="classification-submit-button">
                  {isSubmitting ? 'Submitting...' : 'Submit Classification'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}

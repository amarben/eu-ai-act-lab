'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const incidentSchema = z.object({
  aiSystemId: z.string().min(1, 'AI System is required'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  affectedUsersCount: z.string().optional(),
  businessImpact: z.string().min(20, 'Business impact must be at least 20 characters'),
  complianceImpact: z.string().optional(),
  affectedUsers: z.string().min(10, 'Affected users description must be at least 10 characters'),
  immediateActions: z.string().min(20, 'Immediate actions must be at least 20 characters'),
  rootCauseAnalysis: z.string().optional(),
  preventiveMeasures: z.string().optional(),
});

type FormData = z.infer<typeof incidentSchema>;

interface AISystem {
  id: string;
  name: string;
  riskClassification: {
    category: string;
  } | null;
}

interface IncidentWizardProps {
  aiSystems: AISystem[];
  reportedBy: string;
}

const STEPS = [
  { number: 1, title: 'Basic Information', description: 'AI system and incident details' },
  { number: 2, title: 'Impact Assessment', description: 'Severity and impact details' },
  { number: 3, title: 'Response Plan', description: 'Actions and prevention measures' },
];

export function IncidentWizard({ aiSystems, reportedBy }: IncidentWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      aiSystemId: '',
      title: '',
      incidentDate: new Date().toISOString().split('T')[0],
      severity: 'MEDIUM',
      category: '',
      description: '',
      affectedUsersCount: '',
      businessImpact: '',
      complianceImpact: '',
      affectedUsers: '',
      immediateActions: '',
      rootCauseAnalysis: '',
      preventiveMeasures: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create incident');
      }

      toast.success('Incident reported successfully');
      router.push(`/dashboard/incidents/${result.data.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating incident:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to report incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ['aiSystemId', 'title', 'severity', 'category', 'description'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['affectedUsers', 'businessImpact'];
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-colors ${
                  currentStep > step.number
                    ? 'bg-primary text-primary-foreground border-primary'
                    : currentStep === step.number
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground'
                }`}
              >
                {currentStep > step.number ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  step.number
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-4 transition-colors ${
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="aiSystemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI System *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="ai-system-select">
                              <SelectValue placeholder="Select AI system" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {aiSystems.map((system) => (
                              <SelectItem key={system.id} value={system.id}>
                                {system.name}
                                {system.riskClassification && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({system.riskClassification.category.replace('_', ' ')})
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>The AI system where the incident occurred</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Title *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Brief title describing the incident" />
                        </FormControl>
                        <FormDescription>A concise, descriptive title</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Provide a detailed description of what happened..."
                            rows={6}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description of the incident, including timeline and circumstances
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity Level *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="severity-select">
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
                        <FormDescription>
                          Assess the severity based on potential health, safety, or fundamental rights impact
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="category-select">
                              <SelectValue placeholder="Select incident category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="System Failure">System Failure</SelectItem>
                            <SelectItem value="Data Breach">Data Breach</SelectItem>
                            <SelectItem value="Bias Detection">Bias Detection</SelectItem>
                            <SelectItem value="Safety Incident">Safety Incident</SelectItem>
                            <SelectItem value="Performance Degradation">Performance Degradation</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Type of incident that occurred</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Impact Assessment */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="affectedUsersCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Affected Users Count</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Number of affected users"
                          />
                        </FormControl>
                        <FormDescription>
                          Approximate number of users affected by this incident
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="affectedUsers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Affected Users Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe which users were affected and how..."
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe the types of users affected and the nature of the impact
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Impact *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the business impact of this incident..."
                            rows={5}
                          />
                        </FormControl>
                        <FormDescription>
                          Detail the business consequences, revenue impact, and operational disruption
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="complianceImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compliance Impact</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe any compliance or regulatory implications..."
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          Potential violations of GDPR, EU AI Act, or other regulations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Response Plan */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="immediateActions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Immediate Actions *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the actions taken immediately after discovering the incident..."
                            rows={6}
                          />
                        </FormControl>
                        <FormDescription>
                          Detail all immediate response actions, containment measures, and notifications made
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rootCauseAnalysis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Root Cause Analysis</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the root cause of the incident..."
                            rows={5}
                          />
                        </FormControl>
                        <FormDescription>
                          Initial investigation findings and identified root causes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preventiveMeasures"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preventive Measures</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe measures to prevent similar incidents..."
                            rows={5}
                          />
                        </FormControl>
                        <FormDescription>
                          Actions planned to prevent similar incidents in the future
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">What happens next?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Incident will be assigned a unique tracking number</li>
                      <li>You'll be able to assess if authority notification is required (Article 62)</li>
                      <li>Track investigation progress and resolution</li>
                      <li>Add remediation action items</li>
                      <li>Document root cause analysis and lessons learned</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Incident
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

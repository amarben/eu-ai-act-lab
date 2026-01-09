'use client';

/**
 * Risk Register Wizard Component
 *
 * TestIDs for Playwright demos:
 * - risk-register-system-select: AI system selection
 * - risk-register-add-risk-button: Add new risk button
 * - risk-register-risk-{index}-title: Risk title input
 * - risk-register-risk-{index}-type: Risk type select
 * - risk-register-risk-{index}-description: Risk description textarea
 * - risk-register-risk-{index}-stakeholders: Stakeholders input
 * - risk-register-risk-{index}-impact-description: Potential impact textarea
 * - risk-register-risk-{index}-likelihood: Likelihood slider
 * - risk-register-risk-{index}-impact: Impact slider
 * - risk-register-risk-{index}-remove: Remove risk button
 * - risk-register-submit-button: Submit button
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const riskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['BIAS', 'SAFETY', 'MISUSE', 'TRANSPARENCY', 'PRIVACY', 'CYBERSECURITY', 'OTHER']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  affectedStakeholders: z.string().min(2, 'Please specify affected stakeholders'),
  potentialImpact: z.string().min(10, 'Potential impact description must be at least 10 characters'),
  likelihood: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
});

const formSchema = z.object({
  aiSystemId: z.string().min(1, 'Please select an AI system'),
  risks: z.array(riskSchema).min(1, 'At least one risk is required'),
});

type FormData = z.infer<typeof formSchema>;

interface RiskRegisterWizardProps {
  systems: Array<{
    id: string;
    name: string;
    businessPurpose: string;
    deploymentStatus: string;
    riskClassification?: {
      category: string;
    } | null;
  }>;
}

const RISK_TYPES = [
  { value: 'BIAS', label: 'Bias & Discrimination' },
  { value: 'SAFETY', label: 'Safety & Security' },
  { value: 'MISUSE', label: 'Misuse & Abuse' },
  { value: 'TRANSPARENCY', label: 'Transparency & Explainability' },
  { value: 'PRIVACY', label: 'Privacy & Data Protection' },
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'OTHER', label: 'Other' },
];

const calculateRiskLevel = (likelihood: number, impact: number) => {
  const score = likelihood * impact;
  if (score <= 6) return { level: 'LOW', color: 'bg-green-100 text-green-800' };
  if (score <= 15) return { level: 'MEDIUM', color: 'bg-yellow-100 text-yellow-800' };
  return { level: 'HIGH', color: 'bg-red-100 text-red-800' };
};

export function RiskRegisterWizard({ systems }: RiskRegisterWizardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      aiSystemId: '',
      risks: [
        {
          title: '',
          type: 'BIAS',
          description: '',
          affectedStakeholders: '',
          potentialImpact: '',
          likelihood: 3,
          impact: 3,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'risks',
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Process stakeholders from comma-separated string to array
      const processedData = {
        ...data,
        risks: data.risks.map((risk) => ({
          ...risk,
          affectedStakeholders: risk.affectedStakeholders
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        })),
      };

      const response = await fetch('/api/risk-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create risk register');
      }

      toast.success('Risk register created successfully');
      router.push(`/dashboard/risk-management/${result.data.riskRegister.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating risk register:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create risk register');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSystemId = form.watch('aiSystemId');
  const selectedSystem = systems.find((s) => s.id === selectedSystemId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Select AI System */}
        <Card>
          <CardHeader>
            <CardTitle>Select AI System</CardTitle>
            <CardDescription>
              Choose the AI system for which you want to create a risk register
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="aiSystemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI System</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="risk-register-system-select">
                        <SelectValue placeholder="Select an AI system" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {systems.map((system) => (
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedSystem && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">{selectedSystem.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSystem.businessPurpose}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{selectedSystem.deploymentStatus}</Badge>
                  {selectedSystem.riskClassification && (
                    <Badge
                      variant={
                        selectedSystem.riskClassification.category === 'HIGH_RISK'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {selectedSystem.riskClassification.category.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Add Risks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Identify Risks</CardTitle>
                <CardDescription>
                  Add at least one risk to create the risk register. You can add more risks later.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    title: '',
                    type: 'BIAS',
                    description: '',
                    affectedStakeholders: '',
                    potentialImpact: '',
                    likelihood: 3,
                    impact: 3,
                  })
                }
                data-testid="risk-register-add-risk-button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Risk
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => {
              const likelihood = form.watch(`risks.${index}.likelihood`) || 3;
              const impact = form.watch(`risks.${index}.impact`) || 3;
              const { level, color } = calculateRiskLevel(likelihood, impact);

              return (
                <Card key={field.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">Risk #{index + 1}</h4>
                      <Badge className={color}>{level}</Badge>
                      <span className="text-sm text-muted-foreground">
                        (Score: {likelihood * impact})
                      </span>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        data-testid={`risk-register-risk-${index}-remove`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`risks.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Risk Title *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Algorithmic bias in hiring decisions"
                                data-testid={`risk-register-risk-${index}-title`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`risks.${index}.type`}
                        render={({ field}) => (
                          <FormItem>
                            <FormLabel>Risk Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid={`risk-register-risk-${index}-type`}>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {RISK_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`risks.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe the risk in detail..."
                              rows={3}
                              data-testid={`risk-register-risk-${index}-description`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`risks.${index}.affectedStakeholders`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Affected Stakeholders *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Job applicants, HR team, Hiring managers (comma-separated)"
                              data-testid={`risk-register-risk-${index}-stakeholders`}
                            />
                          </FormControl>
                          <FormDescription>Separate multiple stakeholders with commas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`risks.${index}.potentialImpact`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potential Impact *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe the potential consequences if this risk materializes..."
                              rows={3}
                              data-testid={`risk-register-risk-${index}-impact-description`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`risks.${index}.likelihood`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Likelihood: {field.value}/5</FormLabel>
                            <FormControl>
                              <Slider
                                min={1}
                                max={5}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                data-testid={`risk-register-risk-${index}-likelihood`}
                              />
                            </FormControl>
                            <FormDescription>How likely is this risk to occur?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`risks.${index}.impact`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impact: {field.value}/5</FormLabel>
                            <FormControl>
                              <Slider
                                min={1}
                                max={5}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                data-testid={`risk-register-risk-${index}-impact`}
                              />
                            </FormControl>
                            <FormDescription>What is the severity of the impact?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}

            {fields.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  At least one risk is required to create a risk register. Click &quot;Add Risk&quot; to get
                  started.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/risk-management')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !selectedSystemId}
            data-testid="risk-register-submit-button"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Risk Register
          </Button>
        </div>
      </form>
    </Form>
  );
}

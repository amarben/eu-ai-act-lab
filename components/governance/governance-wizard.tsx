'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Trash2, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

const roleSchema = z.object({
  roleType: z.enum(['SYSTEM_OWNER', 'RISK_OWNER', 'HUMAN_OVERSIGHT', 'DATA_PROTECTION_OFFICER', 'TECHNICAL_LEAD', 'COMPLIANCE_OFFICER']),
  assignedTo: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  responsibilities: z.string().optional(),
  appointedDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

const governanceSchema = z.object({
  aiSystemId: z.string().cuid('Please select an AI system'),
  roles: z.array(roleSchema).min(1, 'At least one role must be defined'),
});

type FormData = z.infer<typeof governanceSchema>;

interface AISystem {
  id: string;
  name: string;
  description: string | null;
  riskClassification?: {
    category: string;
  } | null;
}

interface GovernanceWizardProps {
  availableSystems: AISystem[];
}

const ROLE_TYPES = [
  {
    value: 'SYSTEM_OWNER',
    label: 'System Owner',
    description: 'Overall responsibility for the AI system',
    recommended: true,
  },
  {
    value: 'RISK_OWNER',
    label: 'Risk Owner',
    description: 'Responsible for risk management and mitigation',
    recommended: true,
  },
  {
    value: 'HUMAN_OVERSIGHT',
    label: 'Human Oversight',
    description: 'Ensures human supervision of AI decisions',
    recommended: true,
  },
  {
    value: 'DATA_PROTECTION_OFFICER',
    label: 'Data Protection Officer',
    description: 'Ensures GDPR and data privacy compliance',
    recommended: false,
  },
  {
    value: 'TECHNICAL_LEAD',
    label: 'Technical Lead',
    description: 'Technical implementation and maintenance',
    recommended: false,
  },
  {
    value: 'COMPLIANCE_OFFICER',
    label: 'Compliance Officer',
    description: 'Ensures regulatory compliance (EU AI Act)',
    recommended: true,
  },
] as const;

export function GovernanceWizard({ availableSystems }: GovernanceWizardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(governanceSchema),
    defaultValues: {
      aiSystemId: '',
      roles: [
        {
          roleType: 'SYSTEM_OWNER',
          assignedTo: '',
          email: '',
          responsibilities: '',
          isActive: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'roles',
  });

  const selectedSystemId = form.watch('aiSystemId');
  const selectedSystem = availableSystems.find((s) => s.id === selectedSystemId);
  const isHighRisk =
    selectedSystem?.riskClassification?.category === 'HIGH_RISK' ||
    selectedSystem?.riskClassification?.category === 'PROHIBITED';

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create governance structure');
      }

      toast.success('Governance structure created successfully');
      router.push('/dashboard/governance');
      router.refresh();
    } catch (error) {
      console.error('Error creating governance:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create governance structure');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRole = (roleType?: string) => {
    append({
      roleType: (roleType as any) || 'COMPLIANCE_OFFICER',
      assignedTo: '',
      email: '',
      responsibilities: '',
      isActive: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {step === 1 && 'Step 1: Select AI System'}
              {step === 2 && 'Step 2: Assign Roles'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Choose the AI system for which you want to define governance'}
              {step === 2 && 'Define roles and assign responsible individuals'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={step === 1 ? 'default' : 'outline'}>1</Badge>
            <Badge variant={step === 2 ? 'default' : 'outline'}>2</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: System Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="aiSystemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI System *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-ai-system">
                            <SelectValue placeholder="Select an AI system..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSystems.map((system) => (
                            <SelectItem key={system.id} value={system.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{system.name}</span>
                                {system.riskClassification && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {system.riskClassification.category.replace('_', ' ')}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedSystem && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">{selectedSystem.name}</h4>
                    {selectedSystem.description && (
                      <p className="text-sm text-muted-foreground">{selectedSystem.description}</p>
                    )}
                    {isHighRisk && (
                      <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-900">
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                          <Shield className="h-4 w-4 inline mr-1" />
                          This is a high-risk system. Consider assigning all recommended roles.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!selectedSystemId}
                    data-testid="next-step-button"
                  >
                    Next: Assign Roles
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Role Assignment */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Recommended Roles Guide */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-900">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    Recommended Roles
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    {ROLE_TYPES.filter((r) => r.recommended).map((role) => (
                      <li key={role.value}>
                        • <strong>{role.label}</strong>: {role.description}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Role Fields */}
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Role {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            data-testid={`remove-role-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`roles.${index}.roleType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid={`role-type-${index}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ROLE_TYPES.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      <div>
                                        <div className="font-medium">{role.label}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {role.description}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`roles.${index}.assignedTo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assigned To *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Full name"
                                  data-testid={`assigned-to-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`roles.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="email@example.com"
                                  data-testid={`email-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`roles.${index}.appointedDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Appointed Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid={`appointed-date-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`roles.${index}.responsibilities`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsibilities</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Describe specific responsibilities..."
                                rows={3}
                                data-testid={`responsibilities-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`roles.${index}.isActive`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid={`is-active-${index}`}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Active Role</FormLabel>
                              <FormDescription>This person is currently active in this role</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addRole()}
                  className="w-full"
                  data-testid="add-role-button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Role
                </Button>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    data-testid="back-button"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting} data-testid="submit-governance-button">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Governance Structure
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

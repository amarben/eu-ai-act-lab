'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const treatmentSchema = z.object({
  treatmentDecision: z.enum(['ACCEPT', 'MITIGATE', 'TRANSFER', 'AVOID']),
  treatmentJustification: z.string().min(10, 'Justification must be at least 10 characters'),
  residualLikelihood: z.number().min(1).max(5).optional(),
  residualImpact: z.number().min(1).max(5).optional(),
});

type FormData = z.infer<typeof treatmentSchema>;

interface Risk {
  id: string;
  treatmentDecision: string | null;
  treatmentJustification: string | null;
  residualLikelihood: number | null;
  residualImpact: number | null;
  likelihood: number;
  impact: number;
}

interface TreatmentDecisionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  risk: Risk;
}

const TREATMENT_OPTIONS = [
  {
    value: 'ACCEPT',
    label: 'Accept',
    description: 'Accept the risk and take no action (risk is within acceptable limits)',
  },
  {
    value: 'MITIGATE',
    label: 'Mitigate',
    description: 'Implement controls to reduce likelihood or impact',
  },
  {
    value: 'TRANSFER',
    label: 'Transfer',
    description: 'Transfer risk to third party (e.g., insurance, outsourcing)',
  },
  {
    value: 'AVOID',
    label: 'Avoid',
    description: 'Eliminate the risk by not proceeding with the activity',
  },
];

export function TreatmentDecisionDialog({ isOpen, onClose, risk }: TreatmentDecisionDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      treatmentDecision: (risk.treatmentDecision as any) || 'MITIGATE',
      treatmentJustification: risk.treatmentJustification || '',
      residualLikelihood: risk.residualLikelihood || risk.likelihood,
      residualImpact: risk.residualImpact || risk.impact,
    },
  });

  // Reset form when risk changes
  useEffect(() => {
    form.reset({
      treatmentDecision: (risk.treatmentDecision as any) || 'MITIGATE',
      treatmentJustification: risk.treatmentJustification || '',
      residualLikelihood: risk.residualLikelihood || risk.likelihood,
      residualImpact: risk.residualImpact || risk.impact,
    });
  }, [risk, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/risks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskId: risk.id,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update treatment decision');
      }

      toast.success('Treatment decision updated successfully');
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error updating treatment decision:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update treatment decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const treatmentDecision = form.watch('treatmentDecision');
  const showResidualRisk = treatmentDecision === 'MITIGATE';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Risk Treatment Decision</DialogTitle>
          <DialogDescription>
            Decide how to handle this risk and estimate residual risk after treatment
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Treatment Decision */}
            <FormField
              control={form.control}
              name="treatmentDecision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Decision *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TREATMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Justification */}
            <FormField
              control={form.control}
              name="treatmentJustification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Explain why this treatment decision was chosen and how it addresses the risk..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Residual Risk (only for MITIGATE) */}
            {showResidualRisk && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <h4 className="font-medium mb-2">Residual Risk Assessment</h4>
                  <p className="text-sm text-muted-foreground">
                    Estimate the remaining risk after mitigation actions are implemented
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="residualLikelihood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residual Likelihood: {field.value}/5</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value || 1]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>After mitigation</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="residualImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residual Impact: {field.value}/5</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value || 1]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>After mitigation</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Inherent Risk Score:</span>
                    <span>{risk.likelihood * risk.impact}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="font-medium">Residual Risk Score:</span>
                    <span>
                      {(form.watch('residualLikelihood') || 1) * (form.watch('residualImpact') || 1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Decision
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

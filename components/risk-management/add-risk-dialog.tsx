'use client';

// Add Risk Dialog Component
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const riskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['BIAS', 'SAFETY', 'MISUSE', 'TRANSPARENCY', 'PRIVACY', 'CYBERSECURITY', 'OTHER']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  affectedStakeholders: z.string().min(2, 'Please specify affected stakeholders'),
  potentialImpact: z.string().min(10, 'Potential impact must be at least 10 characters'),
  likelihood: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
});

type FormData = z.infer<typeof riskSchema>;

interface AddRiskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  riskRegisterId: string;
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

export function AddRiskDialog({ isOpen, onClose, riskRegisterId }: AddRiskDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(riskSchema),
    defaultValues: {
      title: '',
      type: 'BIAS',
      description: '',
      affectedStakeholders: '',
      potentialImpact: '',
      likelihood: 3,
      impact: 3,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const processedData = {
        riskRegisterId,
        ...data,
        affectedStakeholders: data.affectedStakeholders
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const response = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to add risk');
      }

      toast.success('Risk added successfully');
      form.reset();
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error adding risk:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add risk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const likelihood = form.watch('likelihood') || 3;
  const impact = form.watch('impact') || 3;
  const { level, color } = calculateRiskLevel(likelihood, impact);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Risk</DialogTitle>
          <DialogDescription>
            Identify and document a new risk for this AI system
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Risk Level Preview */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Current Risk Level:</span>
              <Badge className={color}>{level}</Badge>
              <span className="text-sm text-muted-foreground">
                (Score: {likelihood × impact})
              </span>
            </div>

            {/* Title and Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Algorithmic bias in hiring" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the risk in detail..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Affected Stakeholders */}
            <FormField
              control={form.control}
              name="affectedStakeholders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affected Stakeholders *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Job applicants, HR team (comma-separated)"
                    />
                  </FormControl>
                  <FormDescription>Separate multiple stakeholders with commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Potential Impact */}
            <FormField
              control={form.control}
              name="potentialImpact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potential Impact *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the potential consequences if this risk materializes..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Likelihood and Impact Sliders */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="likelihood"
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
                      />
                    </FormControl>
                    <FormDescription>How likely is this risk to occur?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="impact"
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
                      />
                    </FormControl>
                    <FormDescription>What is the severity of the impact?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Risk
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

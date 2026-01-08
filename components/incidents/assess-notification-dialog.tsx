'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const assessmentSchema = z.object({
  isSeriousIncident: z.boolean(),
  hasHealthSafetyImpact: z.boolean(),
  hasFundamentalRightsViolation: z.boolean(),
  affectsHighRiskSystem: z.boolean(),
  authorityContact: z.string().optional(),
  notificationTemplate: z.string().optional(),
});

type FormData = z.infer<typeof assessmentSchema>;

interface AssessNotificationDialogProps {
  incidentId: string;
  incidentTitle: string;
  currentAssessment?: {
    isSeriousIncident: boolean;
    hasHealthSafetyImpact: boolean;
    hasFundamentalRightsViolation: boolean;
    affectsHighRiskSystem: boolean;
    notificationRequired: boolean;
    assessedBy: string;
    authorityContact?: string | null;
    notificationTemplate?: string | null;
  } | null;
  assessedBy: string;
}

export function AssessNotificationDialog({
  incidentId,
  incidentTitle,
  currentAssessment,
  assessedBy,
}: AssessNotificationDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      isSeriousIncident: currentAssessment?.isSeriousIncident || false,
      hasHealthSafetyImpact: currentAssessment?.hasHealthSafetyImpact || false,
      hasFundamentalRightsViolation: currentAssessment?.hasFundamentalRightsViolation || false,
      affectsHighRiskSystem: currentAssessment?.affectsHighRiskSystem || false,
      authorityContact: currentAssessment?.authorityContact || '',
      notificationTemplate: currentAssessment?.notificationTemplate || '',
    },
  });

  // Watch form values to calculate notification requirement
  const watchedValues = form.watch();
  const notificationRequired =
    watchedValues.isSeriousIncident &&
    (watchedValues.hasHealthSafetyImpact ||
      watchedValues.hasFundamentalRightsViolation ||
      watchedValues.affectsHighRiskSystem);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/incidents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          notificationAssessment: {
            isSeriousIncident: data.isSeriousIncident,
            hasHealthSafetyImpact: data.hasHealthSafetyImpact,
            hasFundamentalRightsViolation: data.hasFundamentalRightsViolation,
            affectsHighRiskSystem: data.affectsHighRiskSystem,
            notificationRequired,
            assessedBy,
            authorityContact: data.authorityContact || undefined,
            notificationTemplate: data.notificationTemplate || undefined,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to save assessment');
      }

      toast.success(
        notificationRequired
          ? 'Assessment saved - Authority notification required'
          : 'Assessment saved - No notification required'
      );
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={currentAssessment ? 'outline' : 'default'}>
          <Shield className="mr-2 h-4 w-4" />
          {currentAssessment ? 'Update Assessment' : 'Assess Notification'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Authority Notification Assessment</DialogTitle>
          <DialogDescription>
            Assess whether this incident requires notification to authorities under EU AI Act Article 62
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <strong>Incident:</strong> {incidentTitle}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Assessment Criteria */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Assessment Criteria</h3>
              <p className="text-xs text-muted-foreground">
                According to EU AI Act Article 62, serious incidents must be reported to the relevant market
                surveillance authority if they meet certain criteria. Evaluate each criterion below:
              </p>

              <FormField
                control={form.control}
                name="isSeriousIncident"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        This is a Serious Incident
                      </FormLabel>
                      <FormDescription>
                        An incident that directly or indirectly leads to any of the following:
                        death of a person or serious harm to health, serious and irreversible disruption
                        of critical infrastructure, or breaches of fundamental rights protections.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasHealthSafetyImpact"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        Impact on Health or Safety
                      </FormLabel>
                      <FormDescription>
                        The incident has resulted in or could result in death, serious injury,
                        or serious harm to physical or mental health of individuals.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasFundamentalRightsViolation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        Violation of Fundamental Rights
                      </FormLabel>
                      <FormDescription>
                        The incident has resulted in a breach of obligations under EU law intended
                        to protect fundamental rights (e.g., non-discrimination, privacy, data protection).
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affectsHighRiskSystem"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        Affects High-Risk AI System
                      </FormLabel>
                      <FormDescription>
                        The incident involves a high-risk AI system as defined in EU AI Act Annex III
                        (biometric identification, critical infrastructure, education, employment, etc.).
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Assessment Result */}
            <Card className={
              notificationRequired
                ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-900'
                : watchedValues.isSeriousIncident
                  ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/10 dark:border-blue-900'
                  : 'border-gray-200 bg-gray-50 dark:bg-gray-950/10 dark:border-gray-800'
            }>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  {notificationRequired ? (
                    <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  ) : watchedValues.isSeriousIncident ? (
                    <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-semibold ${
                      notificationRequired
                        ? 'text-orange-900 dark:text-orange-100'
                        : watchedValues.isSeriousIncident
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {notificationRequired
                        ? 'Authority Notification Required'
                        : watchedValues.isSeriousIncident
                          ? 'Serious Incident - Additional Criteria Not Met'
                          : 'Not a Serious Incident - No Notification Required'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      notificationRequired
                        ? 'text-orange-800 dark:text-orange-200'
                        : watchedValues.isSeriousIncident
                          ? 'text-blue-800 dark:text-blue-200'
                          : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notificationRequired ? (
                        <>
                          This incident meets the criteria for serious incident notification.
                          You must notify the relevant market surveillance authority within 15 days
                          of becoming aware of the incident.
                        </>
                      ) : watchedValues.isSeriousIncident ? (
                        <>
                          While this is a serious incident, it does not meet additional criteria
                          requiring authority notification. Continue to document and track this incident.
                        </>
                      ) : (
                        <>
                          This incident does not meet the threshold for serious incident notification.
                          Continue to track and manage as a regular incident.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information (shown if notification required) */}
            {notificationRequired && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="authorityContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authority Contact Information</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., market.surveillance@authority.eu"
                        />
                      </FormControl>
                      <FormDescription>
                        Contact details for the relevant market surveillance authority
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notificationTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Draft (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Draft notification content following Article 62 requirements..."
                          rows={8}
                        />
                      </FormControl>
                      <FormDescription>
                        Draft notification to be submitted to authorities. Should include: incident description,
                        AI system details, affected persons, mitigation measures, and corrective actions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Assessment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

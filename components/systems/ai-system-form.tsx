'use client';

/**
 * AI System Form TestIDs
 *
 * Input Fields:
 * - system-name-input: System name input field
 * - system-business-purpose-textarea: Business purpose textarea
 * - system-description-textarea: Description textarea (optional)
 * - system-technical-approach-textarea: Technical approach textarea (optional)
 * - system-deployment-date-input: Deployment date input
 * - system-data-processed-input: Data processed input field (press Enter to add)
 *
 * Checkboxes (Primary Users):
 * - system-user-checkbox-{userType}: User type checkboxes (e.g., system-user-checkbox-EMPLOYEES)
 *
 * Select Dropdowns:
 * - system-deployment-status-select: Deployment status select trigger
 *
 * Buttons:
 * - system-submit-button: Submit form button
 * - system-cancel-button: Cancel button
 * - system-data-tag-remove-{index}: Remove data tag buttons
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aiSystemSchema, type AISystemInput } from '@/lib/validations/ai-system';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { DEPLOYMENT_STATUSES, USER_TYPES } from '@/lib/constants';

export function AISystemForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AISystemInput>({
    resolver: zodResolver(aiSystemSchema),
    defaultValues: {
      primaryUsers: [],
      dataProcessed: [],
      thirdPartyProviders: [],
    },
  });

  const primaryUsers = watch('primaryUsers') || [];
  const dataProcessed = watch('dataProcessed') || [];

  const onSubmit = async (data: AISystemInput) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to create AI system');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard/systems');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">System Name *</Label>
        <Input
          id="name"
          data-testid="system-name-input"
          {...register('name')}
          placeholder="e.g., Customer Service Chatbot"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Business Purpose */}
      <div className="space-y-2">
        <Label htmlFor="businessPurpose">Business Purpose *</Label>
        <Textarea
          id="businessPurpose"
          data-testid="system-business-purpose-textarea"
          {...register('businessPurpose')}
          placeholder="Describe the primary business purpose of this AI system"
          rows={3}
          disabled={isLoading}
        />
        {errors.businessPurpose && (
          <p className="text-sm text-destructive">{errors.businessPurpose.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          data-testid="system-description-textarea"
          {...register('description')}
          placeholder="Additional details about the system"
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Technical Approach */}
      <div className="space-y-2">
        <Label htmlFor="technicalApproach">Technical Approach (Optional)</Label>
        <Textarea
          id="technicalApproach"
          data-testid="system-technical-approach-textarea"
          {...register('technicalApproach')}
          placeholder="e.g., Deep Learning, Natural Language Processing, Computer Vision"
          rows={2}
          disabled={isLoading}
        />
      </div>

      {/* Primary Users */}
      <div className="space-y-2">
        <Label>Primary Users *</Label>
        <div className="grid grid-cols-2 gap-4">
          {USER_TYPES.map((userType) => (
            <div key={userType} className="flex items-center space-x-2">
              <Checkbox
                id={`user-${userType}`}
                data-testid={`system-user-checkbox-${userType}`}
                checked={primaryUsers.includes(userType)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setValue('primaryUsers', [...primaryUsers, userType]);
                  } else {
                    setValue('primaryUsers', primaryUsers.filter((u) => u !== userType));
                  }
                }}
                disabled={isLoading}
              />
              <Label htmlFor={`user-${userType}`} className="font-normal cursor-pointer">
                {userType.replace('_', ' ')}
              </Label>
            </div>
          ))}
        </div>
        {errors.primaryUsers && (
          <p className="text-sm text-destructive">{errors.primaryUsers.message}</p>
        )}
      </div>

      {/* Deployment Status */}
      <div className="space-y-2">
        <Label htmlFor="deploymentStatus">Deployment Status *</Label>
        <Select
          onValueChange={(value) => setValue('deploymentStatus', value as any)}
          disabled={isLoading}
        >
          <SelectTrigger data-testid="system-deployment-status-select">
            <SelectValue placeholder="Select deployment status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEPLOYMENT_STATUSES).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {key.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.deploymentStatus && (
          <p className="text-sm text-destructive">{errors.deploymentStatus.message}</p>
        )}
      </div>

      {/* Deployment Date */}
      <div className="space-y-2">
        <Label htmlFor="deploymentDate">Deployment Date (Optional)</Label>
        <Input
          id="deploymentDate"
          data-testid="system-deployment-date-input"
          type="date"
          {...register('deploymentDate', {
            setValueAs: (v) => (v ? new Date(v) : undefined),
          })}
          disabled={isLoading}
        />
      </div>

      {/* Data Processed */}
      <div className="space-y-2">
        <Label htmlFor="dataProcessedInput">Types of Data Processed *</Label>
        <Input
          id="dataProcessedInput"
          data-testid="system-data-processed-input"
          placeholder="e.g., Customer data, Images, Text (press Enter to add)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const value = e.currentTarget.value.trim();
              if (value && !dataProcessed.includes(value)) {
                setValue('dataProcessed', [...dataProcessed, value]);
                e.currentTarget.value = '';
              }
            }
          }}
          disabled={isLoading}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {dataProcessed.map((data, index) => (
            <div
              key={index}
              className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center space-x-2"
            >
              <span>{data}</span>
              <button
                type="button"
                data-testid={`system-data-tag-remove-${index}`}
                onClick={() =>
                  setValue('dataProcessed', dataProcessed.filter((_, i) => i !== index))
                }
                className="hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {errors.dataProcessed && (
          <p className="text-sm text-destructive">{errors.dataProcessed.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" data-testid="system-submit-button" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create AI System
        </Button>
        <Button
          type="button"
          data-testid="system-cancel-button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

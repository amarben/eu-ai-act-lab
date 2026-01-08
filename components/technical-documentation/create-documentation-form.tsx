'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AISystem {
  id: string;
  name: string;
  businessPurpose: string;
  deploymentStatus: string;
}

interface CreateDocumentationFormProps {
  availableSystems: AISystem[];
  preselectedSystemId?: string;
  userId: string;
}

export function CreateDocumentationForm({
  availableSystems,
  preselectedSystemId,
  userId,
}: CreateDocumentationFormProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    aiSystemId: preselectedSystemId || '',
    preparedBy: '',
  });

  const selectedSystem = availableSystems.find((s) => s.id === formData.aiSystemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.aiSystemId) {
      toast.error('Please select an AI system');
      return;
    }

    if (!formData.preparedBy) {
      toast.error('Please enter who prepared this documentation');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/technical-documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create documentation');
      }

      const data = await response.json();
      toast.success('Technical documentation created successfully');
      router.push(`/dashboard/documentation/${data.documentation.id}`);
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create documentation');
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentation Details
          </CardTitle>
          <CardDescription>
            Select the AI system and provide initial information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI System Selection */}
          <div className="space-y-2">
            <Label htmlFor="aiSystemId">
              AI System <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.aiSystemId}
              onValueChange={(value) => setFormData({ ...formData, aiSystemId: value })}
            >
              <SelectTrigger id="aiSystemId">
                <SelectValue placeholder="Select an AI system..." />
              </SelectTrigger>
              <SelectContent>
                {availableSystems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSystem && (
              <p className="text-sm text-muted-foreground">
                {selectedSystem.businessPurpose}
              </p>
            )}
          </div>

          {/* Prepared By */}
          <div className="space-y-2">
            <Label htmlFor="preparedBy">
              Prepared By <span className="text-destructive">*</span>
            </Label>
            <Input
              id="preparedBy"
              placeholder="Enter the name of the person preparing this documentation"
              value={formData.preparedBy}
              onChange={(e) => setFormData({ ...formData, preparedBy: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              This person is responsible for creating and maintaining the technical documentation
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">What happens next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>A new technical documentation record will be created</li>
              <li>You'll be able to fill in the 8 required sections (EU AI Act Article 11)</li>
              <li>Use AI assistance to generate professional content</li>
              <li>Upload supporting documents and attachments</li>
              <li>Track versions and approval workflow</li>
              <li>Export as PDF or Word document when ready</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Documentation'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/documentation')}
          disabled={isCreating}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

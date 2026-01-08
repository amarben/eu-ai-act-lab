'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentationEditorProps {
  documentation: any;
  userId: string;
  sections: Array<{
    id: string;
    label: string;
    icon: any;
    description: string;
    regulatoryRef: string;
  }>;
}

export function DocumentationEditor({ documentation, userId, sections }: DocumentationEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    intendedUse: documentation.intendedUse || '',
    foreseeableMisuse: documentation.foreseeableMisuse || '',
    systemArchitecture: documentation.systemArchitecture || '',
    trainingData: documentation.trainingData || '',
    modelPerformance: documentation.modelPerformance || '',
    validationTesting: documentation.validationTesting || '',
    humanOversightDoc: documentation.humanOversightDoc || '',
    cybersecurity: documentation.cybersecurity || '',
    reviewedBy: documentation.reviewedBy || '',
    approvedBy: documentation.approvedBy || '',
  });
  const [createNewVersion, setCreateNewVersion] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/technical-documentation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: documentation.id,
          ...formData,
          createNewVersion,
          versionNotes: createNewVersion ? versionNotes : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save documentation');
      }

      toast.success(createNewVersion ? 'New version created successfully' : 'Documentation saved');
      setCreateNewVersion(false);
      setVersionNotes('');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save documentation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateContent = async (sectionId: string) => {
    setIsGenerating(sectionId);
    try {
      const response = await fetch('/api/ai/generate-documentation-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiSystemName: documentation.aiSystem.name,
          businessPurpose: documentation.aiSystem.businessPurpose,
          sectionId,
          existingContent: formData[sectionId as keyof typeof formData],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      handleChange(sectionId, data.content);
      toast.success('AI content generated successfully');
    } catch (error) {
      console.error('Generate error:', error);
      toast.error('Failed to generate AI content. Please write manually.');
    } finally {
      setIsGenerating(null);
    }
  };

  const hasChanges = () => {
    return Object.keys(formData).some(
      (key) => formData[key as keyof typeof formData] !== (documentation[key] || '')
    );
  };

  return (
    <div className="space-y-6">
      {/* Save Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Save Options</CardTitle>
          <CardDescription>
            Save changes to current version or create a new version
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={isSaving || !hasChanges()}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createVersion"
                checked={createNewVersion}
                onChange={(e) => setCreateNewVersion(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="createVersion" className="text-sm cursor-pointer">
                Create new version
              </Label>
            </div>
          </div>

          {createNewVersion && (
            <div className="space-y-2 pl-4 border-l-2">
              <Label htmlFor="versionNotes">Version Notes</Label>
              <Textarea
                id="versionNotes"
                placeholder="Describe what changed in this version..."
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Approval Controls */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="reviewedBy">Reviewed By</Label>
              <Input
                id="reviewedBy"
                placeholder="Reviewer name"
                value={formData.reviewedBy}
                onChange={(e) => handleChange('reviewedBy', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approvedBy">Approved By</Label>
              <Input
                id="approvedBy"
                placeholder="Approver name"
                value={formData.approvedBy}
                onChange={(e) => handleChange('approvedBy', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Editors */}
      {sections.map((section) => {
        const SectionIcon = section.icon;
        const content = formData[section.id as keyof typeof formData] as string;
        const isGeneratingThis = isGenerating === section.id;

        return (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <SectionIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {section.label}
                      {content?.trim() && (
                        <Badge variant="secondary" className="text-xs">
                          {content.length} chars
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {section.description}
                      <br />
                      <span className="text-xs italic">{section.regulatoryRef}</span>
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateContent(section.id)}
                  disabled={isGeneratingThis}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGeneratingThis ? 'Generating...' : 'AI Assist'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Document ${section.label.toLowerCase()} as required by ${section.regulatoryRef}...`}
                value={content}
                onChange={(e) => handleChange(section.id, e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Tip: Click "AI Assist" to generate professional content based on your AI system
                details
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

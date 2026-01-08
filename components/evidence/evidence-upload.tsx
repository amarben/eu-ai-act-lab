'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Upload, Link as LinkIcon, FileText } from 'lucide-react';

interface EvidenceUploadProps {
  requirementAssessmentId: string;
  onSuccess?: () => void;
}

type EvidenceType = 'TEXT' | 'FILE' | 'LINK';

export function EvidenceUpload({ requirementAssessmentId, onSuccess }: EvidenceUploadProps) {
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('FILE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUploading(true);

    try {
      let fileData: string | undefined;
      let fileName: string | undefined;

      if (evidenceType === 'FILE' && selectedFile) {
        // Convert file to base64
        const buffer = await selectedFile.arrayBuffer();
        fileData = Buffer.from(buffer).toString('base64');
        fileName = selectedFile.name;
      }

      const response = await fetch('/api/evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirementAssessmentId,
          type: evidenceType,
          title,
          description,
          linkUrl: evidenceType === 'LINK' ? linkUrl : undefined,
          textContent: evidenceType === 'TEXT' ? textContent : undefined,
          fileName,
          fileData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload evidence');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setLinkUrl('');
      setTextContent('');
      setSelectedFile(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6" data-testid="evidence-upload-form">
      <h3 className="text-lg font-semibold mb-4">Add Evidence</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="evidence-type">Evidence Type</Label>
          <select
            id="evidence-type"
            data-testid="evidence-type-select"
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="FILE">File Upload</option>
            <option value="LINK">External Link</option>
            <option value="TEXT">Text Note</option>
          </select>
        </div>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            data-testid="evidence-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of evidence"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            data-testid="evidence-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details about this evidence"
            rows={3}
          />
        </div>

        {evidenceType === 'FILE' && (
          <div>
            <Label htmlFor="file">Upload File *</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="file"
                type="file"
                data-testid="evidence-file-input"
                onChange={handleFileChange}
                required
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.csv"
              />
              {selectedFile && (
                <span className="text-sm text-gray-600">{selectedFile.name}</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, Word, Text, Images, Excel, CSV
            </p>
          </div>
        )}

        {evidenceType === 'LINK' && (
          <div>
            <Label htmlFor="link-url">URL *</Label>
            <Input
              id="link-url"
              type="url"
              data-testid="evidence-link-input"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/documentation"
              required
            />
          </div>
        )}

        {evidenceType === 'TEXT' && (
          <div>
            <Label htmlFor="text-content">Text Content *</Label>
            <Textarea
              id="text-content"
              data-testid="evidence-text-input"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter your evidence text here..."
              rows={6}
              required
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md" data-testid="evidence-upload-error">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isUploading}
          data-testid="evidence-submit-button"
          className="w-full"
        >
          {isUploading ? (
            'Uploading...'
          ) : (
            <>
              {evidenceType === 'FILE' && <Upload className="w-4 h-4 mr-2" />}
              {evidenceType === 'LINK' && <LinkIcon className="w-4 h-4 mr-2" />}
              {evidenceType === 'TEXT' && <FileText className="w-4 h-4 mr-2" />}
              Add Evidence
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

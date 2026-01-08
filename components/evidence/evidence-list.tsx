'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Link as LinkIcon, Download, Trash2, ExternalLink } from 'lucide-react';

interface Evidence {
  id: string;
  type: 'TEXT' | 'FILE' | 'LINK';
  title: string;
  description: string | null;
  fileUrl: string | null;
  linkUrl: string | null;
  textContent: string | null;
  uploadedAt: string;
}

interface EvidenceListProps {
  requirementAssessmentId: string;
  refreshTrigger?: number;
}

export function EvidenceList({ requirementAssessmentId, refreshTrigger }: EvidenceListProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvidence = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/evidence?requirementAssessmentId=${requirementAssessmentId}`
      );

      if (!response.ok) {
        throw new Error('Failed to load evidence');
      }

      const data = await response.json();
      setEvidence(data.data.evidence || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, [requirementAssessmentId, refreshTrigger]);

  const handleDelete = async (evidenceId: string) => {
    if (!confirm('Are you sure you want to delete this evidence?')) {
      return;
    }

    try {
      const response = await fetch(`/api/evidence?id=${evidenceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete evidence');
      }

      // Reload evidence list
      loadEvidence();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete evidence');
    }
  };

  const getEvidenceIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'FILE':
        return <FileText className="w-4 h-4" />;
      case 'LINK':
        return <LinkIcon className="w-4 h-4" />;
      case 'TEXT':
        return <FileText className="w-4 h-4" />;
    }
  };

  const getEvidenceBadgeColor = (type: Evidence['type']) => {
    switch (type) {
      case 'FILE':
        return 'bg-blue-100 text-blue-800';
      case 'LINK':
        return 'bg-green-100 text-green-800';
      case 'TEXT':
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6" data-testid="evidence-list-loading">
        <p className="text-gray-500">Loading evidence...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6" data-testid="evidence-list-error">
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  if (evidence.length === 0) {
    return (
      <Card className="p-6" data-testid="evidence-list-empty">
        <p className="text-gray-500">No evidence attached yet. Add evidence to support this requirement.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3" data-testid="evidence-list">
      {evidence.map((item) => (
        <Card key={item.id} className="p-4" data-testid={`evidence-item-${item.id}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getEvidenceIcon(item.type)}
                <h4 className="font-medium" data-testid="evidence-item-title">
                  {item.title}
                </h4>
                <Badge className={getEvidenceBadgeColor(item.type)} data-testid="evidence-item-type">
                  {item.type}
                </Badge>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mb-2" data-testid="evidence-item-description">
                  {item.description}
                </p>
              )}

              {item.type === 'TEXT' && item.textContent && (
                <div className="bg-gray-50 p-3 rounded-md mt-2">
                  <p className="text-sm whitespace-pre-wrap" data-testid="evidence-item-text">
                    {item.textContent}
                  </p>
                </div>
              )}

              {item.type === 'LINK' && item.linkUrl && (
                <div className="mt-2">
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    data-testid="evidence-item-link"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {item.linkUrl}
                  </a>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-2">
                Uploaded {new Date(item.uploadedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {item.type === 'FILE' && item.fileUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(item.fileUrl!, '_blank')}
                  data-testid="evidence-download-button"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(item.id)}
                data-testid="evidence-delete-button"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

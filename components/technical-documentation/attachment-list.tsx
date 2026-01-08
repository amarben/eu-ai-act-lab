'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, Trash2, Download, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  section: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface AttachmentListProps {
  documentationId: string;
  attachments: Attachment[];
  sections: Array<{
    id: string;
    label: string;
  }>;
}

export function AttachmentList({ documentationId, attachments, sections }: AttachmentListProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('GENERAL');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('section', selectedSection);
      formData.append('documentationId', documentationId);

      const response = await fetch('/api/technical-documentation/attachments', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      toast.success('File uploaded successfully');
      setSelectedFile(null);
      setSelectedSection('GENERAL');
      router.refresh();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/technical-documentation/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete attachment');
      }

      toast.success('Attachment deleted');
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete attachment');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getSectionLabel = (sectionId: string) => {
    if (sectionId === 'GENERAL') return 'General';
    const section = sections.find((s) => s.id.toUpperCase() === sectionId);
    return section?.label || sectionId;
  };

  const groupedAttachments = attachments.reduce((acc, attachment) => {
    const section = attachment.section || 'GENERAL';
    if (!acc[section]) acc[section] = [];
    acc[section].push(attachment);
    return acc;
  }, {} as Record<string, Attachment[]>);

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Attachment
          </CardTitle>
          <CardDescription>
            Upload supporting documents for specific sections or general documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger id="section">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toUpperCase()}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="text-sm">{selectedFile.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {formatFileSize(selectedFile.size)}
                </Badge>
              </div>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments List */}
      {Object.keys(groupedAttachments).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No attachments yet. Upload supporting documents above.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedAttachments).map(([section, sectionAttachments]) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                {getSectionLabel(section)}
                <Badge variant="secondary" className="text-xs">
                  {sectionAttachments.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sectionAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(attachment.fileSize)}</span>
                          <span>•</span>
                          <span>{new Date(attachment.uploadedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>by {attachment.uploadedBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(attachment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, File } from 'lucide-react';
import { toast } from 'sonner';

interface ExportReportButtonProps {
  documentationId: string;
  systemName: string;
  version: string;
}

export function ExportReportButton({ documentationId, systemName, version }: ExportReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'docx') => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/technical-documentation/${documentationId}/export?format=${format}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export documentation');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename =
        filenameMatch?.[1] ||
        `Technical_Documentation_${systemName.replace(/[^a-zA-Z0-9]/g, '_')}_v${version}.${format}`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Documentation exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export documentation');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting} data-testid="technical-documentation-export-button">
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Documentation'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting} data-testid="technical-documentation-export-pdf">
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('docx')} disabled={isExporting} data-testid="technical-documentation-export-docx">
          <File className="h-4 w-4 mr-2" />
          Export as Word (DOCX)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

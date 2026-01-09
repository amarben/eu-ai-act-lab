'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CertificationReadiness {
  ready: boolean;
  score: number;
  missingItems: string[];
  warnings: string[];
}

interface ExportCertificateButtonProps {
  systemId: string;
  systemName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showStatus?: boolean; // Show readiness badge
}

export function ExportCertificateButton({
  systemId,
  systemName,
  variant = 'default',
  size = 'default',
  showStatus = true,
}: ExportCertificateButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isCheckingReadiness, setIsCheckingReadiness] = useState(false);
  const [readiness, setReadiness] = useState<CertificationReadiness | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | null>(null);

  // Check readiness on mount
  useEffect(() => {
    checkReadiness();
  }, [systemId]);

  const checkReadiness = async () => {
    try {
      setIsCheckingReadiness(true);
      const response = await fetch(`/api/certification/${systemId}/readiness`);

      if (!response.ok) {
        throw new Error('Failed to check certification readiness');
      }

      const result = await response.json();
      setReadiness(result.data);
    } catch (error) {
      console.error('Readiness check error:', error);
      // Set a default "unknown" state
      setReadiness({
        ready: false,
        score: 0,
        missingItems: ['Unable to verify readiness. Please try again.'],
        warnings: [],
      });
    } finally {
      setIsCheckingReadiness(false);
    }
  };

  const handleExportClick = async (format: 'pdf' | 'docx') => {
    // If not ready, show warning dialog first
    if (readiness && !readiness.ready) {
      setPendingFormat(format);
      setShowWarningDialog(true);
      return;
    }

    // If ready, export directly
    await performExport(format);
  };

  const performExport = async (format: 'pdf' | 'docx', allowDraft = false) => {
    try {
      setIsExporting(true);
      setShowWarningDialog(false);
      setPendingFormat(null);

      const url = `/api/certification/${systemId}/export?format=${format}${allowDraft ? '&allowDraft=true' : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Failed to generate certificate');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `EU_AI_Act_Certificate.${format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      const message = error instanceof Error ? error.message : 'Failed to export certificate. Please try again.';
      alert(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDraftExport = () => {
    if (pendingFormat) {
      performExport(pendingFormat, true);
    }
  };

  const getStatusBadge = () => {
    if (isCheckingReadiness) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking...
        </span>
      );
    }

    if (!readiness) {
      return null;
    }

    if (readiness.ready) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-3 w-3" />
                Ready ({readiness.score}%)
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>System meets all certification requirements</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
              <AlertCircle className="h-3 w-3" />
              {readiness.score}% Complete
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold mb-1">Not Ready for Certification</p>
            <ul className="text-xs space-y-1">
              {readiness.missingItems.slice(0, 3).map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
              {readiness.missingItems.length > 3 && (
                <li>• ...and {readiness.missingItems.length - 3} more</li>
              )}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={variant}
              size={size}
              disabled={isExporting || isCheckingReadiness}
              data-testid="certification-export-button"
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Certificate
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleExportClick('pdf')}
              data-testid="certification-export-pdf"
            >
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
              {readiness?.ready && (
                <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExportClick('docx')}
              data-testid="certification-export-docx"
            >
              <Download className="mr-2 h-4 w-4" />
              Export as Word (DOCX)
              {readiness?.ready && (
                <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
            {readiness && !readiness.ready && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 text-xs text-muted-foreground">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  System not ready for certification. Export will generate an assessment report.
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {showStatus && getStatusBadge()}
      </div>

      {/* Warning Dialog for Draft Export */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              System Not Ready for Certification
            </DialogTitle>
            <DialogDescription>
              This AI system has not completed all requirements for EU AI Act certification.
              <strong className="block mt-2">
                Compliance Score: {readiness?.score}%
              </strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm font-semibold mb-2">Outstanding Requirements:</p>
            <ul className="text-sm space-y-2 max-h-48 overflow-y-auto">
              {readiness?.missingItems.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {readiness && readiness.warnings.length > 0 && (
              <>
                <p className="text-sm font-semibold mt-4 mb-2">Warnings:</p>
                <ul className="text-sm space-y-1">
                  {readiness.warnings.map((warning, idx) => (
                    <li key={idx} className="text-muted-foreground">• {warning}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarningDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDraftExport} data-testid="certification-export-draft-confirm">
              Export Assessment Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  Users,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { ExportCertificateButton } from '@/components/certification/export-certificate-button';
import Link from 'next/link';

interface CertificationReadinessCardProps {
  systemId: string;
  systemName: string;
  className?: string;
}

interface ReadinessData {
  ready: boolean;
  score: number;
  missingItems: string[];
  warnings: string[];
  details: {
    gapAssessment: {
      exists: boolean;
      percentComplete: number;
    };
    technicalDocumentation: {
      exists: boolean;
      completeness: number;
    };
    riskManagement: {
      exists: boolean;
      highRisksUnmitigated: number;
      criticalRisksUnmitigated: number;
    };
    governance: {
      exists: boolean;
      hasRequiredRoles: boolean;
    };
  };
}

export function CertificationReadinessCard({
  systemId,
  systemName,
  className,
}: CertificationReadinessCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReadiness();
  }, [systemId]);

  const fetchReadiness = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/certification/${systemId}/readiness`);

      if (!response.ok) {
        throw new Error('Failed to fetch certification readiness');
      }

      const result = await response.json();
      setReadiness(result.data);
    } catch (err) {
      console.error('Error fetching readiness:', err);
      setError(err instanceof Error ? err.message : 'Failed to load certification status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!readiness) return null;

    if (readiness.ready) {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Ready for Certification
        </Badge>
      );
    }

    if (readiness.score >= 80) {
      return (
        <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          Almost Ready
        </Badge>
      );
    }

    if (readiness.score >= 50) {
      return (
        <Badge variant="outline">
          In Progress
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-red-300 text-red-600">
        Getting Started
      </Badge>
    );
  };

  const getComplianceAreaIcon = (area: string) => {
    switch (area) {
      case 'gap':
        return <FileText className="h-4 w-4" />;
      case 'docs':
        return <FileText className="h-4 w-4" />;
      case 'risks':
        return <Shield className="h-4 w-4" />;
      case 'governance':
        return <Users className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className} data-testid="certification-readiness-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certification Readiness
          </CardTitle>
          <CardDescription>EU AI Act compliance status</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className} data-testid="certification-readiness-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certification Readiness
          </CardTitle>
          <CardDescription>EU AI Act compliance status</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={fetchReadiness} size="sm">
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!readiness) return null;

  return (
    <Card className={className} data-testid="certification-readiness-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certification Readiness
            </CardTitle>
            <CardDescription>EU AI Act compliance status</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Compliance</span>
            <span className="text-2xl font-bold" data-testid="certification-score">
              {readiness.score}%
            </span>
          </div>
          <Progress value={readiness.score} className="h-2" data-testid="certification-progress" />
        </div>

        {/* Compliance Areas Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Compliance Areas</h4>

          {/* Gap Assessment */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getComplianceAreaIcon('gap')}
              <span>Gap Assessment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {Math.round(readiness.details.gapAssessment.percentComplete)}%
              </span>
              {readiness.details.gapAssessment.percentComplete >= 95 ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
            </div>
          </div>

          {/* Technical Documentation */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getComplianceAreaIcon('docs')}
              <span>Technical Documentation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {readiness.details.technicalDocumentation.completeness}%
              </span>
              {readiness.details.technicalDocumentation.completeness === 100 ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
            </div>
          </div>

          {/* Risk Management */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getComplianceAreaIcon('risks')}
              <span>Risk Management</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {readiness.details.riskManagement.highRisksUnmitigated === 0 &&
                readiness.details.riskManagement.criticalRisksUnmitigated === 0
                  ? 'All mitigated'
                  : `${readiness.details.riskManagement.highRisksUnmitigated + readiness.details.riskManagement.criticalRisksUnmitigated} unmitigated`}
              </span>
              {readiness.details.riskManagement.highRisksUnmitigated === 0 &&
              readiness.details.riskManagement.criticalRisksUnmitigated === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
            </div>
          </div>

          {/* Governance */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getComplianceAreaIcon('governance')}
              <span>Governance Structure</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {readiness.details.governance.hasRequiredRoles ? 'Complete' : 'Incomplete'}
              </span>
              {readiness.details.governance.hasRequiredRoles ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
            </div>
          </div>
        </div>

        {/* Outstanding Items */}
        {!readiness.ready && readiness.missingItems.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Outstanding Requirements ({readiness.missingItems.length})
            </h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              {readiness.missingItems.slice(0, 3).map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-amber-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
              {readiness.missingItems.length > 3 && (
                <li className="text-amber-600 font-medium">
                  + {readiness.missingItems.length - 3} more items...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Success Message */}
        {readiness.ready && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                  Ready for Certification
                </h4>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  All EU AI Act requirements have been met. You can now export your compliance certificate.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Link href={`/systems/${systemId}`}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            View System Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
        <ExportCertificateButton
          systemId={systemId}
          systemName={systemName}
          variant="default"
          size="sm"
          showStatus={false}
        />
      </CardFooter>
    </Card>
  );
}

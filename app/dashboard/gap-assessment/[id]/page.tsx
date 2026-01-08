import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExportReportButton } from '@/components/gap-assessment/export-report-button';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Circle, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';

async function getGapAssessment(assessmentId: string, organizationId: string) {
  const assessment = await prisma.gapAssessment.findFirst({
    where: {
      id: assessmentId,
      aiSystem: {
        organizationId,
      },
    },
    include: {
      aiSystem: {
        select: {
          id: true,
          name: true,
          businessPurpose: true,
          deploymentStatus: true,
        },
      },
      requirements: {
        include: {
          evidence: true,
        },
        orderBy: {
          category: 'asc',
        },
      },
    },
  });

  return assessment;
}

function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    RISK_MANAGEMENT: 'Risk Management System',
    DATA_GOVERNANCE: 'Data Governance & Quality',
    TECHNICAL_DOCUMENTATION: 'Technical Documentation',
    RECORD_KEEPING: 'Record-Keeping & Logging',
    TRANSPARENCY: 'Transparency & User Information',
    HUMAN_OVERSIGHT: 'Human Oversight & Control',
    ACCURACY_ROBUSTNESS: 'Accuracy, Robustness & Cybersecurity',
    CYBERSECURITY: 'Cybersecurity Measures',
  };
  return titles[category] || category;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'IMPLEMENTED':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'IN_PROGRESS':
      return <Circle className="h-5 w-5 text-yellow-600" />;
    case 'NOT_STARTED':
      return <Circle className="h-5 w-5 text-gray-400" />;
    case 'NOT_APPLICABLE':
      return <AlertTriangle className="h-5 w-5 text-gray-400" />;
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, { label: string; className: string }> = {
    IMPLEMENTED: { label: 'Implemented', className: 'bg-green-100 text-green-800' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800' },
    NOT_STARTED: { label: 'Not Started', className: 'bg-gray-100 text-gray-800' },
    NOT_APPLICABLE: { label: 'N/A', className: 'bg-gray-100 text-gray-600' },
  };
  const config = variants[status] || variants.NOT_STARTED;
  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  );
}

export default async function GapAssessmentDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const assessment = await getGapAssessment(params.id, session.user.organizationId);

  if (!assessment) {
    notFound();
  }

  // Group requirements by category
  const categories = assessment.requirements.reduce((acc, req) => {
    if (!acc[req.category]) {
      acc[req.category] = [];
    }
    acc[req.category].push(req);
    return acc;
  }, {} as Record<string, typeof assessment.requirements>);

  // Calculate category scores
  const categoryScores = Object.entries(categories).map(([category, reqs]) => {
    const applicable = reqs.filter((r) => r.status !== 'NOT_APPLICABLE');
    const implemented = reqs.filter((r) => r.status === 'IMPLEMENTED');
    const score = applicable.length > 0 ? (implemented.length / applicable.length) * 100 : 0;
    return {
      name: getCategoryTitle(category),
      category,
      score: Math.round(score),
      implemented: implemented.length,
      total: applicable.length,
    };
  });

  return (
    <div className="space-y-8" data-testid="gap-assessment-details-page">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Gap Assessment Report</h1>
          <p className="text-muted-foreground">
            {assessment.aiSystem.name} • Last assessed{' '}
            {assessment.lastAssessedDate.toLocaleDateString()}
          </p>
        </div>

        <ExportReportButton assessmentId={assessment.id} systemName={assessment.aiSystem.name} />
      </div>

      {/* Overall Score */}
      <Card data-testid="gap-assessment-overall-card">
        <CardHeader>
          <CardTitle>Overall Compliance Score</CardTitle>
          <CardDescription>EU AI Act compliance for high-risk AI systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={assessment.overallScore} className="h-4" data-testid="gap-assessment-progress-bar" />
            </div>
            <div className="text-2xl font-bold" data-testid="gap-assessment-overall-score">
              {Math.round(assessment.overallScore)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryScores.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {cat.implemented}/{cat.total} ({cat.score}%)
                  </span>
                </div>
                <Progress value={cat.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Requirements */}
      {Object.entries(categories).map(([category, reqs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{getCategoryTitle(category)}</CardTitle>
            <CardDescription>{reqs.length} requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reqs.map((req, idx) => (
                <div key={req.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(req.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{req.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {req.regulatoryReference}
                        </Badge>
                      </div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  {req.notes && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm text-gray-700">{req.notes}</p>
                    </div>
                  )}

                  {req.assignedTo && (
                    <p className="text-sm">
                      <span className="font-medium">Assigned to:</span> {req.assignedTo}
                    </p>
                  )}

                  {req.dueDate && (
                    <p className="text-sm">
                      <span className="font-medium">Due:</span> {new Date(req.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  {req.evidence.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Evidence ({req.evidence.length})
                      </p>
                      <div className="space-y-2">
                        {req.evidence.map((ev) => (
                          <div key={ev.id} className="text-sm pl-6">
                            <span className="font-medium">{ev.title}</span>
                            {ev.description && (
                              <span className="text-muted-foreground"> - {ev.description}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Shield, Users, FileWarning } from 'lucide-react';
import Link from 'next/link';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { RiskDistribution } from '@/components/dashboard/risk-distribution';
import { ExportExecutiveSummaryButton } from '@/components/dashboard/export-executive-summary-button';

async function getDashboardStats(organizationId: string) {
  const [
    totalSystems,
    prohibitedRisk,
    highRisk,
    limitedRisk,
    minimalRisk,
    totalGapAssessments,
    activeIncidents,
    totalGovernanceStructures,
    totalGovernanceRoles,
    totalIncidents,
    incidentsRequiringNotification,
    criticalIncidents,
  ] = await Promise.all([
    prisma.aISystem.count({ where: { organizationId } }),
    prisma.riskClassification.count({
      where: { aiSystem: { organizationId }, category: 'PROHIBITED' },
    }),
    prisma.riskClassification.count({
      where: { aiSystem: { organizationId }, category: 'HIGH_RISK' },
    }),
    prisma.riskClassification.count({
      where: { aiSystem: { organizationId }, category: 'LIMITED_RISK' },
    }),
    prisma.riskClassification.count({
      where: { aiSystem: { organizationId }, category: 'MINIMAL_RISK' },
    }),
    prisma.gapAssessment.count({
      where: { aiSystem: { organizationId } },
    }),
    prisma.incident.count({
      where: {
        aiSystem: { organizationId },
        status: { in: ['OPEN', 'INVESTIGATING'] }
      },
    }),
    prisma.aIGovernance.count({
      where: { aiSystem: { organizationId } },
    }),
    prisma.governanceRole.count({
      where: { aiGovernance: { aiSystem: { organizationId } } },
    }),
    prisma.incident.count({
      where: { aiSystem: { organizationId } },
    }),
    prisma.incident.count({
      where: {
        aiSystem: { organizationId },
        notificationRequired: true,
        notificationSubmitted: false,
      },
    }),
    prisma.incident.count({
      where: {
        aiSystem: { organizationId },
        severity: 'CRITICAL',
        status: { in: ['OPEN', 'INVESTIGATING'] }
      },
    }),
  ]);

  // Calculate compliance score based on gap assessments
  // Systems with gap assessments completed and high scores are more compliant
  const gapAssessments = await prisma.gapAssessment.findMany({
    where: { aiSystem: { organizationId } },
    select: { overallScore: true },
  });

  const complianceScore = gapAssessments.length > 0
    ? Math.round(
        gapAssessments.reduce((sum, ga) => sum + ga.overallScore, 0) / gapAssessments.length
      )
    : 0;

  return {
    totalSystems,
    systemsByRisk: {
      prohibited: prohibitedRisk,
      high: highRisk,
      limited: limitedRisk,
      minimal: minimalRisk,
    },
    complianceScore,
    activeIncidents,
    totalIncidents,
    incidentsRequiringNotification,
    criticalIncidents,
    highRiskSystems: highRisk + prohibitedRisk,
    totalGovernanceStructures,
    totalGovernanceRoles,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return <div>Loading...</div>;
  }

  const stats = await getDashboardStats(session.user.organizationId);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-start justify-between" data-testid="dashboard-welcome">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="dashboard-welcome-title">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="dashboard-welcome-subtitle">
            Here's an overview of your AI systems compliance status
          </p>
        </div>
        <ExportExecutiveSummaryButton />
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Risk Distribution */}
        <Card className="md:col-span-1" data-testid="dashboard-risk-distribution-card">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>
              AI systems classified by risk category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskDistribution data={stats.systemsByRisk} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-1" data-testid="dashboard-recent-activity-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity organizationId={session.user.organizationId} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card data-testid="dashboard-quick-actions-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild data-testid="dashboard-quick-action-add-system">
              <Link href="/dashboard/systems">
                <Server className="h-8 w-8 mb-2 text-primary" />
                <span className="font-semibold">Add AI System</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Register a new AI system
                </span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild data-testid="dashboard-quick-action-risk-assessment">
              <Link href="/dashboard/classification">
                <ShieldAlert className="h-8 w-8 mb-2 text-primary" />
                <span className="font-semibold">Risk Assessment</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Classify system risk level
                </span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild data-testid="dashboard-quick-action-gap-analysis">
              <Link href="/dashboard/gap-assessment">
                <CheckCircle2 className="h-8 w-8 mb-2 text-primary" />
                <span className="font-semibold">Gap Analysis</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Identify compliance gaps
                </span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild data-testid="dashboard-quick-action-governance">
              <Link href="/dashboard/governance">
                <Users className="h-8 w-8 mb-2 text-primary" />
                <span className="font-semibold">Governance</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Define governance roles
                </span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild data-testid="dashboard-quick-action-report-incident">
              <Link href="/dashboard/incidents/new">
                <FileWarning className="h-8 w-8 mb-2 text-primary" />
                <span className="font-semibold">Report Incident</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Log a serious incident
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alerts */}
      {stats.highRiskSystems > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-900" data-testid="dashboard-compliance-alert">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900 dark:text-orange-100">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
              You have {stats.highRiskSystems} high-risk or prohibited AI system(s) that require
              immediate attention and strict compliance measures.
            </p>
            <Button variant="default" asChild data-testid="dashboard-review-high-risk-button">
              <Link href="/dashboard/systems?filter=high-risk">
                Review High-Risk Systems
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Incident Notification Alert */}
      {stats.incidentsRequiringNotification > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900" data-testid="dashboard-incident-notification-alert">
          <CardHeader>
            <CardTitle className="flex items-center text-red-900 dark:text-red-100">
              <Shield className="h-5 w-5 mr-2" />
              Authority Notification Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800 dark:text-red-200 mb-4">
              You have {stats.incidentsRequiringNotification} serious incident(s) requiring authority notification under EU AI Act Article 62.
              Please submit notifications within 15 days of becoming aware of the incident.
            </p>
            <Button variant="destructive" asChild data-testid="dashboard-review-notifications-button">
              <Link href="/dashboard/incidents?filter=notification-required">
                Review Incidents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Critical Incidents Alert */}
      {stats.criticalIncidents > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900" data-testid="dashboard-critical-incidents-alert">
          <CardHeader>
            <CardTitle className="flex items-center text-red-900 dark:text-red-100">
              <FileWarning className="h-5 w-5 mr-2" />
              Critical Incidents Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800 dark:text-red-200 mb-4">
              You have {stats.criticalIncidents} critical incident(s) that require immediate attention and resolution.
            </p>
            <Button variant="destructive" asChild data-testid="dashboard-review-critical-incidents-button">
              <Link href="/dashboard/incidents?filter=critical">
                Review Critical Incidents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

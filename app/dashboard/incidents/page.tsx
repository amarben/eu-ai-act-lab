import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, FileWarning, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

async function getIncidentStats(organizationId: string) {
  const [
    totalIncidents,
    openIncidents,
    criticalIncidents,
    notificationsRequired,
  ] = await Promise.all([
    prisma.incident.count({
      where: { aiSystem: { organizationId } },
    }),
    prisma.incident.count({
      where: {
        aiSystem: { organizationId },
        status: { in: ['OPEN', 'INVESTIGATING'] },
      },
    }),
    prisma.incident.count({
      where: {
        aiSystem: { organizationId },
        severity: 'CRITICAL',
        status: { not: 'CLOSED' },
      },
    }),
    prisma.incident.count({
      where: {
        aiSystem: { organizationId },
        notificationRequired: true,
        notificationSubmitted: false,
      },
    }),
  ]);

  return {
    totalIncidents,
    openIncidents,
    criticalIncidents,
    notificationsRequired,
  };
}

async function getIncidents(organizationId: string) {
  return prisma.incident.findMany({
    where: {
      aiSystem: { organizationId },
    },
    include: {
      aiSystem: {
        select: {
          name: true,
          riskClassification: {
            select: {
              category: true,
            },
          },
        },
      },
      notificationAssessment: true,
      actionItems: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      incidentDate: 'desc',
    },
  });
}

export default async function IncidentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return <div>Loading...</div>;
  }

  const stats = await getIncidentStats(session.user.organizationId);
  const incidents = await getIncidents(session.user.organizationId);

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'default';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'destructive';
      case 'INVESTIGATING':
        return 'default';
      case 'RESOLVED':
        return 'secondary';
      case 'CLOSED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="h-4 w-4" />;
      case 'INVESTIGATING':
        return <Clock className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'CLOSED':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incident Management</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage serious incidents requiring attention or authority notification
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIncidents}</div>
            <p className="text-xs text-muted-foreground">All reported incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openIncidents}</div>
            <p className="text-xs text-muted-foreground">Active investigations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalIncidents}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications Required</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notificationsRequired}</div>
            <p className="text-xs text-muted-foreground">Pending authority notification</p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Alert */}
      {stats.notificationsRequired > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900 dark:text-orange-100">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Authority Notification Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
              You have {stats.notificationsRequired} incident(s) that require authority notification according to
              EU AI Act Article 62. Please review and submit notifications within the required timeframe.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Incidents</CardTitle>
              <CardDescription>
                Reported incidents across your AI systems
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/incidents/new">
                <Plus className="mr-2 h-4 w-4" />
                Report Incident
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileWarning className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No incidents reported</p>
              <p className="text-sm mb-4">
                When serious incidents occur, report them here for tracking and authority notification.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/incidents/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Report First Incident
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => {
                const completedActions = incident.actionItems.filter(a => a.status === 'COMPLETED').length;
                const totalActions = incident.actionItems.length;

                return (
                  <Link
                    key={incident.id}
                    href={`/dashboard/incidents/${incident.id}`}
                    className="block border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        {/* Header Row */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-mono text-muted-foreground">
                            {incident.incidentNumber}
                          </span>
                          <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(incident.status)}
                            <Badge variant={getStatusBadgeVariant(incident.status)}>
                              {incident.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {incident.notificationRequired && !incident.notificationSubmitted && (
                            <Badge variant="outline" className="border-orange-600 text-orange-600">
                              Notification Required
                            </Badge>
                          )}
                          {incident.notificationSubmitted && (
                            <Badge variant="outline" className="border-green-600 text-green-600">
                              Notification Submitted
                            </Badge>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-lg">{incident.title}</h3>

                        {/* Metadata Row */}
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <span>
                            <strong>AI System:</strong> {incident.aiSystem.name}
                          </span>
                          <span>
                            <strong>Date:</strong> {new Date(incident.incidentDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span>
                            <strong>Reported By:</strong> {incident.reportedBy}
                          </span>
                          {totalActions > 0 && (
                            <span>
                              <strong>Actions:</strong> {completedActions}/{totalActions} completed
                            </span>
                          )}
                        </div>

                        {/* Description Preview */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {incident.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

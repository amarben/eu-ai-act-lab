import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Shield,
  Users,
  Zap,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { AssessNotificationDialog } from '@/components/incidents/assess-notification-dialog';
import { AddActionItemDialog } from '@/components/incidents/add-action-item-dialog';
import { EditActionItemDialog } from '@/components/incidents/edit-action-item-dialog';

async function getIncidentDetails(id: string, organizationId: string) {
  const incident = await prisma.incident.findFirst({
    where: {
      id,
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
          riskClassification: {
            select: {
              category: true,
            },
          },
        },
      },
      notificationAssessment: true,
      actionItems: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return incident;
}

export default async function IncidentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const incident = await getIncidentDetails(params.id, session.user.organizationId);

  if (!incident) {
    notFound();
  }

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive' as const;
      case 'HIGH':
        return 'default' as const;
      case 'MEDIUM':
        return 'secondary' as const;
      case 'LOW':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'destructive' as const;
      case 'INVESTIGATING':
        return 'default' as const;
      case 'RESOLVED':
        return 'secondary' as const;
      case 'CLOSED':
        return 'outline' as const;
      default:
        return 'outline' as const;
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

  const getRiskCategoryBadge = (category?: string) => {
    if (!category) return null;

    const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
      PROHIBITED: 'destructive',
      HIGH_RISK: 'destructive',
      LIMITED_RISK: 'default',
      MINIMAL_RISK: 'secondary',
    };

    return (
      <Badge variant={variants[category] || 'outline'}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const completedActions = incident.actionItems.filter(a => a.status === 'COMPLETED').length;
  const totalActions = incident.actionItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/incidents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Incidents
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
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
          <AssessNotificationDialog
            incidentId={incident.id}
            incidentTitle={incident.title}
            currentAssessment={incident.notificationAssessment}
            assessedBy={session.user.name || session.user.email}
          />
        </div>
      </div>

      {/* Incident Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-3 flex-wrap gap-2">
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
              </div>
              <CardTitle className="text-2xl">{incident.title}</CardTitle>
              <CardDescription>
                Reported on {formatDateTime(incident.reportedDate)} by {incident.reportedBy}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI System Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle>Affected AI System</CardTitle>
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <span className="font-semibold">{incident.aiSystem.name}</span>
                <Badge variant="outline">{incident.aiSystem.deploymentStatus}</Badge>
                {incident.aiSystem.riskClassification &&
                  getRiskCategoryBadge(incident.aiSystem.riskClassification.category)}
              </div>
              <CardDescription>
                {incident.aiSystem.businessPurpose || 'No description provided'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/systems/${incident.aiSystem.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                View AI System
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incident Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(incident.incidentDate)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              When it occurred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Open</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {incident.closedDate
                ? Math.floor((new Date(incident.closedDate).getTime() - new Date(incident.reportedDate).getTime()) / (1000 * 60 * 60 * 24))
                : Math.floor((new Date().getTime() - new Date(incident.reportedDate).getTime()) / (1000 * 60 * 60 * 24))
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {incident.closedDate ? 'Total duration' : 'Since reported'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Items</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {totalActions > 0 ? `${completedActions}/${totalActions}` : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalActions > 0 ? 'Completed' : 'No actions defined'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authority Notification</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {incident.notificationSubmitted
                ? 'Submitted'
                : incident.notificationRequired
                  ? 'Required'
                  : 'Not Required'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {incident.notificationDate && `On ${formatDate(incident.notificationDate)}`}
              {!incident.notificationDate && incident.notificationAssessment && 'Assessment completed'}
              {!incident.notificationAssessment && 'Not assessed yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Alert */}
      {incident.notificationRequired && !incident.notificationSubmitted && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900 dark:text-orange-100">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Authority Notification Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
              This incident has been assessed as requiring authority notification according to EU AI Act Article 62.
              Please submit the notification within the required timeframe (15 days for serious incidents).
            </p>
            {incident.notificationAssessment?.notificationTemplate && (
              <Button variant="default">
                <FileText className="mr-2 h-4 w-4" />
                View Notification Template
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Incident Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Incident Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{incident.description}</p>
            </CardContent>
          </Card>

          {/* Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{incident.impact}</p>
            </CardContent>
          </Card>

          {/* Affected Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Affected Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{incident.affectedUsers}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Immediate Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Immediate Actions Taken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{incident.immediateActions}</p>
            </CardContent>
          </Card>

          {/* Root Cause (if provided) */}
          {incident.rootCause && (
            <Card>
              <CardHeader>
                <CardTitle>Root Cause Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{incident.rootCause}</p>
              </CardContent>
            </Card>
          )}

          {/* Resolution Summary (if provided) */}
          {incident.resolutionSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Resolution Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{incident.resolutionSummary}</p>
                {incident.resolvedDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Resolved on {formatDate(incident.resolvedDate)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lessons Learned (if provided) */}
          {incident.lessonsLearned && (
            <Card>
              <CardHeader>
                <CardTitle>Lessons Learned</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{incident.lessonsLearned}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Notification Assessment Section */}
      {incident.notificationAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Notification Assessment
            </CardTitle>
            <CardDescription>
              Assessed by {incident.notificationAssessment.assessedBy} on{' '}
              {formatDate(incident.notificationAssessment.assessmentDate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                {incident.notificationAssessment.isSeriousIncident ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm">Serious Incident</span>
              </div>
              <div className="flex items-center space-x-2">
                {incident.notificationAssessment.hasHealthSafetyImpact ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm">Health/Safety Impact</span>
              </div>
              <div className="flex items-center space-x-2">
                {incident.notificationAssessment.hasFundamentalRightsViolation ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm">Rights Violation</span>
              </div>
              <div className="flex items-center space-x-2">
                {incident.notificationAssessment.affectsHighRiskSystem ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm">High-Risk System</span>
              </div>
            </div>

            {incident.notificationAssessment.authorityContact && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-sm mb-2">Authority Contact</h4>
                <p className="text-sm text-muted-foreground">
                  {incident.notificationAssessment.authorityContact}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Items Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Action Items
              {totalActions > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({completedActions}/{totalActions} completed)
                </span>
              )}
            </CardTitle>
            <AddActionItemDialog
              incidentId={incident.id}
              existingActionItems={incident.actionItems}
            />
          </div>
        </CardHeader>
        <CardContent>
          {incident.actionItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No action items yet</p>
              <p className="text-xs mt-1">Add action items to track remediation efforts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incident.actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {item.status === 'COMPLETED' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : item.status === 'IN_PROGRESS' ? (
                      <Clock className="h-5 w-5 text-blue-600" />
                    ) : item.status === 'CANCELLED' ? (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      <span>
                        <User className="inline h-3 w-3 mr-1" />
                        {item.assignedTo}
                      </span>
                      {item.dueDate && (
                        <span>
                          <Calendar className="inline h-3 w-3 mr-1" />
                          Due: {formatDate(item.dueDate)}
                        </span>
                      )}
                      {item.completionDate && (
                        <span className="text-green-600">
                          Completed: {formatDate(item.completionDate)}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-2">{item.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      item.status === 'COMPLETED' ? 'default' :
                      item.status === 'IN_PROGRESS' ? 'secondary' :
                      item.status === 'CANCELLED' ? 'outline' :
                      'outline'
                    }>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    <EditActionItemDialog
                      incidentId={incident.id}
                      actionItem={item}
                      allActionItems={incident.actionItems}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authority Response (if provided) */}
      {incident.authorityResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Authority Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{incident.authorityResponse}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

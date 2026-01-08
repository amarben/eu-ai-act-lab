import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Plus, Eye, Download, CheckCircle2, Clock, Circle } from 'lucide-react';
import Link from 'next/link';

async function getDocumentation(organizationId: string) {
  const documentationList = await prisma.technicalDocumentation.findMany({
    where: {
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
      _count: {
        select: {
          attachments: true,
          versions: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return documentationList;
}

async function getAISystemsWithoutDocumentation(organizationId: string) {
  const systemsWithDocs = await prisma.technicalDocumentation.findMany({
    where: {
      aiSystem: {
        organizationId,
      },
    },
    select: {
      aiSystemId: true,
    },
  });

  const systemIdsWithDocs = systemsWithDocs.map((d) => d.aiSystemId);

  const systemsWithoutDocs = await prisma.aISystem.findMany({
    where: {
      organizationId,
      id: {
        notIn: systemIdsWithDocs,
      },
    },
    select: {
      id: true,
      name: true,
      businessPurpose: true,
    },
  });

  return systemsWithoutDocs;
}

export default async function DocumentationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const documentation = await getDocumentation(session.user.organizationId);
  const systemsWithoutDocs = await getAISystemsWithoutDocumentation(session.user.organizationId);

  const getApprovalStatus = (doc: any) => {
    if (doc.approvedBy) {
      return { label: 'Approved', variant: 'default' as const, icon: CheckCircle2, color: 'text-green-600' };
    }
    if (doc.reviewedBy) {
      return { label: 'Under Review', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' };
    }
    return { label: 'Draft', variant: 'outline' as const, icon: Circle, color: 'text-gray-400' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technical Documentation</h1>
          <p className="text-muted-foreground mt-2">
            EU AI Act Article 11 - Technical Documentation for High-Risk AI Systems
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentation</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentation.length}</div>
            <p className="text-xs text-muted-foreground">
              {systemsWithoutDocs.length} systems need documentation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documentation.filter((d) => d.approvedBy).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {documentation.length > 0
                ? Math.round((documentation.filter((d) => d.approvedBy).length / documentation.length) * 100)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completeness</CardTitle>
            <Progress className="h-4 w-4" value={75} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documentation.length > 0
                ? Math.round(
                    documentation.reduce((sum, d) => sum + d.completenessPercentage, 0) /
                      documentation.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Across all systems</p>
          </CardContent>
        </Card>
      </div>

      {/* Systems Without Documentation */}
      {systemsWithoutDocs.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <FileText className="h-5 w-5" />
              Systems Requiring Documentation
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              The following AI systems do not have technical documentation yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {systemsWithoutDocs.map((system) => (
                <div
                  key={system.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{system.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {system.businessPurpose}
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/documentation/new?systemId=${system.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Documentation
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation List */}
      <div className="space-y-4">
        {documentation.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-muted rounded-full p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No Technical Documentation Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Create technical documentation for your AI systems to comply with EU AI Act Article 11
                  requirements
                </p>
              </div>
              {systemsWithoutDocs.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  You have {systemsWithoutDocs.length} AI system{systemsWithoutDocs.length !== 1 ? 's' : ''}{' '}
                  that need documentation. See above to get started.
                </p>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documentation.map((doc) => {
              const status = getApprovalStatus(doc);
              const StatusIcon = status.icon;

              return (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{doc.aiSystem.name}</CardTitle>
                          <Badge variant={status.variant} className="flex items-center gap-1">
                            <StatusIcon className={`h-3 w-3 ${status.color}`} />
                            {status.label}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          Version {doc.version} • Last updated{' '}
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Completeness Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completeness</span>
                        <span className="font-medium">
                          {Math.round(doc.completenessPercentage)}%
                        </span>
                      </div>
                      <Progress value={doc.completenessPercentage} className="h-2" />
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Prepared by: </span>
                        <span className="font-medium">{doc.preparedBy}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Versions: </span>
                        <span className="font-medium">{doc._count.versions}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Attachments: </span>
                        <span className="font-medium">{doc._count.attachments}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/dashboard/documentation/${doc.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View & Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/api/technical-documentation/${doc.id}/export?format=pdf`}>
                          <Download className="h-4 w-4 mr-2" />
                          Export PDF
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

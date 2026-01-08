import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle, ShieldCheck, Info, Ban } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function getRiskClassifications(organizationId: string) {
  return await prisma.riskClassification.findMany({
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
          deploymentStatus: true,
        },
      },
    },
    orderBy: {
      classificationDate: 'desc',
    },
  });
}

function getRiskBadgeColor(category: string) {
  switch (category) {
    case 'PROHIBITED':
      return 'bg-red-600 hover:bg-red-700';
    case 'HIGH_RISK':
      return 'bg-orange-600 hover:bg-orange-700';
    case 'LIMITED_RISK':
      return 'bg-yellow-600 hover:bg-yellow-700';
    case 'MINIMAL_RISK':
      return 'bg-green-600 hover:bg-green-700';
    default:
      return 'bg-gray-600 hover:bg-gray-700';
  }
}

function getRiskIcon(category: string) {
  switch (category) {
    case 'PROHIBITED':
      return <Ban className="h-4 w-4" />;
    case 'HIGH_RISK':
      return <AlertTriangle className="h-4 w-4" />;
    case 'LIMITED_RISK':
      return <Info className="h-4 w-4" />;
    case 'MINIMAL_RISK':
      return <ShieldCheck className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}

function getRiskLabel(category: string) {
  switch (category) {
    case 'PROHIBITED':
      return 'Prohibited';
    case 'HIGH_RISK':
      return 'High Risk';
    case 'LIMITED_RISK':
      return 'Limited Risk';
    case 'MINIMAL_RISK':
      return 'Minimal Risk';
    default:
      return category;
  }
}

export default async function RiskClassificationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const classifications = await getRiskClassifications(session.user.organizationId);

  // Get AI systems without classification
  const unclassifiedSystems = await prisma.aISystem.findMany({
    where: {
      organizationId: session.user.organizationId,
      riskClassification: null,
    },
    select: {
      id: true,
      name: true,
      deploymentStatus: true,
    },
  });

  // Get total count of AI systems
  const totalSystems = await prisma.aISystem.count({
    where: {
      organizationId: session.user.organizationId,
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Classification</h1>
          <p className="text-muted-foreground mt-2">
            Classify AI systems according to EU AI Act risk categories
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/classification/new">
            <Plus className="mr-2 h-4 w-4" />
            New Classification
          </Link>
        </Button>
      </div>

      {/* Unclassified Systems Alert */}
      {unclassifiedSystems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900 dark:text-orange-100">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Unclassified Systems
            </CardTitle>
            <CardDescription className="text-orange-800 dark:text-orange-200">
              You have {unclassifiedSystems.length} AI system(s) that need risk classification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unclassifiedSystems.map((system) => (
                <div
                  key={system.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-950 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{system.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {system.deploymentStatus}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/classification/new?systemId=${system.id}`}>
                      Classify Now
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Category Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Ban className="h-4 w-4 mr-2 text-red-600" />
              Prohibited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classifications.filter((c) => c.category === 'PROHIBITED').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Must not be deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classifications.filter((c) => c.category === 'HIGH_RISK').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Strict requirements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Info className="h-4 w-4 mr-2 text-yellow-600" />
              Limited Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classifications.filter((c) => c.category === 'LIMITED_RISK').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Transparency obligations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
              Minimal Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classifications.filter((c) => c.category === 'MINIMAL_RISK').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">No specific requirements</p>
          </CardContent>
        </Card>
      </div>

      {/* Classifications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Classifications</CardTitle>
          <CardDescription>
            Complete list of AI system risk classifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No risk classifications yet</p>
              {totalSystems === 0 ? (
                <>
                  <p className="text-sm mt-2">
                    You need to create an AI system first before you can classify it
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/systems/new">
                      Create AI System
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm mt-2">
                    Start by classifying your AI systems according to the EU AI Act
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/classification/new">
                      Create First Classification
                    </Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {classifications.map((classification) => (
                <div
                  key={classification.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{classification.aiSystem.name}</h3>
                      <Badge className={getRiskBadgeColor(classification.category)}>
                        <span className="mr-1">{getRiskIcon(classification.category)}</span>
                        {getRiskLabel(classification.category)}
                      </Badge>
                      {classification.overrideApplied && (
                        <Badge variant="outline">Override Applied</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {classification.reasoning}
                    </p>
                    {classification.interactsWithPersons && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Interacts with Persons
                        </Badge>
                      </div>
                    )}
                    {classification.applicableRequirements.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Applicable Requirements: {classification.applicableRequirements.join(', ')}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Classified: {new Date(classification.classificationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild data-testid={`classification-view-details-${classification.id}`}>
                      <Link href={`/dashboard/classification/${classification.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

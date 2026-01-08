import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ban, AlertTriangle, Info, ShieldCheck, ArrowLeft, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

async function getRiskClassification(id: string, organizationId: string) {
  return await prisma.riskClassification.findFirst({
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
          primaryUsers: true,
          dataCategories: true,
          organization: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

function getRiskInfo(category: string) {
  switch (category) {
    case 'PROHIBITED':
      return {
        icon: <Ban className="h-8 w-8" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950/10',
        borderColor: 'border-red-200 dark:border-red-900',
        badgeColor: 'bg-red-600 hover:bg-red-700',
        title: 'Prohibited AI Practice',
        description:
          'This AI system falls under prohibited practices and must not be deployed in the EU.',
        requirements: [
          'System must not be placed on the market or put into service',
          'Immediate discontinuation required if already deployed',
          'Report to relevant authorities',
        ],
      };
    case 'HIGH_RISK':
      return {
        icon: <AlertTriangle className="h-8 w-8" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950/10',
        borderColor: 'border-orange-200 dark:border-orange-900',
        badgeColor: 'bg-orange-600 hover:bg-orange-700',
        title: 'High-Risk AI System',
        description:
          'This system requires strict compliance with EU AI Act requirements.',
        requirements: [
          'Risk management system (Article 9)',
          'Data governance and management (Article 10)',
          'Technical documentation (Article 11)',
          'Record keeping (Article 12)',
          'Transparency and user information (Article 13)',
          'Human oversight (Article 14)',
          'Accuracy, robustness, and cybersecurity (Article 15)',
          'Conformity assessment before market placement',
        ],
      };
    case 'LIMITED_RISK':
      return {
        icon: <Info className="h-8 w-8" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/10',
        borderColor: 'border-yellow-200 dark:border-yellow-900',
        badgeColor: 'bg-yellow-600 hover:bg-yellow-700',
        title: 'Limited Risk AI System',
        description: 'This system must comply with transparency obligations.',
        requirements: [
          'Inform users they are interacting with an AI system (Article 52)',
          'Provide clear and distinguishable information',
          'Design system interface to make AI interaction obvious',
        ],
      };
    case 'MINIMAL_RISK':
      return {
        icon: <ShieldCheck className="h-8 w-8" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950/10',
        borderColor: 'border-green-200 dark:border-green-900',
        badgeColor: 'bg-green-600 hover:bg-green-700',
        title: 'Minimal Risk AI System',
        description: 'This system has no specific obligations under the EU AI Act.',
        requirements: [
          'Voluntary codes of conduct encouraged',
          'Follow general product safety requirements',
          'Consider ethical AI principles',
        ],
      };
    default:
      return {
        icon: <Info className="h-8 w-8" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        badgeColor: 'bg-gray-600',
        title: 'Unknown Risk',
        description: '',
        requirements: [],
      };
  }
}

export default async function RiskClassificationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const classification = await getRiskClassification(params.id, session.user.organizationId);

  if (!classification) {
    notFound();
  }

  const riskInfo = getRiskInfo(classification.category);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild data-testid="classification-detail-back-button">
            <Link href="/dashboard/classification">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="classification-detail-title">Risk Classification Details</h1>
            <p className="text-muted-foreground mt-2" data-testid="classification-detail-system-name">
              {classification.aiSystem.name}
            </p>
          </div>
        </div>
        <Badge className={riskInfo.badgeColor} data-testid="classification-detail-risk-badge">
          {riskInfo.icon}
          <span className="ml-2">{riskInfo.title.replace(' AI Practice', '').replace(' AI System', '')}</span>
        </Badge>
      </div>

      {/* Risk Category Alert */}
      <Alert className={`${riskInfo.bgColor} ${riskInfo.borderColor}`} data-testid="classification-detail-risk-alert">
        <div className={riskInfo.color}>{riskInfo.icon}</div>
        <AlertTitle className={riskInfo.color} data-testid="classification-detail-alert-title">{riskInfo.title}</AlertTitle>
        <AlertDescription data-testid="classification-detail-alert-description">{riskInfo.description}</AlertDescription>
      </Alert>

      {/* AI System Information */}
      <Card data-testid="classification-detail-system-info-card">
        <CardHeader>
          <CardTitle>AI System Information</CardTitle>
          <CardDescription>Details about the classified AI system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Name</p>
              <p className="text-base mt-1" data-testid="classification-detail-system-name-value">{classification.aiSystem.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deployment Status</p>
              <Badge variant="outline" className="mt-1" data-testid="classification-detail-deployment-status">
                {classification.aiSystem.deploymentStatus}
              </Badge>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Business Purpose</p>
              <p className="text-base mt-1" data-testid="classification-detail-business-purpose">{classification.aiSystem.businessPurpose}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Primary Users</p>
              <div className="flex flex-wrap gap-2 mt-1" data-testid="classification-detail-primary-users">
                {classification.aiSystem.primaryUsers.map((user) => (
                  <Badge key={user} variant="secondary">
                    {user.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Categories</p>
              <div className="flex flex-wrap gap-2 mt-1" data-testid="classification-detail-data-categories">
                {classification.aiSystem.dataCategories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification Details */}
      <Card data-testid="classification-detail-details-card">
        <CardHeader>
          <CardTitle>Classification Details</CardTitle>
          <CardDescription>Risk assessment findings and rationale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Classification Date</p>
            </div>
            <p className="text-base" data-testid="classification-detail-date">
              {new Date(classification.classificationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {classification.prohibitedPractices.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Prohibited Practices Identified
              </p>
              <div className="space-y-2">
                {classification.prohibitedPractices.map((practice) => (
                  <div key={practice} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900 rounded-lg">
                    <Ban className="h-5 w-5 text-red-600 mt-0.5" />
                    <p className="text-sm">{practice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {classification.highRiskCategories.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                High-Risk Categories
              </p>
              <div className="space-y-2" data-testid="classification-detail-high-risk-categories">
                {classification.highRiskCategories.map((category) => (
                  <div key={category} className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <p className="text-sm">{category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Interacts with Natural Persons
            </p>
            <Badge variant={classification.interactsWithPersons ? 'default' : 'secondary'} data-testid="classification-detail-interacts-badge">
              {classification.interactsWithPersons ? 'Yes' : 'No'}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Classification Reasoning
            </p>
            <div className="p-4 bg-accent rounded-lg" data-testid="classification-detail-reasoning">
              <p className="text-sm whitespace-pre-wrap">{classification.reasoning}</p>
            </div>
          </div>

          {classification.applicableRequirements.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Applicable Requirements
              </p>
              <div className="flex flex-wrap gap-2" data-testid="classification-detail-requirements">
                {classification.applicableRequirements.map((requirement) => (
                  <Badge key={requirement} variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {requirement}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {classification.overrideApplied && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Classification Override
              </p>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Override Applied</AlertTitle>
                <AlertDescription>
                  {classification.overrideJustification || 'No justification provided'}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Requirements */}
      <Card data-testid="classification-detail-compliance-card">
        <CardHeader>
          <CardTitle>Compliance Requirements</CardTitle>
          <CardDescription>
            Actions required based on this risk classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2" data-testid="classification-detail-compliance-requirements">
            {riskInfo.requirements.map((requirement, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium">{index + 1}</span>
                </div>
                <p className="text-sm">{requirement}</p>
              </div>
            ))}
          </div>

          {classification.category === 'HIGH_RISK' && (
            <div className="mt-6">
              <Button asChild data-testid="classification-detail-gap-assessment-button">
                <Link href={`/dashboard/gap-assessment?systemId=${classification.aiSystemId}`}>
                  Start Gap Assessment
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

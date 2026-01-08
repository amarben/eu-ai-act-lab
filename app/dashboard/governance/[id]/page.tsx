import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { GovernanceRolesList } from '@/components/governance/governance-roles-list';

async function getGovernanceDetails(id: string, organizationId: string) {
  const governance = await prisma.aIGovernance.findFirst({
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
      roles: {
        orderBy: [{ roleType: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

  return governance;
}

const ROLE_TYPE_LABELS: Record<string, string> = {
  SYSTEM_OWNER: 'System Owner',
  RISK_OWNER: 'Risk Owner',
  HUMAN_OVERSIGHT: 'Human Oversight',
  DATA_PROTECTION_OFFICER: 'Data Protection Officer',
  TECHNICAL_LEAD: 'Technical Lead',
  COMPLIANCE_OFFICER: 'Compliance Officer',
};

export default async function GovernanceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const governance = await getGovernanceDetails(params.id, session.user.organizationId);

  if (!governance) {
    notFound();
  }

  const activeRoles = governance.roles.filter((r) => r.isActive);
  const inactiveRoles = governance.roles.filter((r) => !r.isActive);
  const uniqueAssignees = new Set(governance.roles.map((r) => r.email)).size;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/governance">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Governance
            </Link>
          </Button>
        </div>
      </div>

      {/* AI System Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <CardTitle>{governance.aiSystem.name}</CardTitle>
                <Badge variant="outline">{governance.aiSystem.deploymentStatus}</Badge>
                {governance.aiSystem.riskClassification &&
                  getRiskCategoryBadge(governance.aiSystem.riskClassification.category)}
              </div>
              <CardDescription>
                {governance.aiSystem.businessPurpose || 'No business purpose provided'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/systems/${governance.aiSystem.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                View AI System
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Governance Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{governance.roles.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Defined for this system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeRoles.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveRoles.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Not currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People Involved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{uniqueAssignees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique individuals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roles List */}
      <GovernanceRolesList
        governanceId={governance.id}
        roles={governance.roles.map(role => ({
          id: role.id,
          roleType: role.roleType,
          assignedTo: role.personName,
          email: role.email,
          responsibilities: role.responsibilities?.[0] || null,
          appointedDate: role.assignedDate,
          isActive: role.isActive,
        }))}
        roleTypeLabels={ROLE_TYPE_LABELS}
      />
    </div>
  );
}

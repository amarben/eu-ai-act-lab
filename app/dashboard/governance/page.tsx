import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Users, AlertCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { redirect } from 'next/navigation';

async function getGovernanceStructures(organizationId: string) {
  return await prisma.aIGovernance.findMany({
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
          riskClassification: {
            select: {
              category: true,
            },
          },
        },
      },
      roles: {
        orderBy: { roleType: 'asc' },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

async function getAISystemsWithoutGovernance(organizationId: string) {
  const systems = await prisma.aISystem.findMany({
    where: {
      organizationId,
      aiGovernance: null,
    },
    include: {
      riskClassification: {
        select: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return systems;
}

const ROLE_TYPE_LABELS: Record<string, string> = {
  SYSTEM_OWNER: 'System Owner',
  RISK_OWNER: 'Risk Owner',
  HUMAN_OVERSIGHT: 'Human Oversight',
  DATA_PROTECTION_OFFICER: 'DPO',
  TECHNICAL_LEAD: 'Technical Lead',
  COMPLIANCE_OFFICER: 'Compliance Officer',
};

export default async function GovernancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const [governanceStructures, systemsWithoutGovernance] = await Promise.all([
    getGovernanceStructures(session.user.organizationId),
    getAISystemsWithoutGovernance(session.user.organizationId),
  ]);

  const getRiskCategoryBadge = (category?: string) => {
    if (!category) return null;

    const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
      PROHIBITED: 'destructive',
      HIGH_RISK: 'destructive',
      LIMITED_RISK: 'default',
      MINIMAL_RISK: 'secondary',
    };

    return (
      <Badge variant={variants[category] || 'outline'} className="text-xs">
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  const getRoleStats = (roles: any[]) => {
    const activeRoles = roles.filter((r) => r.isActive);
    const inactiveRoles = roles.filter((r) => !r.isActive);
    const uniqueAssignees = new Set(roles.map((r) => r.email)).size;

    return {
      total: roles.length,
      active: activeRoles.length,
      inactive: inactiveRoles.length,
      uniqueAssignees,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Governance</h1>
          <p className="text-muted-foreground mt-2">
            Manage governance structures and role assignments for AI systems
          </p>
        </div>
        {systemsWithoutGovernance.length > 0 && (
          <Button asChild data-testid="add-governance-button">
            <Link href="/dashboard/governance/new">
              <Plus className="mr-2 h-4 w-4" />
              Define Governance
            </Link>
          </Button>
        )}
      </div>

      {/* Systems without governance - Call to action */}
      {systemsWithoutGovernance.length > 0 && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                {systemsWithoutGovernance.length} AI System
                {systemsWithoutGovernance.length !== 1 ? 's' : ''} Need Governance Structure
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Define roles and responsibilities to ensure accountability and compliance:
              </p>
              <ul className="mt-2 space-y-1">
                {systemsWithoutGovernance.slice(0, 3).map((system) => (
                  <li key={system.id} className="text-sm text-blue-700 dark:text-blue-300">
                    • {system.name}
                    {system.riskClassification && (
                      <span className="ml-2">
                        ({system.riskClassification.category.replace('_', ' ')})
                      </span>
                    )}
                  </li>
                ))}
                {systemsWithoutGovernance.length > 3 && (
                  <li className="text-sm text-blue-700 dark:text-blue-300">
                    • and {systemsWithoutGovernance.length - 3} more...
                  </li>
                )}
              </ul>
              <Button asChild size="sm" className="mt-3">
                <Link href="/dashboard/governance/new">
                  Define Governance Structure
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Governance Structures List */}
      {governanceStructures.length === 0 ? (
        <Card className="p-12 text-center" data-testid="empty-governance-card">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-muted rounded-full p-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Governance Structures Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Start managing AI governance by defining roles and responsibilities for your AI systems
              </p>
            </div>
            <Button asChild data-testid="add-first-governance-button">
              <Link href="/dashboard/governance/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Governance Structure
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6" data-testid="governance-structures-grid">
          {governanceStructures.map((governance) => {
            const stats = getRoleStats(governance.roles);
            const isHighRisk =
              governance.aiSystem.riskClassification?.category === 'HIGH_RISK' ||
              governance.aiSystem.riskClassification?.category === 'PROHIBITED';

            return (
              <Card key={governance.id} className="p-6" data-testid={`governance-card-${governance.aiSystem.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                      <h3 className="text-lg font-semibold">{governance.aiSystem.name}</h3>
                      <Badge variant="outline">{governance.aiSystem.deploymentStatus}</Badge>
                      {governance.aiSystem.riskClassification &&
                        getRiskCategoryBadge(governance.aiSystem.riskClassification.category)}
                    </div>

                    {governance.aiSystem.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {governance.aiSystem.description}
                      </p>
                    )}

                    {/* Role Statistics */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">Total Roles</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        <div className="text-xs text-muted-foreground">Active</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                        <div className="text-xs text-muted-foreground">Inactive</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{stats.uniqueAssignees}</div>
                        <div className="text-xs text-muted-foreground">People</div>
                      </div>
                    </div>

                    {/* Assigned Roles Preview */}
                    {governance.roles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Key Roles Assigned:</h4>
                        <div className="flex flex-wrap gap-2">
                          {governance.roles.slice(0, 4).map((role) => (
                            <Badge
                              key={role.id}
                              variant={role.isActive ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {ROLE_TYPE_LABELS[role.roleType] || role.roleType}: {role.assignedTo}
                            </Badge>
                          ))}
                          {governance.roles.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{governance.roles.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Alert for High-Risk Systems */}
                    {isHighRisk && stats.active < 3 && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-900">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            High-risk system: Consider assigning more governance roles
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/governance/${governance.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

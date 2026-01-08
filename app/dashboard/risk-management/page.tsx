import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { redirect } from 'next/navigation';

async function getRiskRegisters(organizationId: string) {
  return await prisma.aIRiskRegister.findMany({
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
      risks: {
        select: {
          id: true,
          riskLevel: true,
          treatmentDecision: true,
          mitigationActions: {
            select: {
              status: true,
            },
          },
        },
      },
    },
    orderBy: {
      lastAssessedDate: 'desc',
    },
  });
}

async function getAISystemsWithoutRiskRegister(organizationId: string) {
  // Get all AI systems that don't have a risk register yet
  const systems = await prisma.aISystem.findMany({
    where: {
      organizationId,
      aiRiskRegister: null,
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

export default async function RiskManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const [riskRegisters, systemsWithoutRegister] = await Promise.all([
    getRiskRegisters(session.user.organizationId),
    getAISystemsWithoutRiskRegister(session.user.organizationId),
  ]);

  const getRiskLevelBadge = (level: string) => {
    const variants = {
      HIGH: 'destructive',
      MEDIUM: 'default',
      LOW: 'secondary',
    } as const;

    return (
      <Badge variant={variants[level as keyof typeof variants] || 'secondary'}>
        {level}
      </Badge>
    );
  };

  const calculateRiskStats = (risks: any[]) => {
    const total = risks.length;
    const high = risks.filter((r) => r.riskLevel === 'HIGH').length;
    const medium = risks.filter((r) => r.riskLevel === 'MEDIUM').length;
    const low = risks.filter((r) => r.riskLevel === 'LOW').length;
    const mitigated = risks.filter((r) => r.treatmentDecision === 'MITIGATE').length;
    const accepted = risks.filter((r) => r.treatmentDecision === 'ACCEPT').length;

    return { total, high, medium, low, mitigated, accepted };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage AI system risks and track mitigation actions
          </p>
        </div>
        {systemsWithoutRegister.length > 0 && (
          <Button asChild data-testid="add-risk-register-button">
            <Link href="/dashboard/risk-management/new">
              <Plus className="mr-2 h-4 w-4" />
              New Risk Register
            </Link>
          </Button>
        )}
      </div>

      {/* Systems without risk register - Call to action */}
      {systemsWithoutRegister.length > 0 && (
        <Card className="p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                {systemsWithoutRegister.length} AI System
                {systemsWithoutRegister.length !== 1 ? 's' : ''} Need Risk Assessment
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                The following systems don't have risk registers yet:
              </p>
              <ul className="mt-2 space-y-1">
                {systemsWithoutRegister.slice(0, 3).map((system) => (
                  <li key={system.id} className="text-sm text-amber-700 dark:text-amber-300">
                    • {system.name}
                  </li>
                ))}
                {systemsWithoutRegister.length > 3 && (
                  <li className="text-sm text-amber-700 dark:text-amber-300">
                    • and {systemsWithoutRegister.length - 3} more...
                  </li>
                )}
              </ul>
              <Button asChild size="sm" className="mt-3">
                <Link href="/dashboard/risk-management/new">
                  Create Risk Register
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Risk Registers List */}
      {riskRegisters.length === 0 ? (
        <Card className="p-12 text-center" data-testid="empty-risk-registers-card">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-muted rounded-full p-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Risk Registers Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Start managing AI system risks by creating your first risk register
              </p>
            </div>
            <Button asChild data-testid="add-first-risk-register-button">
              <Link href="/dashboard/risk-management/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Risk Register
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6" data-testid="risk-registers-grid">
          {riskRegisters.map((register) => {
            const stats = calculateRiskStats(register.risks);

            return (
              <Card key={register.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{register.aiSystem.name}</h3>
                      <Badge variant="outline">{register.aiSystem.deploymentStatus}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last assessed:{' '}
                      {new Date(register.lastAssessedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>

                    {/* Risk Statistics */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">Total Risks</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{stats.high}</div>
                        <div className="text-xs text-muted-foreground">High</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
                        <div className="text-xs text-muted-foreground">Medium</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{stats.low}</div>
                        <div className="text-xs text-muted-foreground">Low</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{stats.mitigated}</div>
                        <div className="text-xs text-muted-foreground">Mitigated</div>
                      </div>
                    </div>

                    {/* Quick View of High Risks */}
                    {stats.high > 0 && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-900">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm font-medium text-red-900 dark:text-red-100">
                            {stats.high} high-risk issue{stats.high !== 1 ? 's' : ''} require
                            attention
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/risk-management/${register.id}`}>
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

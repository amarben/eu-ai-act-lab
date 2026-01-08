import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { AISystemsList } from '@/components/systems/ai-systems-list';

async function getAISystems(organizationId: string) {
  return await prisma.aISystem.findMany({
    where: { organizationId },
    include: {
      riskClassification: {
        select: { category: true },
      },
      gapAssessment: {
        select: { overallScore: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AISystemsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return <div>Loading...</div>;
  }

  const systems = await getAISystems(session.user.organizationId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Systems</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all AI systems in your organization
          </p>
        </div>
        <Button asChild data-testid="add-system-button">
          <Link href="/dashboard/systems/new">
            <Plus className="mr-2 h-4 w-4" />
            Add AI System
          </Link>
        </Button>
      </div>

      {/* Systems List */}
      {systems.length === 0 ? (
        <Card className="p-12 text-center" data-testid="empty-systems-card">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-muted rounded-full p-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No AI Systems Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Get started by adding your first AI system to begin your compliance journey
              </p>
            </div>
            <Button asChild data-testid="add-first-system-button">
              <Link href="/dashboard/systems/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First AI System
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <AISystemsList systems={systems} />
      )}
    </div>
  );
}

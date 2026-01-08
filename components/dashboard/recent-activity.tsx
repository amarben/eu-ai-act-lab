import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { FileText, ShieldCheck, AlertCircle, Server } from 'lucide-react';

interface RecentActivityProps {
  organizationId: string;
}

export async function RecentActivity({ organizationId }: RecentActivityProps) {
  // Get recent AI systems
  const recentSystems = await prisma.aISystem.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  if (recentSystems.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentSystems.map((system) => (
        <div key={system.id} className="flex items-start space-x-4">
          <div className="bg-primary/10 rounded-full p-2">
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{system.name}</p>
            <p className="text-sm text-muted-foreground">
              Status: {system.deploymentStatus}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(system.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

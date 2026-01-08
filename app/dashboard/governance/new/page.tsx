import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { GovernanceWizard } from '@/components/governance/governance-wizard';

async function getAvailableAISystems(organizationId: string) {
  // Get AI systems that don't have governance yet
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
      name: 'asc',
    },
  });

  return systems;
}

export default async function NewGovernancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const availableSystems = await getAvailableAISystems(session.user.organizationId);

  // If no systems available, redirect to systems page
  if (availableSystems.length === 0) {
    redirect('/dashboard/systems?message=no-systems-for-governance');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Define Governance Structure</h1>
        <p className="text-muted-foreground mt-2">
          Assign roles and responsibilities to ensure accountability for your AI system
        </p>
      </div>

      {/* Wizard Component */}
      <GovernanceWizard availableSystems={availableSystems} />
    </div>
  );
}

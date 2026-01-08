import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { RiskRegisterWizard } from '@/components/risk-management/risk-register-wizard';

async function getAISystemsWithoutRiskRegister(organizationId: string) {
  // Get all AI systems that don't have a risk register yet
  const systems = await prisma.aISystem.findMany({
    where: {
      organizationId,
      riskRegister: null,
    },
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return systems;
}

export default async function NewRiskRegisterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const systems = await getAISystemsWithoutRiskRegister(session.user.organizationId);

  if (systems.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Risk Register</h1>
          <p className="text-muted-foreground mt-2">
            Set up a comprehensive risk register for your AI system
          </p>
        </div>

        <div className="p-8 border-2 border-dashed rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">No Available Systems</h3>
          <p className="text-muted-foreground mb-4">
            All your AI systems already have risk registers, or you don't have any AI systems yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Create a new AI system or manage existing risk registers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Risk Register</h1>
        <p className="text-muted-foreground mt-2">
          Set up a comprehensive risk register for your AI system
        </p>
      </div>

      <RiskRegisterWizard systems={systems} />
    </div>
  );
}

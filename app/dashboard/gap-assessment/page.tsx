import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { GapAssessmentWizard } from '@/components/gap-assessment/gap-assessment-wizard';

async function getHighRiskSystems(organizationId: string) {
  // Get all AI systems with HIGH_RISK classification
  const systems = await prisma.aISystem.findMany({
    where: {
      organizationId,
      riskClassification: {
        category: 'HIGH_RISK',
      },
    },
    select: {
      id: true,
      name: true,
      businessPurpose: true,
      deploymentStatus: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return systems;
}

export default async function GapAssessmentPage({
  searchParams,
}: {
  searchParams: { systemId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const systems = await getHighRiskSystems(session.user.organizationId);

  if (systems.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gap Assessment</h1>
          <p className="text-muted-foreground mt-2">
            Assess compliance with EU AI Act requirements for high-risk AI systems
          </p>
        </div>

        <div className="p-8 border-2 border-dashed rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">No High-Risk Systems Found</h3>
          <p className="text-muted-foreground mb-4">
            Gap assessments are only available for AI systems classified as high-risk.
          </p>
          <p className="text-sm text-muted-foreground">
            Please classify your AI systems first, or create a new AI system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gap Assessment</h1>
        <p className="text-muted-foreground mt-2">
          Assess compliance with EU AI Act requirements for high-risk AI systems
        </p>
      </div>

      <GapAssessmentWizard
        systems={systems}
        preselectedSystemId={searchParams.systemId}
      />
    </div>
  );
}

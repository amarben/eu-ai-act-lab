import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { RiskClassificationWizard } from '@/components/classification/risk-classification-wizard';

export default async function NewRiskClassificationPage({
  searchParams,
}: {
  searchParams: { systemId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  // Get AI systems that don't have classifications yet
  const availableSystems = await prisma.aISystem.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(searchParams.systemId ? { id: searchParams.systemId } : { riskClassification: null }),
    },
    select: {
      id: true,
      name: true,
      businessPurpose: true,
      deploymentStatus: true,
      primaryUsers: true,
      dataCategories: true,
    },
  });

  if (availableSystems.length === 0 && !searchParams.systemId) {
    redirect('/dashboard/classification');
  }

  // If systemId is provided, get that specific system (even if classified)
  const selectedSystem = searchParams.systemId
    ? await prisma.aISystem.findUnique({
        where: { id: searchParams.systemId },
        select: {
          id: true,
          name: true,
          businessPurpose: true,
          deploymentStatus: true,
          primaryUsers: true,
          dataCategories: true,
        },
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Risk Classification Assessment</h1>
        <p className="text-muted-foreground mt-2">
          Answer the following questions to classify your AI system according to the EU AI Act
        </p>
      </div>

      <RiskClassificationWizard
        systems={availableSystems}
        preselectedSystemId={searchParams.systemId}
        selectedSystem={selectedSystem}
      />
    </div>
  );
}

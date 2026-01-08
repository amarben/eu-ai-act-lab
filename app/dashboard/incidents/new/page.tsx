import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IncidentWizard } from '@/components/incidents/incident-wizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function getAvailableSystems(organizationId: string) {
  return prisma.aISystem.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
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
}

export default async function NewIncidentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return <div>Loading...</div>;
  }

  const aiSystems = await getAvailableSystems(session.user.organizationId);

  if (aiSystems.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Incident</h1>
          <p className="text-muted-foreground mt-2">
            Report a serious incident for tracking and potential authority notification
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No AI Systems Available</CardTitle>
            <CardDescription>
              You need to register at least one AI system before reporting incidents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please register your AI systems first, then return here to report incidents.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Incident</h1>
        <p className="text-muted-foreground mt-2">
          Report a serious incident for tracking and potential authority notification
        </p>
      </div>

      <IncidentWizard
        aiSystems={aiSystems}
        reportedBy={session.user.name || session.user.email}
      />
    </div>
  );
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CreateDocumentationForm } from '@/components/technical-documentation/create-documentation-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getAvailableSystems(organizationId: string, preselectedSystemId?: string) {
  // Get all systems without documentation
  const systemsWithDocs = await prisma.technicalDocumentation.findMany({
    where: {
      aiSystem: {
        organizationId,
      },
    },
    select: {
      aiSystemId: true,
    },
  });

  const systemIdsWithDocs = systemsWithDocs.map((d) => d.aiSystemId);

  let whereClause: any = {
    organizationId,
  };

  // If a specific system is preselected, allow it even if it has docs
  if (preselectedSystemId) {
    whereClause = {
      OR: [
        { id: preselectedSystemId },
        {
          organizationId,
          id: {
            notIn: systemIdsWithDocs,
          },
        },
      ],
    };
  } else {
    whereClause.id = {
      notIn: systemIdsWithDocs,
    };
  }

  const availableSystems = await prisma.aISystem.findMany({
    where: whereClause,
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

  return availableSystems;
}

export default async function NewDocumentationPage({
  searchParams,
}: {
  searchParams: { systemId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const availableSystems = await getAvailableSystems(
    session.user.organizationId,
    searchParams.systemId
  );

  if (availableSystems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/documentation">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documentation
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold mb-4">No AI Systems Available</h1>
          <p className="text-muted-foreground mb-6">
            All your AI systems already have technical documentation, or you haven't created any AI
            systems yet.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/dashboard/systems/new">Create AI System</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/documentation">View Documentation</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/documentation">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documentation
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Technical Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Create EU AI Act Article 11 technical documentation for an AI system
        </p>
      </div>

      {/* Form */}
      <CreateDocumentationForm
        availableSystems={availableSystems}
        preselectedSystemId={searchParams.systemId}
        userId={session.user.id}
      />
    </div>
  );
}

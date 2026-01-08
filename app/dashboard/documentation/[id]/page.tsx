import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { DocumentationDetail } from '@/components/technical-documentation/documentation-detail';
import { ExportReportButton } from '@/components/technical-documentation/export-report-button';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getDocumentation(documentationId: string, organizationId: string) {
  const documentation = await prisma.technicalDocumentation.findFirst({
    where: {
      id: documentationId,
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
      attachments: {
        orderBy: {
          uploadedAt: 'desc',
        },
      },
      versions: {
        orderBy: {
          versionDate: 'desc',
        },
        take: 10,
      },
    },
  });

  return documentation;
}

export default async function DocumentationDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const documentation = await getDocumentation(params.id, session.user.organizationId);

  if (!documentation) {
    notFound();
  }

  return (
    <div className="space-y-8" data-testid="documentation-details-page">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/documentation">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Documentation
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Technical Documentation</h1>
          <p className="text-muted-foreground">
            {documentation.aiSystem.name} • Version {documentation.version} • Last updated{' '}
            {new Date(documentation.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <ExportReportButton
          documentationId={documentation.id}
          systemName={documentation.aiSystem.name}
          version={documentation.version}
        />
      </div>

      {/* Documentation Detail Component */}
      <DocumentationDetail documentation={documentation} userId={session.user.id} />
    </div>
  );
}

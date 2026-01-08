import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { RiskRegisterDetail } from '@/components/risk-management/risk-register-detail';
import { ExportReportButton } from '@/components/risk-management/export-report-button';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getRiskRegister(registerId: string, organizationId: string) {
  const riskRegister = await prisma.aIRiskRegister.findFirst({
    where: {
      id: registerId,
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
      risks: {
        include: {
          mitigationActions: {
            orderBy: {
              dueDate: 'asc',
            },
          },
          humanOversight: true,
        },
        orderBy: {
          inherentRiskScore: 'desc',
        },
      },
    },
  });

  return riskRegister;
}

export default async function RiskRegisterDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const riskRegister = await getRiskRegister(params.id, session.user.organizationId);

  if (!riskRegister) {
    notFound();
  }

  return (
    <div className="space-y-8" data-testid="risk-register-details-page">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/risk-management">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Risk Management
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Register</h1>
          <p className="text-muted-foreground">
            {riskRegister.aiSystem.name} • Last assessed{' '}
            {new Date(riskRegister.lastAssessedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <ExportReportButton riskRegisterId={riskRegister.id} systemName={riskRegister.aiSystem.name} />
      </div>

      {/* Risk Register Detail Component */}
      <RiskRegisterDetail riskRegister={riskRegister} />
    </div>
  );
}

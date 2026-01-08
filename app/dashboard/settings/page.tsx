import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationProfile } from '@/components/settings/organization-profile';
import { TeamManagement } from '@/components/settings/team-management';
import { UserSettings } from '@/components/settings/user-settings';
import { Building2, Users, UserCircle } from 'lucide-react';

async function getOrganization(organizationId: string) {
  return await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      _count: {
        select: {
          users: true,
          aiSystems: true,
        },
      },
    },
  });
}

async function getUsers(organizationId: string) {
  return await prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    redirect('/auth/signin');
  }

  const organization = await getOrganization(session.user.organizationId);
  const users = await getUsers(session.user.organizationId);

  if (!organization) {
    return <div>Organization not found</div>;
  }

  const isAdmin = session.user.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization profile, team members, and personal preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organization Profile
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Management
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            My Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <OrganizationProfile organization={organization} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="team">
          <TeamManagement users={users} isAdmin={isAdmin} currentUserId={session.user.id} />
        </TabsContent>

        <TabsContent value="account">
          <UserSettings user={session.user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

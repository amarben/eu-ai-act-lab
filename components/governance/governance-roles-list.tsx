'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Calendar, FileText, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { RoleCard } from './role-card';
import { EditRoleDialog } from './edit-role-dialog';
import { AddRoleDialog } from './add-role-dialog';

interface Role {
  id: string;
  roleType: string;
  assignedTo: string;
  email: string;
  responsibilities: string | null;
  appointedDate: Date;
  isActive: boolean;
}

interface GovernanceRolesListProps {
  governanceId: string;
  roles: Role[];
  roleTypeLabels: Record<string, string>;
}

export function GovernanceRolesList({
  governanceId,
  roles,
  roleTypeLabels,
}: GovernanceRolesListProps) {
  const router = useRouter();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  const activeRoles = roles.filter((r) => r.isActive);
  const inactiveRoles = roles.filter((r) => !r.isActive);

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to remove this role?')) {
      return;
    }

    setDeletingRoleId(roleId);

    try {
      // Get all other roles
      const remainingRoles = roles.filter((r) => r.id !== roleId);

      // Call the update governance API with the remaining roles
      const response = await fetch('/api/governance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          governanceId,
          roles: remainingRoles.map(r => ({
            id: r.id,
            roleType: r.roleType,
            assignedTo: r.assignedTo,
            email: r.email,
            responsibilities: r.responsibilities,
            appointedDate: new Date(r.appointedDate).toISOString().split('T')[0],
            isActive: r.isActive,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to remove role');
      }

      toast.success('Role removed successfully');
      router.refresh();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove role');
    } finally {
      setDeletingRoleId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Governance Roles</CardTitle>
              <CardDescription>
                People responsible for governing this AI system
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm" data-testid="add-role-to-governance-button">
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Roles */}
          {activeRoles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Active Roles ({activeRoles.length})</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {activeRoles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    roleTypeLabel={roleTypeLabels[role.roleType] || role.roleType}
                    onEdit={() => setEditingRole(role)}
                    onDelete={() => handleDeleteRole(role.id)}
                    isDeleting={deletingRoleId === role.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Roles */}
          {inactiveRoles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Inactive Roles ({inactiveRoles.length})</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {inactiveRoles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    roleTypeLabel={roleTypeLabels[role.roleType] || role.roleType}
                    onEdit={() => setEditingRole(role)}
                    onDelete={() => handleDeleteRole(role.id)}
                    isDeleting={deletingRoleId === role.id}
                  />
                ))}
              </div>
            </div>
          )}

          {roles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No roles defined yet. Add your first role to start managing governance.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      {editingRole && (
        <EditRoleDialog
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
          role={editingRole}
          governanceId={governanceId}
          allRoles={roles}
        />
      )}

      {/* Add Role Dialog */}
      <AddRoleDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        governanceId={governanceId}
        existingRoles={roles}
      />
    </>
  );
}

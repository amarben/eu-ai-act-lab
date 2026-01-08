'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, FileText, Edit2, Trash2, Loader2 } from 'lucide-react';

interface Role {
  id: string;
  roleType: string;
  assignedTo: string;
  email: string;
  responsibilities: string | null;
  appointedDate: Date;
  isActive: boolean;
}

interface RoleCardProps {
  role: Role;
  roleTypeLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function RoleCard({ role, roleTypeLabel, onEdit, onDelete, isDeleting }: RoleCardProps) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-semibold">{roleTypeLabel}</h4>
            <p className="text-sm font-medium">{role.assignedTo}</p>
          </div>
          <Badge variant={role.isActive ? 'default' : 'secondary'}>
            {role.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>{role.email}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>
              Appointed: {new Date(role.appointedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          {role.responsibilities && (
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 mt-0.5" />
              <span className="line-clamp-2">{role.responsibilities}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={isDeleting}
            data-testid={`edit-role-button-${role.id}`}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
            data-testid={`delete-role-button-${role.id}`}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}

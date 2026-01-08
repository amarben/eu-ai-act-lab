'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const roleSchema = z.object({
  roleType: z.enum(['SYSTEM_OWNER', 'RISK_OWNER', 'HUMAN_OVERSIGHT', 'DATA_PROTECTION_OFFICER', 'TECHNICAL_LEAD', 'COMPLIANCE_OFFICER']),
  assignedTo: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  responsibilities: z.string().optional(),
  appointedDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof roleSchema>;

interface Role {
  id: string;
  roleType: string;
  assignedTo: string;
  email: string;
  responsibilities: string | null;
  appointedDate: Date;
  isActive: boolean;
}

interface EditRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  governanceId: string;
  allRoles: Role[];
}

const ROLE_TYPES = [
  { value: 'SYSTEM_OWNER', label: 'System Owner' },
  { value: 'RISK_OWNER', label: 'Risk Owner' },
  { value: 'HUMAN_OVERSIGHT', label: 'Human Oversight' },
  { value: 'DATA_PROTECTION_OFFICER', label: 'Data Protection Officer' },
  { value: 'TECHNICAL_LEAD', label: 'Technical Lead' },
  { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' },
] as const;

export function EditRoleDialog({ isOpen, onClose, role, governanceId, allRoles }: EditRoleDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      roleType: role.roleType as any,
      assignedTo: role.assignedTo,
      email: role.email,
      responsibilities: role.responsibilities || '',
      appointedDate: new Date(role.appointedDate).toISOString().split('T')[0],
      isActive: role.isActive,
    },
  });

  useEffect(() => {
    form.reset({
      roleType: role.roleType as any,
      assignedTo: role.assignedTo,
      email: role.email,
      responsibilities: role.responsibilities || '',
      appointedDate: new Date(role.appointedDate).toISOString().split('T')[0],
      isActive: role.isActive,
    });
  }, [role, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Update the role in the allRoles list
      const updatedRoles = allRoles.map(r => {
        if (r.id === role.id) {
          return {
            id: r.id,
            roleType: data.roleType,
            assignedTo: data.assignedTo,
            email: data.email,
            responsibilities: data.responsibilities,
            appointedDate: data.appointedDate,
            isActive: data.isActive ?? true,
          };
        }
        return {
          id: r.id,
          roleType: r.roleType,
          assignedTo: r.assignedTo,
          email: r.email,
          responsibilities: r.responsibilities,
          appointedDate: new Date(r.appointedDate).toISOString().split('T')[0],
          isActive: r.isActive,
        };
      });

      const response = await fetch('/api/governance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          governanceId,
          roles: updatedRoles,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update role');
      }

      toast.success('Role updated successfully');
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update the role information
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="edit-role-type-select">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Full name" data-testid="edit-role-assigned-to" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@example.com" data-testid="edit-role-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="appointedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointed Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsibilities</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe specific responsibilities..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active Role</FormLabel>
                    <FormDescription>This person is currently active in this role</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} data-testid="edit-role-cancel-button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="edit-role-submit-button">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Role
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
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

interface AddRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  governanceId: string;
  existingRoles: Role[];
}

const ROLE_TYPES = [
  { value: 'SYSTEM_OWNER', label: 'System Owner' },
  { value: 'RISK_OWNER', label: 'Risk Owner' },
  { value: 'HUMAN_OVERSIGHT', label: 'Human Oversight' },
  { value: 'DATA_PROTECTION_OFFICER', label: 'Data Protection Officer' },
  { value: 'TECHNICAL_LEAD', label: 'Technical Lead' },
  { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' },
] as const;

export function AddRoleDialog({ isOpen, onClose, governanceId, existingRoles }: AddRoleDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      roleType: 'COMPLIANCE_OFFICER',
      assignedTo: '',
      email: '',
      responsibilities: '',
      appointedDate: new Date().toISOString().split('T')[0],
      isActive: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Create the new role object
      const newRole = {
        roleType: data.roleType,
        assignedTo: data.assignedTo,
        email: data.email,
        responsibilities: data.responsibilities,
        appointedDate: data.appointedDate,
        isActive: data.isActive ?? true,
      };

      // Combine existing roles with the new role
      const allRoles = [
        ...existingRoles.map(r => ({
          id: r.id,
          roleType: r.roleType,
          assignedTo: r.assignedTo,
          email: r.email,
          responsibilities: r.responsibilities || '',
          appointedDate: new Date(r.appointedDate).toISOString().split('T')[0],
          isActive: r.isActive,
        })),
        newRole,
      ];

      const response = await fetch('/api/governance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          governanceId,
          roles: allRoles,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to add role');
      }

      toast.success('Role added successfully');
      form.reset();
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
          <DialogDescription>
            Assign a new role to the governance structure
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
                      <SelectTrigger data-testid="add-role-type-select">
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
                      <Input {...field} placeholder="Full name" data-testid="add-role-assigned-to" />
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
                      <Input {...field} type="email" placeholder="email@example.com" data-testid="add-role-email" />
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
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} data-testid="add-role-cancel-button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="add-role-submit-button">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Role
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

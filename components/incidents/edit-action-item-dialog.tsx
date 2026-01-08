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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { toast } from 'sonner';
import { Edit2, Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const actionItemSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assignedTo: z.string().min(1, 'Assigned to is required'),
  dueDate: z.string().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  completionDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof actionItemSchema>;

interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date | null;
  status: string;
  completionDate: Date | null;
  notes: string | null;
}

interface EditActionItemDialogProps {
  incidentId: string;
  actionItem: ActionItem;
  allActionItems: ActionItem[];
}

export function EditActionItemDialog({
  incidentId,
  actionItem,
  allActionItems,
}: EditActionItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(actionItemSchema),
    defaultValues: {
      description: actionItem.description,
      assignedTo: actionItem.assignedTo,
      dueDate: actionItem.dueDate ? actionItem.dueDate.toISOString().split('T')[0] : '',
      status: actionItem.status as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
      completionDate: actionItem.completionDate ? actionItem.completionDate.toISOString().split('T')[0] : '',
      notes: actionItem.notes || '',
    },
  });

  // Watch status to auto-set completion date
  const watchedStatus = form.watch('status');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Prepare updated action items array
      const updatedActionItems = allActionItems.map(item => {
        if (item.id === actionItem.id) {
          // This is the item being edited
          return {
            id: item.id,
            description: data.description,
            assignedTo: data.assignedTo,
            dueDate: data.dueDate || undefined,
            status: data.status,
            completionDate: data.status === 'COMPLETED'
              ? (data.completionDate || new Date().toISOString().split('T')[0])
              : undefined,
            notes: data.notes || undefined,
          };
        } else {
          // Keep other items as-is
          return {
            id: item.id,
            description: item.description,
            assignedTo: item.assignedTo,
            dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : undefined,
            status: item.status,
            completionDate: item.completionDate ? item.completionDate.toISOString().split('T')[0] : undefined,
            notes: item.notes || undefined,
          };
        }
      });

      const response = await fetch('/api/incidents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          actionItems: updatedActionItems,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update action item');
      }

      toast.success('Action item updated successfully');

      // Delay closing dialog to allow toast to render
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 100);
    } catch (error) {
      console.error('Error updating action item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update action item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Prepare action items array without the deleted item
      const updatedActionItems = allActionItems
        .filter(item => item.id !== actionItem.id)
        .map(item => ({
          id: item.id,
          description: item.description,
          assignedTo: item.assignedTo,
          dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : undefined,
          status: item.status,
          completionDate: item.completionDate ? item.completionDate.toISOString().split('T')[0] : undefined,
          notes: item.notes || undefined,
        }));

      const response = await fetch('/api/incidents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          actionItems: updatedActionItems,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete action item');
      }

      toast.success('Action item deleted successfully');
      setDeleteDialogOpen(false);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting action item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete action item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" aria-label="Edit action item">
            <Edit2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Action Item</DialogTitle>
            <DialogDescription>
              Update the action item details or mark it as completed
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the action to be taken..."
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Clear description of the action required
                    </FormDescription>
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
                        <Input {...field} placeholder="e.g., John Doe" />
                      </FormControl>
                      <FormDescription>
                        Person responsible
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Target completion date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PLANNED">
                          <div className="flex items-center">
                            <span>Planned</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              - Not yet started
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="IN_PROGRESS">
                          <div className="flex items-center">
                            <span>In Progress</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              - Currently being worked on
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          <div className="flex items-center">
                            <span>Completed</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              - Action finished
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          <div className="flex items-center">
                            <span>Cancelled</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              - No longer needed
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedStatus === 'COMPLETED' && (
                <FormField
                  control={form.control}
                  name="completionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Date when the action was completed (defaults to today)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes or context..."
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional information about this action
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Action Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this action item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

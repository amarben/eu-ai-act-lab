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
import { Plus, Loader2 } from 'lucide-react';

const actionItemSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assignedTo: z.string().min(1, 'Assigned to is required'),
  dueDate: z.string().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof actionItemSchema>;

interface AddActionItemDialogProps {
  incidentId: string;
  existingActionItems: Array<{
    id: string;
    description: string;
    assignedTo: string;
    dueDate: Date | null;
    status: string;
    completionDate: Date | null;
    notes: string | null;
  }>;
}

export function AddActionItemDialog({
  incidentId,
  existingActionItems,
}: AddActionItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(actionItemSchema),
    defaultValues: {
      description: '',
      assignedTo: '',
      dueDate: '',
      status: 'PLANNED',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Prepare all action items (existing + new one)
      const allActionItems = [
        ...existingActionItems.map(item => ({
          id: item.id,
          description: item.description,
          assignedTo: item.assignedTo,
          dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : undefined,
          status: item.status,
          completionDate: item.completionDate ? item.completionDate.toISOString().split('T')[0] : undefined,
          notes: item.notes || undefined,
        })),
        {
          description: data.description,
          assignedTo: data.assignedTo,
          dueDate: data.dueDate || undefined,
          status: data.status,
          notes: data.notes || undefined,
        },
      ];

      const response = await fetch('/api/incidents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          actionItems: allActionItems,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to add action item');
      }

      toast.success('Action item added successfully');
      form.reset();

      // Delay closing dialog to allow toast to render
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 100);
    } catch (error) {
      console.error('Error adding action item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add action item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus className="mr-2 h-4 w-4" />
          Add Action Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Action Item</DialogTitle>
          <DialogDescription>
            Create a new action item to track remediation efforts for this incident
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

            <DialogFooter>
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
                Add Action Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

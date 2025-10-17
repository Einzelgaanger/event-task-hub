import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Task } from '@/pages/Tasks';
import TaskDialog from '@/components/TaskDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  allTasks: Task[];
  level?: number;
  onEdit?: (task: Task) => void;
  onUpdate: () => void;
}

const TaskItem = ({ task, allTasks, level = 0, onEdit, onUpdate }: TaskItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const children = allTasks.filter(t => t.parent_id === task.id);
  const hasChildren = children.length > 0;

  // Check if all children are completed
  const allChildrenCompleted = hasChildren && children.every(child => {
    const childChildren = allTasks.filter(t => t.parent_id === child.id);
    if (childChildren.length > 0) {
      return childChildren.every(cc => cc.completed);
    }
    return child.completed;
  });

  const handleToggle = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id);

      if (error) throw error;
      onUpdate();
    } catch (error: any) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;
      toast.success('Task deleted!');
      onUpdate();
    } catch (error: any) {
      toast.error('Failed to delete task');
    }
  };

  const handleReschedule = async (newDate: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: new Date(newDate).toISOString() })
        .eq('id', task.id);

      if (error) throw error;
      toast.success('Task rescheduled!');
      onUpdate();
    } catch (error: any) {
      toast.error('Failed to reschedule task');
    }
  };

  return (
    <>
      <div className="space-y-1">
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-smooth group ${
            level > 0 ? 'ml-8' : ''
          }`}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}

          <Checkbox
            checked={task.completed || allChildrenCompleted}
            onCheckedChange={handleToggle}
            disabled={hasChildren && !allChildrenCompleted}
            className="transition-smooth"
          />

          <div className="flex-1 min-w-0">
            <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </div>
            {task.description && (
              <div className="text-sm text-muted-foreground truncate">
                {task.description}
              </div>
            )}
            {task.due_date && (
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), 'MMM d, yyyy')}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(task)}>
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const date = prompt('Enter new due date (YYYY-MM-DD):');
                    if (date) handleReschedule(date);
                  }}
                >
                  Reschedule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {hasChildren && expanded && (
          <div className="space-y-1">
            {children.map(child => (
              <TaskItem
                key={child.id}
                task={child}
                allTasks={allTasks}
                level={level + 1}
                onEdit={onEdit}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parentId={task.id}
        eventId={task.event_id}
        onSuccess={onUpdate}
      />
    </>
  );
};

export default TaskItem;

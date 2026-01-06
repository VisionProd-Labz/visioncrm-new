'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, CheckSquare, MoreVertical, Search, Filter, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    company: string | null;
  } | null;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  TODO: 'outline',
  IN_PROGRESS: 'secondary',
  DONE: 'default',
  CANCELLED: 'destructive',
};

const priorityColors: Record<string, string> = {
  LOW: 'text-gray-600 dark:text-gray-400',
  MEDIUM: 'text-blue-600 dark:text-blue-500',
  HIGH: 'text-orange-600 dark:text-orange-500',
  URGENT: 'text-red-600 dark:text-red-500',
};

export default function TasksPage() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    due_date: '',
  });

  const statusLabels: Record<string, string> = {
    TODO: t('tasks.status.todo'),
    IN_PROGRESS: t('tasks.status.in_progress'),
    DONE: t('tasks.status.done'),
    CANCELLED: t('tasks.status.cancelled'),
  };

  const priorityLabels: Record<string, string> = {
    LOW: t('tasks.priority.low'),
    MEDIUM: t('tasks.priority.medium'),
    HIGH: t('tasks.priority.high'),
    URGENT: t('tasks.priority.urgent'),
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      due_date: '',
    });
  };

  const handleCreateTask = async () => {
    if (!taskForm.title) {
      alert('Le titre est requis');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description || undefined,
          priority: taskForm.priority,
          status: 'TODO',
          due_date: taskForm.due_date || undefined,
        }),
      });

      if (response.ok) {
        await fetchTasks();
        setShowCreateModal(false);
        resetTaskForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création de la tâche');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Erreur lors de la création de la tâche');
    } finally {
      setIsSaving(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('tasks.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('tasks.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('tasks.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('tasks.new_task')}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('tasks.search_placeholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('tasks.all_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasks.all_status')}</SelectItem>
                <SelectItem value="TODO">{t('tasks.status.todo')}</SelectItem>
                <SelectItem value="IN_PROGRESS">{t('tasks.status.in_progress')}</SelectItem>
                <SelectItem value="DONE">{t('tasks.status.done')}</SelectItem>
                <SelectItem value="CANCELLED">{t('tasks.status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {tasks.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('tasks.table.title')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('tasks.table.status')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('tasks.table.priority')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('tasks.table.assigned_to')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('tasks.table.due_date')}</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('tasks.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';

                  return (
                    <tr
                      key={task.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <Link href={`/tasks/${task.id}`} className="group">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                          {task.contact && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.contact.company || `${task.contact.first_name} ${task.contact.last_name}`}
                            </p>
                          )}
                        </Link>
                      </td>
                      <td className="p-4">
                        <Badge variant={statusVariants[task.status]}>
                          {statusLabels[task.status]}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-medium ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </span>
                      </td>
                      <td className="p-4">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                              {task.assignee.name[0]}
                            </div>
                            <span className="text-sm text-foreground">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {task.due_date ? (
                          <div className="flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`} />
                            <span className={`text-sm ${isOverdue ? 'text-destructive font-medium' : 'text-foreground'}`}>
                              {new Date(task.due_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {task.status === 'TODO' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                updateTaskStatus(task.id, 'IN_PROGRESS');
                              }}
                            >
                              {t('tasks.button.start')}
                            </Button>
                          )}
                          {task.status === 'IN_PROGRESS' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={(e) => {
                                e.preventDefault();
                                updateTaskStatus(task.id, 'DONE');
                              }}
                            >
                              {t('tasks.button.finish')}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <CheckSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('tasks.empty_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('tasks.empty_description')}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('tasks.create_button')}
            </Button>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) resetTaskForm();
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('tasks.new_task')}</DialogTitle>
            <DialogDescription>
              Créez une nouvelle tâche à accomplir
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Titre de la tâche"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Description détaillée de la tâche..."
                rows={4}
              />
            </div>

            {/* Priority and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(value: any) => setTaskForm({ ...taskForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Basse</SelectItem>
                    <SelectItem value="MEDIUM">Moyenne</SelectItem>
                    <SelectItem value="HIGH">Haute</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Date d'échéance</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetTaskForm();
              }}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={isSaving || !taskForm.title}
            >
              {isSaving ? 'Création...' : 'Créer la tâche'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

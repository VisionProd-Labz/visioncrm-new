'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    company: string | null;
  } | null;
}

const statusLabels: Record<string, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
  CANCELLED: 'Annulé',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
};

const priorityColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  LOW: 'secondary',
  MEDIUM: 'default',
  HIGH: 'default',
  URGENT: 'destructive',
};

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
      } else if (response.status === 404) {
        router.push('/tasks');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!task) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchTask();
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/tasks');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Tâche non trouvée</p>
      </div>
    );
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={task.status === 'DONE' ? 'default' : 'secondary'}>
                {statusLabels[task.status]}
              </Badge>
              <Badge variant={priorityColors[task.priority]}>
                {priorityLabels[task.priority]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDelete} disabled={isUpdating}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {task.status === 'TODO' && (
            <Button
              size="sm"
              onClick={() => updateStatus('IN_PROGRESS')}
              disabled={isUpdating}
            >
              Démarrer
            </Button>
          )}
          {task.status === 'IN_PROGRESS' && (
            <>
              <Button
                size="sm"
                onClick={() => updateStatus('DONE')}
                disabled={isUpdating}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer comme terminé
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus('TODO')}
                disabled={isUpdating}
              >
                Retour à "À faire"
              </Button>
            </>
          )}
          {task.status === 'DONE' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus('TODO')}
              disabled={isUpdating}
            >
              Réouvrir
            </Button>
          )}
          {task.status !== 'CANCELLED' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateStatus('CANCELLED')}
              disabled={isUpdating}
            >
              Annuler
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Task Details */}
        <div className="md:col-span-2 space-y-6">
          {task.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{task.description}</p>
              </CardContent>
            </Card>
          )}

          {!task.description && (
            <Card>
              <CardContent className="py-8">
                <p className="text-sm text-muted-foreground text-center">
                  Aucune description fournie
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Assignment & Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.assignee && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" />
                    Assigné à
                  </p>
                  <p className="font-medium">{task.assignee.name}</p>
                  <p className="text-xs text-muted-foreground">{task.assignee.email}</p>
                </div>
              )}

              {task.due_date && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4" />
                    Échéance
                  </p>
                  <p className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                    {new Date(task.due_date).toLocaleString('fr-FR')}
                  </p>
                  {isOverdue && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      En retard
                    </p>
                  )}
                </div>
              )}

              {task.completed_at && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Terminé le</p>
                  <p className="font-medium text-green-600">
                    {new Date(task.completed_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Créé le</p>
                <p className="text-sm">
                  {new Date(task.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          {task.contact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Client associé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <Link
                    href={`/contacts/${task.contact.id}`}
                    className="font-medium hover:underline"
                  >
                    {task.contact.first_name} {task.contact.last_name}
                  </Link>
                </div>
                {task.contact.company && (
                  <div>
                    <p className="text-sm text-muted-foreground">Société</p>
                    <p className="font-medium">{task.contact.company}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${task.contact.email}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {task.contact.email}
                  </a>
                </div>
                {task.contact.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <a
                      href={`tel:${task.contact.phone}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {task.contact.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

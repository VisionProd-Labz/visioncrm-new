'use client';

import { useEffect, useState } from 'react';
import { Plus, Filter, Search, MoreVertical, Calendar, User, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { KryptonButton, KryptonCard } from '@/components/ui/krypton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { ProjectCard } from '@/components/projects/project-card';
import { KanbanColumn } from '@/components/projects/kanban-column';
import { NewProjectModal } from '@/components/projects/new-project-modal';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  quote?: {
    id: string;
    quoteNumber: string;
    totalAmount: number;
  };
  _count?: {
    tasks: number;
  };
  created_at: string;
  updated_at: string;
}

const STATUS_COLUMNS = [
  { id: 'PLANNING', label: 'Planification', color: '#3b82f6' },
  { id: 'IN_PROGRESS', label: 'En cours', color: '#f68100' },
  { id: 'ON_HOLD', label: 'En pause', color: '#f59e0b' },
  { id: 'COMPLETED', label: 'Terminé', color: '#10b981' },
  { id: 'CANCELLED', label: 'Annulé', color: '#ef4444' },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // const [activeId, setActiveId] = useState<string | null>(null);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${p.contact?.firstName} ${p.contact?.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus as any } : p))
    );

    // Update backend
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        // Revert on error
        fetchProjects();
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      fetchProjects();
    }
  };

  const getProjectsByStatus = (status: string) => {
    return filteredProjects.filter((p) => p.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NewProjectModal
        open={newProjectModalOpen}
        onOpenChange={setNewProjectModalOpen}
        onSuccess={fetchProjects}
      />

      <div className="p-6 space-y-6 h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projets</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {projects.length} projet{projects.length > 1 ? 's' : ''} au total
            </p>
          </div>

          <div className="flex items-center gap-2">
            <KryptonButton
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
              onClick={() => setNewProjectModalOpen(true)}
            >
              Nouveau projet
            </KryptonButton>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex gap-4 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map((column) => {
              const columnProjects = getProjectsByStatus(column.id);
              return (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.label}
                  color={column.color}
                  count={columnProjects.length}
                >
                  <div className="space-y-3">
                    {columnProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onStatusChange={(newStatus) => handleStatusChange(project.id, newStatus)}
                        onClick={() => router.push(`/projects/${project.id}`)}
                      />
                    ))}
                  </div>
                </KanbanColumn>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { Calendar, User, CheckCircle2, MoreVertical, ArrowRight } from 'lucide-react';
import { KryptonCard } from '@/components/ui/krypton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    contact?: {
      firstName: string;
      lastName: string;
    };
    quote?: {
      quoteNumber: string;
      totalAmount: number;
    };
    _count?: {
      tasks: number;
    };
    created_at: string;
  };
  onStatusChange?: (newStatus: string) => void;
  onClick?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'PLANNING', label: 'Planification' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'ON_HOLD', label: 'En pause' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'CANCELLED', label: 'Annulé' },
];

export function ProjectCard({ project, onStatusChange, onClick }: ProjectCardProps) {
  return (
    <div className="cursor-pointer">
      <KryptonCard
        padding="md"
        hover
        onClick={onClick}
        className="bg-card border border-border relative group"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 pr-6">
            {project.name}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>Voir les détails</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Changer le statut</DropdownMenuLabel>
              {STATUS_OPTIONS.filter((s) => s.value !== project.status).map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(status.value);
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-3 h-3" />
                  {status.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="space-y-2">
          {project.contact && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>
                {project.contact.firstName} {project.contact.lastName}
              </span>
            </div>
          )}

          {project.quote && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {project.quote.totalAmount.toLocaleString('fr-FR')}€
              </span>
              <span className="text-xs">• {project.quote.quoteNumber}</span>
            </div>
          )}

          {project._count && project._count.tasks > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3" />
              <span>{project._count.tasks} tâche{project._count.tasks > 1 ? 's' : ''}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </KryptonCard>
    </div>
  );
}

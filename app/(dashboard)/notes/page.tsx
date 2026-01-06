'use client';

import { useEffect, useState } from 'react';
import { Plus, List, CheckSquare, Star, Wrench, Briefcase, Archive, User, AlertCircle, MessageCircle, MoreVertical, Edit, Trash2, Lock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  is_favorite: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

type Category = 'all' | 'tasks' | 'important' | 'works' | 'business' | 'archive' | 'personal' | 'priority' | 'social';

export default function NotesPage() {
  const { t } = useLanguage();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'personal' as string,
  });

  useEffect(() => {
    fetchNotes();
  }, [selectedCategory]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes?category=${selectedCategory}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNoteForm({
      title: '',
      content: '',
      category: 'personal',
    });
  };

  const handleCreateNote = async () => {
    if (!noteForm.title || !noteForm.content) {
      alert('Le titre et le contenu sont requis');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteForm),
      });

      if (response.ok) {
        await fetchNotes();
        setShowCreateModal(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création de la note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Erreur lors de la création de la note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) return;

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const categories = [
    { id: 'all', label: 'Alls', icon: List },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'important', label: 'Important', icon: Star },
    { id: 'works', label: 'Works', icon: Wrench },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'priority', label: 'Priority', icon: AlertCircle },
    { id: 'social', label: 'Social', icon: MessageCircle },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tasks: 'border-l-green-500',
      important: 'border-l-red-500',
      works: 'border-l-blue-500',
      business: 'border-l-purple-500',
      archive: 'border-l-gray-500',
      personal: 'border-l-cyan-500',
      priority: 'border-l-orange-500',
      social: 'border-l-pink-500',
    };
    return colors[category] || 'border-l-gray-500';
  };

  const getCategoryDotColor = (category: string) => {
    const colors: Record<string, string> = {
      tasks: 'bg-green-500',
      important: 'bg-red-500',
      works: 'bg-blue-500',
      business: 'bg-purple-500',
      archive: 'bg-gray-500',
      personal: 'bg-cyan-500',
      priority: 'bg-orange-500',
      social: 'bg-pink-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock notes for demonstration
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Book a Ticket for Movie',
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis vitae iure, quo harum excepturi laudantium earu...',
      category: 'important',
      is_favorite: false,
      is_pinned: false,
      created_at: '2023-03-11',
      updated_at: '2023-03-11',
    },
    {
      id: '2',
      title: 'Go for lunch',
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis vitae iure, quo harum excepturi laudantium earu...',
      category: 'personal',
      is_favorite: false,
      is_pinned: false,
      created_at: '2023-04-01',
      updated_at: '2023-04-01',
    },
    {
      id: '3',
      title: 'Meeting with Mr.Jojo',
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis vitae iure, quo harum excepturi laudantium earu...',
      category: 'business',
      is_favorite: false,
      is_pinned: false,
      created_at: '2023-10-19',
      updated_at: '2023-10-19',
    },
    {
      id: '4',
      title: 'Give Review for design',
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis vitae iure, quo harum excepturi laudantium earu...',
      category: 'priority',
      is_favorite: false,
      is_pinned: false,
      created_at: '2023-01-02',
      updated_at: '2023-01-02',
    },
    {
      id: '5',
      title: 'Nightout with friends',
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis vitae iure, quo harum excepturi laudantium earu...',
      category: 'social',
      is_favorite: false,
      is_pinned: false,
      created_at: '2023-08-01',
      updated_at: '2023-08-01',
    },
    {
      id: '6',
      title: 'Launch new template',
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis vitae iure, quo harum excepturi laudantium earu...',
      category: 'works',
      is_favorite: false,
      is_pinned: false,
      created_at: '2023-01-21',
      updated_at: '2023-01-21',
    },
  ];

  const displayNotes = filteredNotes.length > 0 ? filteredNotes : mockNotes;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card p-4 space-y-6">
        {/* Add Notes Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          ADD NOTES
        </Button>

        {/* Categories */}
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as Category)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Notes</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select className="px-3 py-2 text-sm border border-border rounded-md bg-background">
                <option>NEWEST</option>
                <option>OLDEST</option>
                <option>A-Z</option>
              </select>
            </div>
          </div>

          {/* Notes Grid */}
          {displayNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayNotes.map((note) => (
                <div
                  key={note.id}
                  className={`bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow relative group border-l-4 ${getCategoryColor(note.category)}`}
                >
                  {/* Dropdown Menu */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(note.id, note.title)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Title and Date */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">{note.title}</h3>
                      <div className={`w-2 h-2 rounded-full ${getCategoryDotColor(note.category)}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {note.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button variant="ghost" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Lock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <List className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucune note
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Commencez par créer votre première note
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle note</DialogTitle>
            <DialogDescription>
              Créez une nouvelle note pour garder trace de vos idées
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                placeholder="Titre de la note"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <select
                id="category"
                value={noteForm.category}
                onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
              >
                <option value="personal">Personal</option>
                <option value="tasks">Tasks</option>
                <option value="important">Important</option>
                <option value="works">Works</option>
                <option value="business">Business</option>
                <option value="priority">Priority</option>
                <option value="social">Social</option>
              </select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Contenu *</Label>
              <Textarea
                id="content"
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                placeholder="Écrivez votre note ici..."
                rows={6}
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateNote}
              disabled={isSaving || !noteForm.title || !noteForm.content}
            >
              {isSaving ? 'Création...' : 'Créer la note'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

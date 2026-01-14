'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Edit, Trash2, Eye, MoreVertical, MapPin, Users, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  type: 'maintenance' | 'repair' | 'meeting' | 'other';
  client?: string;
  vehicle?: string;
  assigned_users?: string[]; // User IDs from metadata
}

export default function PlanningPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showUserFilter, setShowUserFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    all_day: false,
    type: 'MEETING' as 'MAINTENANCE' | 'REPAIR' | 'MEETING' | 'CALL' | 'SITE_VISIT' | 'OTHER',
    location: '',
    assigned_users: [] as string[],
  });

  useEffect(() => {
    fetchEvents();
    fetchTeamMembers();
  }, [currentDate]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team');
      if (!response.ok) throw new Error('Failed to fetch team');

      const data = await response.json();
      setTeamMembers(data.members || []);

      // Select all users by default
      const allUserIds = new Set<string>(data.members.map((m: any) => m.id as string));
      setSelectedUsers(allUserIds);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);

      // Get first and last day of current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);

      const response = await fetch(
        `/api/planning/events?start=${start.toISOString()}&end=${end.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();

      // Transform API events to component format
      const transformedEvents: Event[] = data.events.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: new Date(event.start_date),
        endDate: new Date(event.end_date),
        allDay: event.all_day,
        type: event.type.toLowerCase() as Event['type'],
        client: event.metadata?.client_name,
        vehicle: event.metadata?.vehicle_info,
        assigned_users: event.metadata?.assigned_users || [],
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const monthNames = [
    t('planning.month.january'), t('planning.month.february'), t('planning.month.march'),
    t('planning.month.april'), t('planning.month.may'), t('planning.month.june'),
    t('planning.month.july'), t('planning.month.august'), t('planning.month.september'),
    t('planning.month.october'), t('planning.month.november'), t('planning.month.december')
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'maintenance':
        return 'bg-blue-500';
      case 'repair':
        return 'bg-red-500';
      case 'meeting':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      const matchesDate = eventDate.getDate() === day &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();

      // Filter by selected users
      if (selectedUsers.size === 0) return matchesDate;

      const eventUsers = event.assigned_users || [];
      const hasSelectedUser = eventUsers.length === 0 ||
        eventUsers.some(userId => selectedUsers.has(userId));

      return matchesDate && hasSelectedUser;
    });
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllUsers = () => {
    const allUserIds = new Set(teamMembers.map(m => m.id));
    setSelectedUsers(allUserIds);
  };

  const deselectAllUsers = () => {
    setSelectedUsers(new Set());
  };

  const getUserColor = (userId: string) => {
    // Generate consistent color for each user based on their ID
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-amber-500',
      'bg-cyan-500',
      'bg-indigo-500',
      'bg-rose-500',
    ];
    const index = teamMembers.findIndex(m => m.id === userId);
    return colors[index % colors.length];
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${title} ?`)) return;
    try {
      const response = await fetch(`/api/planning/events/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      all_day: false,
      type: 'MEETING',
      location: '',
      assigned_users: [],
    });
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.start_date) {
      alert('Le titre et la date de début sont requis');
      return;
    }

    setIsSaving(true);
    try {
      // Combine date and time for start_date
      const startDateTime = eventForm.all_day
        ? `${eventForm.start_date}T00:00:00.000Z`
        : `${eventForm.start_date}T${eventForm.start_time || '09:00'}:00.000Z`;

      // Combine date and time for end_date
      const endDate = eventForm.end_date || eventForm.start_date;
      const endDateTime = eventForm.all_day
        ? `${endDate}T23:59:59.999Z`
        : `${endDate}T${eventForm.end_time || '10:00'}:00.000Z`;

      const response = await fetch('/api/planning/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description,
          start_date: startDateTime,
          end_date: endDateTime,
          all_day: eventForm.all_day,
          type: eventForm.type,
          location: eventForm.location,
          metadata: {
            assigned_users: eventForm.assigned_users,
          },
        }),
      });

      if (response.ok) {
        await fetchEvents();
        setShowCreateModal(false);
        resetEventForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création de l\'événement');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Erreur lors de la création de l\'événement');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('planning.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('planning.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToToday}>
            {t('planning.today')}
          </Button>
          <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            {t('planning.new_event')}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          {(['month', 'agenda'] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(mode)}
            >
              {t(`planning.${mode}`)}
            </Button>
          ))}

          {/* User Filter */}
          <DropdownMenu open={showUserFilter} onOpenChange={setShowUserFilter}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Utilisateurs ({selectedUsers.size}/{teamMembers.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Filtrer par utilisateur</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={selectAllUsers}
                    >
                      Tous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={deselectAllUsers}
                    >
                      Aucun
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {teamMembers.map((member) => {
                    const isSelected = selectedUsers.has(member.id);
                    const userColor = getUserColor(member.id);

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => toggleUserSelection(member.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleUserSelection(member.id)}
                          className="pointer-events-none"
                        />

                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name || member.email}
                            className={`w-8 h-8 rounded-full object-cover ring-2 ${
                              isSelected ? `ring-primary` : 'ring-transparent'
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full ${userColor} flex items-center justify-center text-white text-sm font-medium ring-2 ${
                              isSelected ? 'ring-primary' : 'ring-transparent'
                            }`}
                          >
                            {(member.name || member.email).charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {member.name || member.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.role}
                          </p>
                        </div>

                        <div className={`w-2 h-2 rounded-full ${userColor}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Calendar */}
      {viewMode === 'month' && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Days header */}
          <div className="grid grid-cols-7 bg-muted">
            {[
              t('planning.day.sun'), t('planning.day.mon'), t('planning.day.tue'),
              t('planning.day.wed'), t('planning.day.thu'), t('planning.day.fri'), t('planning.day.sat')
            ].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="min-h-[120px] p-2 border-r border-b border-border bg-muted/30"
              />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className="min-h-[120px] p-2 border-r border-b border-border hover:bg-muted/50 transition-colors last:border-r-0"
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday
                        ? 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded ${getEventColor(event.type)} text-white truncate cursor-pointer hover:opacity-80`}
                      >
                        {!event.allDay && (
                          <span className="mr-1">
                            {event.startDate.getHours()}:{event.startDate.getMinutes().toString().padStart(2, '0')}
                          </span>
                        )}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} {t('planning.more')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda View */}
      {viewMode === 'agenda' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('planning.no_events')}</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-1 h-full rounded-full ${getEventColor(event.type)}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {event.startDate.toLocaleDateString('fr-FR')}
                      </span>
                      {!event.allDay && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.startDate.getHours()}:{event.startDate.getMinutes().toString().padStart(2, '0')}
                          {' - '}
                          {event.endDate.getHours()}:{event.endDate.getMinutes().toString().padStart(2, '0')}
                        </span>
                      )}
                      {event.client && <span>{t('planning.client')}: {event.client}</span>}
                      {event.vehicle && <span>{t('planning.vehicle')}: {event.vehicle}</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/planning/events/${event.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/planning/events/${event.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(event.id, event.title)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) resetEventForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('planning.new_event')}</DialogTitle>
            <DialogDescription>
              Créez un nouvel événement dans votre calendrier
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Rendez-vous client"
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type d'événement</Label>
              <Select
                value={eventForm.type}
                onValueChange={(value: any) => setEventForm({ ...eventForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEETING">Réunion</SelectItem>
                  <SelectItem value="CALL">Appel téléphonique</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="REPAIR">Réparation</SelectItem>
                  <SelectItem value="SITE_VISIT">Visite sur site</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Détails de l'événement..."
                rows={3}
              />
            </div>

            {/* All Day toggle */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Label htmlFor="all_day" className="font-medium">Journée entière</Label>
                <p className="text-sm text-muted-foreground">L'événement dure toute la journée</p>
              </div>
              <Switch
                id="all_day"
                checked={eventForm.all_day}
                onCheckedChange={(checked) => setEventForm({ ...eventForm, all_day: checked })}
              />
            </div>

            {/* Date and time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={eventForm.start_date}
                  onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                  required
                />
              </div>
              {!eventForm.all_day && (
                <div className="space-y-2">
                  <Label htmlFor="start_time">Heure de début</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={eventForm.start_time}
                    onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={eventForm.end_date}
                  onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                />
              </div>
              {!eventForm.all_day && (
                <div className="space-y-2">
                  <Label htmlFor="end_time">Heure de fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={eventForm.end_time}
                    onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Lieu</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Adresse ou lieu de l'événement"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Assigned Users */}
            <div className="space-y-2">
              <Label>Assigner à</Label>
              <div className="border border-border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun membre disponible</p>
                ) : (
                  teamMembers.map((member) => {
                    const isAssigned = eventForm.assigned_users.includes(member.id);
                    const userColor = getUserColor(member.id);

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          const newAssigned = isAssigned
                            ? eventForm.assigned_users.filter(id => id !== member.id)
                            : [...eventForm.assigned_users, member.id];
                          setEventForm({ ...eventForm, assigned_users: newAssigned });
                        }}
                      >
                        <Checkbox
                          checked={isAssigned}
                          className="pointer-events-none"
                        />

                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name || member.email}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full ${userColor} flex items-center justify-center text-white text-sm font-medium`}
                          >
                            {(member.name || member.email).charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {member.name || member.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetEventForm();
              }}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={isSaving || !eventForm.title || !eventForm.start_date}
            >
              {isSaving ? 'Création...' : 'Créer l\'événement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Notifications Menu Component
 * Dropdown menu displaying user notifications
 */

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/language-context';
import { Notification } from './types';

// Mock notifications (in production, fetch from API)
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    name: 'Sophie Dubois',
    action: 'a répondu à votre demande',
    target: 'Devis #1245',
    time: '3 janv. 2026 · 12:05',
    avatar: 'SD',
  },
  {
    id: '2',
    name: 'Marc Lefebvre',
    action: 'vous suit maintenant',
    target: '',
    time: '2 janv. 2026 · 21:05',
    avatar: 'ML',
  },
  {
    id: '3',
    name: 'Julie Martin',
    action: 'vous a assigné une tâche',
    target: '#VP-2157',
    time: '2 janv. 2026 · 14:05',
    avatar: 'JM',
  },
  {
    id: '4',
    name: 'Système',
    action: 'a envoyé une notification',
    target: 'Rapport hebdomadaire',
    time: '1 janv. 2026 · 14:05',
    avatar: 'S',
  },
];

export function NotificationsMenu() {
  const { t } = useLanguage();
  const [notifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const notificationCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t('notifications.title')}</span>
        </DropdownMenuLabel>

        {/* Tabs */}
        <div className="flex gap-1 px-2 py-1 border-b border-border">
          <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-muted">
            {t('notifications.all')}
          </button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-md hover:bg-muted/50 text-muted-foreground">
            {t('notifications.followed')}
          </button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-md hover:bg-muted/50 text-muted-foreground">
            {t('notifications.archive')}
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              className="flex items-start gap-3 py-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                {notif.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{notif.name}</span> {notif.action}{' '}
                  {notif.target && <span className="font-medium">{notif.target}</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-center text-sm">
            {t('notifications.view_all')}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

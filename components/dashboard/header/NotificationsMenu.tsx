/**
 * Notifications Menu Component
 * Dropdown menu displaying user notifications
 */

import { useState, useEffect } from 'react';
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

export function NotificationsMenu() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const notificationCount = notifications.length;

  useEffect(() => {
    // Fetch real notifications from API
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('dashboard.loading')}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('notifications.empty')}
            </div>
          ) : (
            notifications.map((notif) => (
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
            ))
          )}
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

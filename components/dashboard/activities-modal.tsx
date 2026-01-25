'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, CheckCircle2, FileText, TrendingUp, Calendar, Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface Activity {
  id: string;
  type: 'contact_added' | 'task_completed' | 'quote_accepted' | 'quote_sent' | 'invoice_paid' | 'system';
  userName: string;
  targetName: string;
  createdAt: string;
}

interface ActivitiesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivitiesModal({ open, onOpenChange }: ActivitiesModalProps) {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [searchDate, setSearchDate] = useState('');

  const fetchActivities = async (reset = false) => {
    setIsLoading(true);
    try {
      const currentOffset = reset ? 0 : offset;
      let url = `/api/dashboard/activities?limit=20&offset=${currentOffset}`;

      if (searchDate) {
        const startDate = new Date(searchDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(searchDate);
        endDate.setHours(23, 59, 59, 999);
        url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setActivities(data.activities || []);
        } else {
          setActivities((prev) => [...prev, ...(data.activities || [])]);
        }
        setHasMore(data.hasMore);
        setOffset(currentOffset + 20);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setOffset(0);
      setActivities([]);
      fetchActivities(true);
    }
  }, [open]);

  const handleSearch = () => {
    setOffset(0);
    fetchActivities(true);
  };

  const handleLoadMore = () => {
    fetchActivities(false);
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'contact_added':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'quote_accepted':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'system':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'contact_added':
        return 'bg-blue-500/10';
      case 'task_completed':
        return 'bg-emerald-500/10';
      case 'quote_accepted':
        return 'bg-orange-500/10';
      case 'system':
        return 'bg-purple-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'contact_added':
        return (
          <>
            <span className="font-medium">{activity.userName || t('dashboard.activity.system')}</span>{' '}
            {t('dashboard.activity.added')}{' '}
            <span className="font-medium">{activity.targetName}</span>
          </>
        );
      case 'task_completed':
        return (
          <>
            <span className="font-medium">{activity.userName || t('dashboard.activity.system')}</span>{' '}
            {t('dashboard.activity.completed')}{' '}
            <span className="font-medium">{activity.targetName}</span>
          </>
        );
      case 'quote_accepted':
        return (
          <>
            <span className="font-medium">{activity.userName}</span>{' '}
            {t('dashboard.activity.accepted')}{' '}
            <span className="font-medium">#{activity.targetName}</span>
          </>
        );
      case 'system':
        return (
          <>
            <span className="font-medium">{t('dashboard.activity.system')}</span>{' '}
            {t('dashboard.activity.sent')}{' '}
            <span className="font-medium">{activity.targetName}</span>
          </>
        );
      default:
        return activity.targetName;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return t('dashboard.activity.time.minutes').replace('{time}', String(diffMins));
    } else if (diffHours < 24) {
      return t('dashboard.activity.time.hours').replace('{time}', String(diffHours));
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('dashboard.recent_activity')}</DialogTitle>
        </DialogHeader>

        {/* Search by date */}
        <div className="flex gap-2 py-4">
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="w-4 h-4 mr-2" />
            {t('contacts.search_button')}
          </Button>
          {searchDate && (
            <Button
              onClick={() => {
                setSearchDate('');
                setOffset(0);
                fetchActivities(true);
              }}
              variant="ghost"
            >
              {t('company.config.cancel')}
            </Button>
          )}
        </div>

        {/* Activities list */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading && activities.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('notifications.empty')}
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                <div
                  className={`w-8 h-8 rounded-full ${getActivityBgColor(
                    activity.type
                  )} flex items-center justify-center flex-shrink-0`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{getActivityText(activity)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load more button */}
        {hasMore && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {t('dashboard.see_all')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

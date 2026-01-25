'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Car,
  FileText,
  Euro,
  TrendingUp,
  Calendar,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { NewQuoteModal } from '@/components/quotes/new-quote-modal';
import { ActivitiesModal } from '@/components/dashboard/activities-modal';
import { useLanguage } from '@/contexts/language-context';
import { useModules } from '@/contexts/modules-context';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  contacts: { total: number; vip: number; change: number };
  vehicles: { total: number; change: number };
  quotes: { total: number; pending: number; accepted: number; change: number };
  invoices: { total: number; paid: number; pending: number; overdue: number; totalAmount: number; change: number };
  tasks: { total: number; completed: number; inProgress: number; change: number };
}

interface ChartDataPoint {
  month: string;
  revenue?: number;
  quotes?: number;
  entretiens?: number;
}

interface Activity {
  id: string;
  type: 'contact_added' | 'task_completed' | 'quote_accepted' | 'quote_sent' | 'invoice_paid' | 'system';
  userName: string;
  targetName: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { isModuleEnabled } = useModules();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newQuoteModalOpen, setNewQuoteModalOpen] = useState(false);
  const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);

  // Chart data state
  const [salesPerformance, setSalesPerformance] = useState<ChartDataPoint[]>([]);
  const [quoteEvolution, setQuoteEvolution] = useState<ChartDataPoint[]>([]);
  const [vehicleInterventions, setVehicleInterventions] = useState<ChartDataPoint[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Activities state
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchChartData();
    fetchRecentActivities();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();

      setStats({
        contacts: {
          total: data.contacts.total,
          vip: data.contacts.vip,
          change: data.contacts.change,
        },
        vehicles: {
          total: data.vehicles.total,
          change: data.vehicles.change,
        },
        quotes: {
          total: data.quotes.total,
          pending: data.quotes.pending,
          accepted: data.quotes.accepted,
          change: data.quotes.change,
        },
        invoices: {
          total: data.invoices.total,
          paid: data.invoices.paid,
          pending: data.invoices.total - data.invoices.paid - data.invoices.overdue,
          overdue: data.invoices.overdue,
          totalAmount: data.revenue.total,
          change: data.invoices.change,
        },
        tasks: {
          total: data.tasks.total,
          completed: data.tasks.completed,
          inProgress: data.tasks.pending - data.tasks.overdue,
          change: 0,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch('/api/dashboard/charts');

      if (response.ok) {
        const data = await response.json();

        // Translate month names
        const translateMonth = (month: string) => {
          const monthMap: Record<string, string> = {
            Jan: t('dashboard.months.jan'),
            Feb: t('dashboard.months.feb'),
            Mar: t('dashboard.months.mar'),
            Apr: t('dashboard.months.apr'),
            May: t('dashboard.months.may'),
            Jun: t('dashboard.months.jun'),
            Jul: t('dashboard.months.jul'),
            Aug: t('dashboard.months.aug'),
            Sep: t('dashboard.months.sep'),
            Oct: t('dashboard.months.oct'),
            Nov: t('dashboard.months.nov'),
            Dec: t('dashboard.months.dec'),
          };
          return monthMap[month] || month;
        };

        setSalesPerformance(
          data.salesPerformance?.map((d: any) => ({
            ...d,
            month: translateMonth(d.month),
          })) || []
        );
        setQuoteEvolution(
          data.quoteEvolution?.map((d: any) => ({
            ...d,
            month: translateMonth(d.month),
          })) || []
        );
        setVehicleInterventions(
          data.vehicleInterventions?.map((d: any) => ({
            ...d,
            month: translateMonth(d.month),
          })) || []
        );
      } else {
        // Set empty data with translated months (line at 0)
        const emptyMonths = [
          t('dashboard.months.jan'),
          t('dashboard.months.feb'),
          t('dashboard.months.mar'),
          t('dashboard.months.apr'),
          t('dashboard.months.may'),
          t('dashboard.months.jun'),
        ];
        const emptyData = emptyMonths.map((month) => ({ month, revenue: 0, quotes: 0, entretiens: 0 }));
        setSalesPerformance(emptyData);
        setQuoteEvolution(emptyData);
        setVehicleInterventions(emptyData);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Set empty data on error
      const emptyMonths = [
        t('dashboard.months.jan'),
        t('dashboard.months.feb'),
        t('dashboard.months.mar'),
        t('dashboard.months.apr'),
        t('dashboard.months.may'),
        t('dashboard.months.jun'),
      ];
      const emptyData = emptyMonths.map((month) => ({ month, revenue: 0, quotes: 0, entretiens: 0 }));
      setSalesPerformance(emptyData);
      setQuoteEvolution(emptyData);
      setVehicleInterventions(emptyData);
    } finally {
      setChartsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/dashboard/activities?limit=4');
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Generate trend data for sparklines based on actual stats
  const generateTrendData = (baseValue: number = 0, points: number = 12) => {
    if (baseValue === 0) {
      return Array.from({ length: points }, () => ({ value: 0 }));
    }
    return Array.from({ length: points }, (_, i) => ({
      value: Math.max(0, baseValue * (0.8 + Math.random() * 0.4)),
    }));
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

    if (diffMins < 60) {
      return t('dashboard.activity.time.minutes').replace('{time}', String(diffMins));
    } else if (diffHours < 24) {
      return t('dashboard.activity.time.hours').replace('{time}', String(diffHours));
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NewQuoteModal open={newQuoteModalOpen} onOpenChange={setNewQuoteModalOpen} />
      <ActivitiesModal open={activitiesModalOpen} onOpenChange={setActivitiesModalOpen} />

      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <span>VisionCRM</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {stats?.contacts.total} {t('dashboard.clients')}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                  <span className="inline-flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    {stats?.vehicles.total} {t('dashboard.vehicles')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setNewQuoteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground border border-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <FileText className="w-4 h-4" />
            {t('dashboard.new_quote')}
          </button>
        </div>

        {/* KPI Cards Grid with Sparklines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={t('dashboard.revenue')}
            value={`${(stats?.invoices.totalAmount || 0).toLocaleString('fr-FR')} €`}
            change={stats?.invoices.change}
            icon={Euro}
            iconColor="#3b82f6"
            iconBgColor="rgba(59, 130, 246, 0.1)"
            trendData={generateTrendData(stats?.invoices.totalAmount || 0)}
            trendColor="#3b82f6"
          />
          <MetricCard
            title={t('dashboard.active_clients')}
            value={stats?.contacts.total || 0}
            change={stats?.contacts.change}
            icon={Users}
            iconColor="#10b981"
            iconBgColor="rgba(16, 185, 129, 0.1)"
            trendData={generateTrendData(stats?.contacts.total || 0)}
            trendColor="#10b981"
          />
          <MetricCard
            title={t('nav.vehicles')}
            value={stats?.vehicles.total || 0}
            change={stats?.vehicles.change}
            icon={Car}
            iconColor="#f59e0b"
            iconBgColor="rgba(245, 158, 11, 0.1)"
            trendData={generateTrendData(stats?.vehicles.total || 0)}
            trendColor="#f59e0b"
          />
          <MetricCard
            title={t('dashboard.pending_quotes')}
            value={stats?.quotes.pending || 0}
            change={stats?.quotes.change}
            icon={FileText}
            iconColor="#ef4444"
            iconBgColor="rgba(239, 68, 68, 0.1)"
            trendData={generateTrendData(stats?.quotes.pending || 0)}
            trendColor="#ef4444"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-foreground">{t('dashboard.sales_performance')}</h3>
              </div>
              {chartsLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesPerformance}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="month"
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Quotes and Vehicles Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-foreground">{t('dashboard.quote_evolution')}</h3>
                </div>
                {chartsLoading ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={quoteEvolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                      <Bar dataKey="quotes" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-foreground">{t('dashboard.maintenance_evolution')}</h3>
                </div>
                {chartsLoading ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={vehicleInterventions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="entretiens"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-foreground">{t('dashboard.recent_activity')}</h3>
                <button
                  onClick={() => setActivitiesModalOpen(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t('dashboard.see_all')} →
                </button>
              </div>
              <div className="space-y-4">
                {activitiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {t('notifications.empty')}
                  </div>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
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
            </div>
          </div>
        </div>

        {/* Applications & Modules */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-base font-semibold text-foreground mb-6">{t('dashboard.apps_modules')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/contacts')}
              className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">{t('nav.contacts')}</h4>
                <p className="text-xs text-muted-foreground">{t('dashboard.clients_desc')}</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/planning')}
              className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">{t('dashboard.planning')}</h4>
                <p className="text-xs text-muted-foreground">{t('dashboard.planning_desc')}</p>
              </div>
            </button>

            {isModuleEnabled('quotes') && (
              <button
                onClick={() => router.push('/quotes')}
                className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">{t('nav.quotes')}</h4>
                  <p className="text-xs text-muted-foreground">{t('dashboard.quotes_desc')}</p>
                </div>
              </button>
            )}

            {isModuleEnabled('communications') && (
              <button
                onClick={() => router.push('/communications')}
                className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">{t('nav.communications')}</h4>
                  <p className="text-xs text-muted-foreground">{t('dashboard.communications_desc')}</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

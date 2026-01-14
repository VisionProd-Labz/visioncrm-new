'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Car,
  FileText,
  Euro,
  TrendingUp,
  Calendar,
  Mail,
  MessageSquare,
  UserPlus,
  FileSpreadsheet,
  Settings,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { NewQuoteModal } from '@/components/dashboard/new-quote-modal';
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

export default function DashboardPage() {
  const { t } = useLanguage();
  const { isModuleEnabled } = useModules();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newQuoteModalOpen, setNewQuoteModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();

      // Transform API response to match component interface
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
          change: 0, // Can calculate if needed
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Using Krypton Design System animations

  // Chart data
  const revenueData = [
    { month: t('dashboard.months.jan'), revenue: 12400, quotes: 28 },
    { month: t('dashboard.months.feb'), revenue: 15200, quotes: 32 },
    { month: t('dashboard.months.mar'), revenue: 18100, quotes: 35 },
    { month: t('dashboard.months.apr'), revenue: 14800, quotes: 29 },
    { month: t('dashboard.months.may'), revenue: 22300, quotes: 42 },
    { month: t('dashboard.months.jun'), revenue: 25600, quotes: 48 },
  ];

  const tasksByStatus = [
    { name: t('dashboard.tasks_completed'), value: stats?.tasks.completed || 0, color: '#10b981' },
    { name: t('dashboard.tasks_in_progress'), value: stats?.tasks.inProgress || 0, color: '#f68100' },
    { name: t('dashboard.tasks_todo'), value: (stats?.tasks.total || 0) - (stats?.tasks.completed || 0) - (stats?.tasks.inProgress || 0), color: '#6366f1' },
  ];

  const vehiclesByStatus = [
    { month: t('dashboard.months.jan'), entretiens: 45 },
    { month: t('dashboard.months.feb'), entretiens: 52 },
    { month: t('dashboard.months.mar'), entretiens: 48 },
    { month: t('dashboard.months.apr'), entretiens: 61 },
    { month: t('dashboard.months.may'), entretiens: 55 },
    { month: t('dashboard.months.jun'), entretiens: 67 },
  ];

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

  // Generate trend data for sparklines
  const generateTrendData = (points: number = 12) => {
    return Array.from({ length: points }, (_, i) => ({
      value: Math.random() * 100 + 50,
    }));
  };

  return (
    <>
      <NewQuoteModal open={newQuoteModalOpen} onOpenChange={setNewQuoteModalOpen} />

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
          trendData={generateTrendData()}
          trendColor="#3b82f6"
        />
        <MetricCard
          title={t('dashboard.active_clients')}
          value={stats?.contacts.total || 0}
          change={stats?.contacts.change}
          icon={Users}
          iconColor="#10b981"
          iconBgColor="rgba(16, 185, 129, 0.1)"
          trendData={generateTrendData()}
          trendColor="#10b981"
        />
        <MetricCard
          title={t('nav.vehicles')}
          value={stats?.vehicles.total || 0}
          change={stats?.vehicles.change}
          icon={Car}
          iconColor="#f59e0b"
          iconBgColor="rgba(245, 158, 11, 0.1)"
          trendData={generateTrendData()}
          trendColor="#f59e0b"
        />
        <MetricCard
          title={t('dashboard.pending_quotes')}
          value={stats?.quotes.pending || 0}
          change={-3.2}
          icon={FileText}
          iconColor="#ef4444"
          iconBgColor="rgba(239, 68, 68, 0.1)"
          trendData={generateTrendData()}
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
              <button className="text-xs text-muted-foreground hover:text-foreground">
                {t('dashboard.see_all')} →
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
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
          </div>

          {/* Quotes and Vehicles Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-foreground">{t('dashboard.quote_evolution')}</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
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
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-foreground">{t('dashboard.maintenance_evolution')}</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={vehiclesByStatus}>
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
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-foreground">{t('dashboard.recent_activity')}</h3>
              <button className="text-xs text-muted-foreground hover:text-foreground">
                {t('dashboard.see_all')} →
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Sophie Martin</span> a ajouté{' '}
                    <span className="font-medium">Lucas Dubois</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Il y a 2m</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Marc Leroy</span> a terminé{' '}
                    <span className="font-medium">Révision Peugeot 308</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Il y a 45m</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Système</span> a envoyé{' '}
                    <span className="font-medium">Rapport hebdomadaire</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Il y a 2h</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Julie Bernard</span> a accepté le devis{' '}
                    <span className="font-medium">#2024-089</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Il y a 4h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">{t('dashboard.quick_actions')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/contacts')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
              >
                <UserPlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{t('dashboard.new_client')}</span>
              </button>
              {isModuleEnabled('vehicles') && (
                <button
                  onClick={() => router.push('/vehicles')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                >
                  <Car className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{t('dashboard.new_vehicle')}</span>
                </button>
              )}
              <button
                onClick={() => isModuleEnabled('quotes') && router.push('/quotes')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors disabled:opacity-50"
                disabled={!isModuleEnabled('quotes')}
              >
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{t('dashboard.new_quote')}</span>
              </button>
              <button
                onClick={() => router.push('/planning')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
              >
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{t('dashboard.schedule')}</span>
              </button>
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

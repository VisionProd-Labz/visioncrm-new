'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Euro, Users, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

export default function ReportsPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('reports.loading')}</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    const date = new Date();
    const dateStr = date.toLocaleDateString('fr-FR');

    // Prepare CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Rapport VisionCRM - ${t('reports.periods.' + selectedPeriod)}\n`;
    csvContent += `Date: ${dateStr}\n\n`;

    // KPIs section
    csvContent += 'Indicateurs clés\n';
    csvContent += 'Métrique,Valeur,Évolution\n';
    kpis.forEach(kpi => {
      csvContent += `"${t(kpi.labelKey)}","${kpi.value}","${kpi.change}"\n`;
    });

    csvContent += '\n';

    // Services section
    csvContent += 'Top Services\n';
    csvContent += 'Service,Nombre\n';
    [
      { serviceKey: 'reports.services.complete_service', count: 45 },
      { serviceKey: 'reports.services.oil_change', count: 38 },
      { serviceKey: 'reports.services.braking', count: 32 },
      { serviceKey: 'reports.services.tires', count: 28 },
      { serviceKey: 'reports.services.air_conditioning', count: 22 },
    ].forEach(item => {
      csvContent += `"${t(item.serviceKey)}","${item.count}"\n`;
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rapport_${date.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const periods = [
    { key: 'week', label: t('reports.periods.week') },
    { key: 'month', label: t('reports.periods.month') },
    { key: 'quarter', label: t('reports.periods.quarter') },
    { key: 'year', label: t('reports.periods.year') },
  ];

  const kpis = [
    { labelKey: 'reports.kpi.revenue', value: '125 890 €', change: '+15.3%', icon: Euro, color: 'text-orange-600 dark:text-orange-500', bg: 'bg-orange-500/10' },
    { labelKey: 'reports.kpi.new_clients', value: '28', change: '+8.2%', icon: Users, color: 'text-blue-600 dark:text-blue-500', bg: 'bg-blue-500/10' },
    { labelKey: 'reports.kpi.interventions', value: '156', change: '+12.1%', icon: Car, color: 'text-emerald-600 dark:text-emerald-500', bg: 'bg-emerald-500/10' },
    { labelKey: 'reports.kpi.conversion_rate', value: '68%', change: '+4.5%', icon: TrendingUp, color: 'text-purple-600 dark:text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('reports.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('reports.subtitle')}
          </p>
        </div>
        <Button onClick={handleExport} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Download className="mr-2 h-4 w-4" />
          {t('reports.export')}
        </Button>
      </div>

      {/* Period Selector */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div className="flex gap-2">
            {periods.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period.key)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500 text-sm font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>{kpi.change}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{t(kpi.labelKey)}</p>
            <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">{t('reports.chart.revenue_evolution')}</h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[45, 52, 48, 61, 55, 67, 72, 58, 64, 70, 75, 68].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-primary to-blue-500 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                style={{ height: `${height}%` }}
                title={`${height}k €`}
              />
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">{t('reports.chart.top_services')}</h3>
          <div className="space-y-4">
            {[
              { serviceKey: 'reports.services.complete_service', count: 45, percentage: 85, color: 'bg-orange-500' },
              { serviceKey: 'reports.services.oil_change', count: 38, percentage: 72, color: 'bg-blue-500' },
              { serviceKey: 'reports.services.braking', count: 32, percentage: 60, color: 'bg-emerald-500' },
              { serviceKey: 'reports.services.tires', count: 28, percentage: 53, color: 'bg-purple-500' },
              { serviceKey: 'reports.services.air_conditioning', count: 22, percentage: 42, color: 'bg-red-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">{t(item.serviceKey)}</span>
                  <span className="text-sm font-semibold text-foreground">{item.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">{t('reports.summary.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">{t('reports.summary.best_day')}</p>
            <p className="text-2xl font-bold text-foreground mb-1">{t('reports.day.friday')}</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">12 450 € de CA</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">{t('reports.summary.satisfaction_rate')}</p>
            <p className="text-2xl font-bold text-foreground mb-1">94.5%</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">+2.3% vs mois dernier</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">{t('reports.summary.avg_intervention_time')}</p>
            <p className="text-2xl font-bold text-foreground mb-1">2h 15min</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">-10min vs mois dernier</p>
          </div>
        </div>
      </div>
    </div>
  );
}

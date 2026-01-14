'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  Receipt,
  Building2,
  Package,
  FileText,
  TrendingUp,
  Scale,
} from 'lucide-react';

// Import tab content components
import { OverviewTab } from './tabs/overview-tab';
import { ExpensesTab } from './tabs/expenses-tab';
import { BankTab } from './tabs/bank-tab';
import { InventoryTab } from './tabs/inventory-tab';
import { DocumentsTab } from './tabs/documents-tab';
import { ReportsTab } from './tabs/reports-tab';
import { LitigationTab } from './tabs/litigation-tab';

export function AccountingTabs() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      value: 'overview',
      label: 'Vue d\'ensemble',
      icon: LayoutDashboard,
      component: OverviewTab,
    },
    {
      value: 'expenses',
      label: 'Dépenses',
      icon: Receipt,
      component: ExpensesTab,
    },
    {
      value: 'bank',
      label: 'Banque',
      icon: Building2,
      component: BankTab,
    },
    {
      value: 'inventory',
      label: 'Inventaire',
      icon: Package,
      component: InventoryTab,
    },
    {
      value: 'documents',
      label: 'Documents',
      icon: FileText,
      component: DocumentsTab,
    },
    {
      value: 'reports',
      label: 'Rapports',
      icon: TrendingUp,
      component: ReportsTab,
    },
    {
      value: 'litigation',
      label: 'Contentieux',
      icon: Scale,
      component: LitigationTab,
    },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-7 h-auto p-1 bg-muted/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => {
        const Component = tab.component;
        return (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            <Component />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

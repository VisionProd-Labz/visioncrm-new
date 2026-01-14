'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Car,
  Package,
  FileText,
  Receipt,
  CheckSquare,
  BarChart3,
  Settings,
  Bot,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  Calendar,
  Mail,
  UserCog,
  TrendingUp,
  Wallet,
  ShoppingCart,
  PackageSearch,
  FolderOpen,
  Scale,
  Kanban,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSidebar } from '@/contexts/sidebar-context';
import { useLanguage } from '@/contexts/language-context';
import { useModules } from '@/contexts/modules-context';

const mainNav = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.contacts', href: '/contacts', icon: Users },
  { key: 'nav.projects', href: '/projects', icon: Kanban },
  { key: 'nav.catalog', href: '/catalog', icon: Package },
  { key: 'nav.planning', href: '/planning', icon: Calendar },
];

const salesNav = [
  { key: 'nav.quotes', href: '/quotes', icon: FileText, module: 'quotes' as const },
  { key: 'nav.invoices', href: '/invoices', icon: Receipt, module: 'invoices' as const },
];

const accountingNav = [
  { key: 'nav.accounting.dashboard', href: '/accounting', icon: BarChart3, module: 'accounting' as const },
  { key: 'nav.accounting.bank', href: '/accounting/bank-reconciliation', icon: Wallet, module: 'accounting' as const },
  { key: 'nav.accounting.expenses', href: '/accounting/expenses', icon: ShoppingCart, module: 'accounting' as const },
  { key: 'nav.accounting.inventory', href: '/accounting/inventory', icon: PackageSearch, module: 'accounting' as const },
  { key: 'nav.accounting.documents', href: '/accounting/documents', icon: FolderOpen, module: 'accounting' as const },
  { key: 'nav.accounting.reports', href: '/accounting/reports', icon: TrendingUp, module: 'accounting' as const },
];

const toolsNav = [
  { key: 'nav.vehicles', href: '/vehicles', icon: Car, module: 'vehicles' as const },
  { key: 'nav.tasks', href: '/tasks', icon: CheckSquare, module: 'tasks' as const },
  { key: 'nav.communications', href: '/communications', icon: MessageSquare, module: 'communications' as const },
  // { key: 'nav.email', href: '/email', icon: Mail }, // Temporairement désactivé - OAuth non configuré
  { key: 'nav.reports', href: '/reports', icon: BarChart3, module: 'reports' as const },
  // { key: 'nav.ai_assistant', href: '/ai-assistant', icon: Bot }, // Temporairement désactivé - API en configuration
  { key: 'nav.company', href: '/company', icon: Building2 },
  { key: 'nav.team', href: '/team', icon: UserCog },
  { key: 'nav.settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { t } = useLanguage();
  const { isModuleEnabled } = useModules();

  const renderNavSection = (titleKey: string, items: (typeof mainNav | typeof salesNav | typeof toolsNav)) => {
    // Filtrer les items en fonction des modules activés
    const filteredItems = items.filter((item) => {
      if ('module' in item && item.module && typeof item.module === 'string') {
        return isModuleEnabled(item.module as any);
      }
      return true;
    });

    // Ne pas afficher la section si elle est vide
    if (filteredItems.length === 0) {
      return null;
    }

    return (
      <div className="mb-6">
        {!isCollapsed && (
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t(titleKey)}
          </h3>
        )}
        <div className="space-y-0.5">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            const translatedName = t(item.key);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? translatedName : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{translatedName}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "flex h-full flex-col bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo and collapse button */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <Car className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-foreground">
              VisionCRM
            </span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-muted transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {renderNavSection('nav.section.main', mainNav)}
        {renderNavSection('nav.section.sales', salesNav)}
        {renderNavSection('nav.section.accounting', accountingNav)}
        {renderNavSection('nav.section.tools', toolsNav)}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-4 space-y-4">
        {/* Theme Toggle */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-xs font-medium text-muted-foreground">{t('theme.label')}</span>
            <div className="scale-75 origin-right">
              <ThemeToggle />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        )}

        {/* VisionCRM AI - Temporairement désactivé */}
        {/* {!isCollapsed && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">{t('ai.title')}</p>
                <p className="text-xs text-muted-foreground">{t('ai.description')}</p>
              </div>
            </div>
            <Link href="/ai-assistant">
              <button className="w-full px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                {t('ai.try_now')}
              </button>
            </Link>
          </div>
        )} */}
      </div>
    </div>
  );
}

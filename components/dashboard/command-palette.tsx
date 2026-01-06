'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  LayoutDashboard,
  Users,
  Car,
  Package,
  FileText,
  Receipt,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Bot,
  Settings,
  Search,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useModules } from '@/contexts/modules-context';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commands = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.contacts', href: '/contacts', icon: Users },
  { key: 'nav.catalog', href: '/catalog', icon: Package },
  { key: 'nav.vehicles', href: '/vehicles', icon: Car, module: 'vehicles' as const },
  { key: 'nav.quotes', href: '/quotes', icon: FileText, module: 'quotes' as const },
  { key: 'nav.invoices', href: '/invoices', icon: Receipt, module: 'invoices' as const },
  { key: 'nav.tasks', href: '/tasks', icon: CheckSquare, module: 'tasks' as const },
  { key: 'nav.communications', href: '/communications', icon: MessageSquare, module: 'communications' as const },
  { key: 'nav.reports', href: '/reports', icon: BarChart3, module: 'reports' as const },
  { key: 'nav.ai_assistant', href: '/ai-assistant', icon: Bot },
  { key: 'nav.settings', href: '/settings', icon: Settings },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { isModuleEnabled } = useModules();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filtrer les commandes en fonction des modules activés
  const availableCommands = commands.filter((cmd) => {
    if ('module' in cmd && cmd.module) {
      return isModuleEnabled(cmd.module);
    }
    return true;
  });

  const filteredCommands = availableCommands.filter((cmd) =>
    t(cmd.key).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  const handleSelect = (href: string) => {
    router.push(href);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex].href);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogTitle className="sr-only">{t('command_palette.placeholder')}</DialogTitle>
        <div className="flex items-center border-b border-border px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('command_palette.placeholder')}
            className="h-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t('command_palette.no_results')}
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.href}
                    onClick={() => handleSelect(cmd.href)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                      index === selectedIndex
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(cmd.key)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↓</kbd>
            <span>{t('command_palette.navigate')}</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Entrée</kbd>
            <span>{t('command_palette.select')}</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Échap</kbd>
            <span>{t('command_palette.close')}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

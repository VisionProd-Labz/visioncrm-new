'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Search, Bell, User, Settings, LogOut, Building2, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommandPalette } from './command-palette';
import { GlobalSearch } from './global-search';
import { useLanguage } from '@/contexts/language-context';

// Icônes de drapeaux en SVG inline pour éviter les dépendances
const FrenchFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex">
    <div className="w-1/3 bg-[#002395]" />
    <div className="w-1/3 bg-white" />
    <div className="w-1/3 bg-[#ED2939]" />
  </div>
);

const USFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="flex-1 flex">
      <div className="flex-1 bg-[#B22234]" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#B22234]" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#B22234]" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#B22234]" />
    </div>
    <div className="flex-1 flex">
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#B22234]" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#B22234]" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#B22234]" />
      <div className="flex-1 bg-white" />
    </div>
    <div className="flex-1 bg-[#B22234]" />
    <div className="flex-1 bg-white" />
  </div>
);

const SpanishFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-[#AA151B]" />
    <div className="h-1/3 bg-[#F1BF00]" />
    <div className="h-1/3 bg-[#AA151B]" />
  </div>
);

const GermanFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-black" />
    <div className="h-1/3 bg-[#DD0000]" />
    <div className="h-1/3 bg-[#FFCE00]" />
  </div>
);

const DutchFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-[#AE1C28]" />
    <div className="h-1/3 bg-white" />
    <div className="h-1/3 bg-[#21468B]" />
  </div>
);

const RussianFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-white" />
    <div className="h-1/3 bg-[#0039A6]" />
    <div className="h-1/3 bg-[#D52B1E]" />
  </div>
);

const ChineseFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden bg-[#DE2910] flex items-center justify-center text-[10px]">
    🇨🇳
  </div>
);

const ArabicFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-[#006C35]" />
    <div className="h-1/3 bg-white" />
    <div className="h-1/3 bg-black" />
  </div>
);

const HindiFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-[#FF9933]" />
    <div className="h-1/3 bg-white" />
    <div className="h-1/3 bg-[#138808]" />
  </div>
);

const BengaliFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden bg-[#006A4E] flex items-center justify-center">
    <div className="w-2 h-2 rounded-full bg-[#F42A41]" />
  </div>
);

const TurkishFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden bg-[#E30A17] flex items-center justify-center text-[10px]">
    🇹🇷
  </div>
);

const UrduFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden bg-white flex items-center justify-center text-[10px]">
    🇵🇰
  </div>
);

const LuxembourgishFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-[#ED2939]" />
    <div className="h-1/3 bg-white" />
    <div className="h-1/3 bg-[#00A1DE]" />
  </div>
);

export function Header() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [notificationCount] = useState(4);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const getCurrentFlag = () => {
    switch (language) {
      case 'en':
        return <USFlag />;
      case 'es':
        return <SpanishFlag />;
      case 'de':
        return <GermanFlag />;
      case 'nl':
        return <DutchFlag />;
      case 'ru':
        return <RussianFlag />;
      case 'zh':
        return <ChineseFlag />;
      case 'ar':
        return <ArabicFlag />;
      case 'hi':
        return <HindiFlag />;
      case 'bn':
        return <BengaliFlag />;
      case 'tr':
        return <TurkishFlag />;
      case 'ur':
        return <UrduFlag />;
      case 'lb':
        return <LuxembourgishFlag />;
      default:
        return <FrenchFlag />;
    }
  };

  // Écouter les raccourcis clavier ⌘K ou Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-40">
        {/* Global Search */}
        <GlobalSearch />

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              {getCurrentFlag()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 max-h-[400px] overflow-y-auto">
            <DropdownMenuLabel>{t('language.select')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'fr' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('fr')}
            >
              <FrenchFlag />
              <span className={language === 'fr' ? 'font-medium' : ''}>{t('language.french')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'en' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('en')}
            >
              <USFlag />
              <span className={language === 'en' ? 'font-medium' : ''}>{t('language.english')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'es' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('es')}
            >
              <SpanishFlag />
              <span className={language === 'es' ? 'font-medium' : ''}>{t('language.spanish')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'de' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('de')}
            >
              <GermanFlag />
              <span className={language === 'de' ? 'font-medium' : ''}>{t('language.german')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'nl' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('nl')}
            >
              <DutchFlag />
              <span className={language === 'nl' ? 'font-medium' : ''}>{t('language.dutch')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'ru' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('ru')}
            >
              <RussianFlag />
              <span className={language === 'ru' ? 'font-medium' : ''}>{t('language.russian')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'zh' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('zh')}
            >
              <ChineseFlag />
              <span className={language === 'zh' ? 'font-medium' : ''}>{t('language.chinese')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'ar' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('ar')}
            >
              <ArabicFlag />
              <span className={language === 'ar' ? 'font-medium' : ''}>{t('language.arabic')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'hi' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('hi')}
            >
              <HindiFlag />
              <span className={language === 'hi' ? 'font-medium' : ''}>{t('language.hindi')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'bn' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('bn')}
            >
              <BengaliFlag />
              <span className={language === 'bn' ? 'font-medium' : ''}>{t('language.bengali')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'tr' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('tr')}
            >
              <TurkishFlag />
              <span className={language === 'tr' ? 'font-medium' : ''}>{t('language.turkish')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'ur' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('ur')}
            >
              <UrduFlag />
              <span className={language === 'ur' ? 'font-medium' : ''}>{t('language.urdu')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-3 ${language === 'lb' ? 'bg-muted' : ''}`}
              onClick={() => setLanguage('lb')}
            >
              <LuxembourgishFlag />
              <span className={language === 'lb' ? 'font-medium' : ''}>{t('language.luxembourgish')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
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
              {[
                {
                  name: 'Sophie Dubois',
                  action: 'a répondu à votre demande',
                  target: 'Devis #1245',
                  time: '3 janv. 2026 · 12:05',
                  avatar: 'SD',
                },
                {
                  name: 'Marc Lefebvre',
                  action: 'vous suit maintenant',
                  target: '',
                  time: '2 janv. 2026 · 21:05',
                  avatar: 'ML',
                },
                {
                  name: 'Julie Martin',
                  action: 'vous a assigné une tâche',
                  target: '#VP-2157',
                  time: '2 janv. 2026 · 14:05',
                  avatar: 'JM',
                },
                {
                  name: 'Système',
                  action: 'a envoyé une notification',
                  target: 'Rapport hebdomadaire',
                  time: '1 janv. 2026 · 14:05',
                  avatar: 'S',
                },
              ].map((notif, i) => (
                <DropdownMenuItem key={i} className="flex items-start gap-3 py-3 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                    {notif.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{notif.name}</span>{' '}
                      {notif.action}{' '}
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

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                AU
              </div>
              <span className="text-xs font-medium hidden sm:inline-block">Admin User</span>
              <div className="w-1 h-1 rounded-full bg-emerald-500 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@example.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Theme Toggle */}
            <div className="px-2 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('user.menu.theme')}</span>
                <ThemeToggle />
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2" onClick={() => router.push('/company')}>
              <Building2 className="h-4 w-4" />
              <span>{t('user.menu.my_company')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => window.open('https://docs.visioncrm.app', '_blank')}>
              <FileText className="h-4 w-4" />
              <span>{t('user.menu.documentation')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => router.push('/settings')}>
              <Settings className="h-4 w-4" />
              <span>{t('user.menu.settings')}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>{t('user.menu.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  );
}

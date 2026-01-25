/**
 * User Profile Menu Component
 * Dropdown menu for user settings and logout
 */

import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Building2, FileText, Settings, LogOut } from 'lucide-react';
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
import { useLanguage } from '@/contexts/language-context';

/**
 * Get user initials from name
 */
const getUserInitials = (name: string | null | undefined): string => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function UserProfileMenu() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || ''}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              {getUserInitials(session?.user?.name)}
            </div>
          )}
          <span className="text-xs font-medium hidden sm:inline-block">
            {session?.user?.name || 'User'}
          </span>
          <div className="w-1 h-1 rounded-full bg-emerald-500 hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email || ''}</p>
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

        {/* Menu Items */}
        <DropdownMenuItem className="gap-2" onClick={() => router.push('/company')}>
          <Building2 className="h-4 w-4" />
          <span>{t('user.menu.my_company')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={() => router.push('/settings')}>
          <Settings className="h-4 w-4" />
          <span>{t('user.menu.settings')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>{t('user.menu.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Building2,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Puzzle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLanguage } from '@/contexts/language-context';
import { useModules, ModuleType } from '@/contexts/modules-context';
import { cn } from '@/lib/utils';

const settingsSections = [
  { id: 'modules', labelKey: 'settings.section.modules', icon: Puzzle },
  { id: 'appearance', labelKey: 'settings.section.appearance', icon: Palette },
  { id: 'notifications', labelKey: 'settings.section.notifications', icon: Bell },
  { id: 'security', labelKey: 'settings.section.security', icon: Shield },
  { id: 'profile', labelKey: 'settings.section.profile', icon: User },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('modules');
  const { t } = useLanguage();
  const { enabledModules, toggleModule } = useModules();

  const modulesList: { id: ModuleType; labelKey: string; descKey: string }[] = [
    { id: 'vehicles', labelKey: 'modules.vehicles', descKey: 'modules.vehicles.desc' },
    { id: 'quotes', labelKey: 'modules.quotes', descKey: 'modules.quotes.desc' },
    { id: 'invoices', labelKey: 'modules.invoices', descKey: 'modules.invoices.desc' },
    { id: 'tasks', labelKey: 'modules.tasks', descKey: 'modules.tasks.desc' },
    { id: 'communications', labelKey: 'modules.communications', descKey: 'modules.communications.desc' },
    { id: 'reports', labelKey: 'modules.reports', descKey: 'modules.reports.desc' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-3">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{t(section.labelKey)}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-lg p-6">
            {/* Modules Section */}
            {activeSection === 'modules' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    {t('modules.title')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('modules.description')}
                  </p>
                </div>

                <div className="space-y-3">
                  {modulesList.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {t(module.labelKey)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t(module.descKey)}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabledModules.includes(module.id)}
                          onChange={() => toggleModule(module.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10">
                  <p className="text-sm text-foreground">
                    <strong>{t('common.note')}:</strong> {t('settings.modules.warning')}
                  </p>
                </div>
              </div>
            )}

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    {t('settings.profile.title')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.profile.subtitle')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('settings.profile.first_name')}</Label>
                      <Input id="firstName" defaultValue="Jean" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('settings.profile.last_name')}</Label>
                      <Input id="lastName" defaultValue="Dupont" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('settings.profile.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="jean.dupont@garageauto.fr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
                    <Input id="phone" defaultValue="+33 6 12 34 56 78" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">{t('settings.profile.role')}</Label>
                    <Input id="role" defaultValue="Gérant" disabled />
                  </div>

                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Save className="mr-2 h-4 w-4" />
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    {t('settings.appearance.title')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.appearance.subtitle')}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Theme Toggle - TRÈS VISIBLE */}
                  <div className="bg-muted/50 border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {t('theme.label')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.appearance.theme_desc')}
                        </p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* Primary Color Selector */}
                  <div className="bg-muted/50 border border-border rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground">
                          Couleur primaire
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Personnalisez la couleur principale de l'interface
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="primaryColor">Couleur</Label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              id="primaryColor"
                              defaultValue="#3b82f6"
                              className="h-12 w-24 rounded-lg cursor-pointer border-2 border-border"
                              onChange={(e) => {
                                // Update CSS variable
                                document.documentElement.style.setProperty('--primary', e.target.value);
                                // Save to localStorage
                                localStorage.setItem('primaryColor', e.target.value);
                              }}
                            />
                            <div className="flex-1">
                              <Input
                                id="primaryColorHex"
                                defaultValue="#3b82f6"
                                placeholder="#3b82f6"
                                className="font-mono"
                                onChange={(e) => {
                                  const color = e.target.value;
                                  if (/^#[0-9A-F]{6}$/i.test(color)) {
                                    document.documentElement.style.setProperty('--primary', color);
                                    localStorage.setItem('primaryColor', color);
                                    const colorInput = document.getElementById('primaryColor') as HTMLInputElement;
                                    if (colorInput) colorInput.value = color;
                                  }
                                }}
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const defaultColor = '#3b82f6';
                                document.documentElement.style.setProperty('--primary', defaultColor);
                                localStorage.setItem('primaryColor', defaultColor);
                                const colorInput = document.getElementById('primaryColor') as HTMLInputElement;
                                const hexInput = document.getElementById('primaryColorHex') as HTMLInputElement;
                                if (colorInput) colorInput.value = defaultColor;
                                if (hexInput) hexInput.value = defaultColor;
                              }}
                            >
                              Réinitialiser
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'].map((color) => (
                          <button
                            key={color}
                            className="h-10 rounded-lg border-2 border-border hover:border-foreground transition-colors"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              document.documentElement.style.setProperty('--primary', color);
                              localStorage.setItem('primaryColor', color);
                              const colorInput = document.getElementById('primaryColor') as HTMLInputElement;
                              const hexInput = document.getElementById('primaryColorHex') as HTMLInputElement;
                              if (colorInput) colorInput.value = color;
                              if (hexInput) hexInput.value = color;
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Color Scheme Preview */}
                  <div className="space-y-3">
                    <Label>{t('settings.appearance.color_preview')}</Label>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-primary border border-border"></div>
                        <p className="text-xs text-center text-muted-foreground">Primary</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-muted border border-border"></div>
                        <p className="text-xs text-center text-muted-foreground">Muted</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-card border border-border"></div>
                        <p className="text-xs text-center text-muted-foreground">Card</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-accent border border-border"></div>
                        <p className="text-xs text-center text-muted-foreground">Accent</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    {t('settings.notifications.title')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.notifications.subtitle')}
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      labelKey: 'settings.notifications.new_clients',
                      descKey: 'settings.notifications.new_clients.desc',
                      checked: true,
                    },
                    {
                      labelKey: 'settings.notifications.quotes_accepted',
                      descKey: 'settings.notifications.quotes_accepted.desc',
                      checked: true,
                    },
                    {
                      labelKey: 'settings.notifications.urgent_tasks',
                      descKey: 'settings.notifications.urgent_tasks.desc',
                      checked: true,
                    },
                    {
                      labelKey: 'settings.notifications.unpaid_invoices',
                      descKey: 'settings.notifications.unpaid_invoices.desc',
                      checked: true,
                    },
                    {
                      labelKey: 'settings.notifications.weekly_reports',
                      descKey: 'settings.notifications.weekly_reports.desc',
                      checked: false,
                    },
                  ].map((notif, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {t(notif.labelKey)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t(notif.descKey)}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={notif.checked}
                        className="w-4 h-4 rounded border-border"
                      />
                    </div>
                  ))}
                </div>

                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" />
                  {t('common.save')}
                </Button>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    {t('settings.security.title')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.security.subtitle')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('settings.security.current_password')}</Label>
                    <Input id="currentPassword" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('settings.security.new_password')}</Label>
                    <Input id="newPassword" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t('settings.security.confirm_password')}
                    </Label>
                    <Input id="confirmPassword" type="password" />
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t('settings.security.two_factor')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t('settings.security.two_factor.desc')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        {t('settings.security.enable')}
                      </Button>
                    </div>
                  </div>

                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Save className="mr-2 h-4 w-4" />
                    {t('settings.security.change_password')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ModuleType = 'vehicles' | 'quotes' | 'invoices' | 'tasks' | 'communications' | 'reports' | 'accounting';

interface ModulesContextType {
  enabledModules: ModuleType[];
  isModuleEnabled: (module: ModuleType) => boolean;
  toggleModule: (module: ModuleType) => void;
  setEnabledModules: (modules: ModuleType[]) => void;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

// Modules activés par défaut
const DEFAULT_MODULES: ModuleType[] = ['quotes', 'invoices', 'tasks', 'communications', 'reports', 'accounting'];

export function ModulesProvider({ children }: { children: ReactNode }) {
  const [enabledModules, setEnabledModulesState] = useState<ModuleType[]>(DEFAULT_MODULES);

  useEffect(() => {
    // Charger les modules depuis localStorage au montage
    const saved = localStorage.getItem('enabled_modules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ModuleType[];
        setEnabledModulesState(parsed);
      } catch (err) {
        console.error('Failed to load enabled modules:', err);
      }
    }
  }, []);

  const setEnabledModules = (modules: ModuleType[]) => {
    setEnabledModulesState(modules);
    localStorage.setItem('enabled_modules', JSON.stringify(modules));
  };

  const isModuleEnabled = (module: ModuleType): boolean => {
    return enabledModules.includes(module);
  };

  const toggleModule = (module: ModuleType) => {
    const newModules = enabledModules.includes(module)
      ? enabledModules.filter(m => m !== module)
      : [...enabledModules, module];
    setEnabledModules(newModules);
  };

  return (
    <ModulesContext.Provider value={{ enabledModules, isModuleEnabled, toggleModule, setEnabledModules }}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
}

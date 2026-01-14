'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en' | 'es' | 'ar' | 'bn' | 'zh' | 'nl' | 'de' | 'hi' | 'ru' | 'tr' | 'ur' | 'lb';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Fonction pour détecter la langue du navigateur
function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';

  const validLanguages = ['fr', 'en', 'es', 'ar', 'bn', 'zh', 'nl', 'de', 'hi', 'ru', 'tr', 'ur', 'lb'];
  const browserLang = navigator.language.toLowerCase();

  // Essayer de matcher la langue complète (ex: 'fr-FR')
  if (validLanguages.includes(browserLang)) {
    return browserLang as Language;
  }

  // Essayer de matcher juste le code langue (ex: 'fr' depuis 'fr-FR')
  const shortLang = browserLang.split('-')[0];
  if (validLanguages.includes(shortLang)) {
    return shortLang as Language;
  }

  // Mappings spéciaux
  if (browserLang.startsWith('ar')) return 'ar'; // Arabe
  if (browserLang.startsWith('zh')) return 'zh'; // Chinois
  if (browserLang.startsWith('nl')) return 'nl'; // Néerlandais
  if (browserLang.startsWith('de')) return 'de'; // Allemand
  if (browserLang.startsWith('hi')) return 'hi'; // Hindi
  if (browserLang.startsWith('ru')) return 'ru'; // Russe
  if (browserLang.startsWith('tr')) return 'tr'; // Turc
  if (browserLang.startsWith('ur')) return 'ur'; // Ourdou
  if (browserLang.startsWith('lb')) return 'lb'; // Luxembourgeois

  return 'fr'; // Par défaut
}

// Fonction pour obtenir la langue initiale
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';

  const validLanguages = ['fr', 'en', 'es', 'ar', 'bn', 'zh', 'nl', 'de', 'hi', 'ru', 'tr', 'ur', 'lb'];
  const savedLanguage = localStorage.getItem('language') as Language;

  if (savedLanguage && validLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  // Si pas de langue sauvegardée, détecter celle du navigateur
  return detectBrowserLanguage();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  const [translations, setTranslations] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger les traductions pour la langue actuelle
    setIsLoading(true);
    import(`@/locales/${language}.json`)
      .then((module) => {
        setTranslations(module.default);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load translations:', err);
        setIsLoading(false);
      });
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    if (isLoading) return ''; // Retourner vide pendant le chargement

    // First, try to find the key as-is (flat key like "dashboard.title")
    if (key in translations && typeof translations[key] === 'string') {
      return translations[key];
    }

    // If not found, try nested path (like "planning.day.sun")
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if path not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

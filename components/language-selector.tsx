'use client';

import { useLanguage } from '@/contexts/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
  { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl' as const, name: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
  { code: 'zh' as const, name: '中文', flag: '🇨🇳' },
  { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
  { code: 'hi' as const, name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn' as const, name: 'বাংলা', flag: '🇧🇩' },
  { code: 'tr' as const, name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ur' as const, name: 'اردو', flag: '🇵🇰' },
  { code: 'lb' as const, name: 'Lëtzebuergesch', flag: '🇱🇺' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-muted' : ''}`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

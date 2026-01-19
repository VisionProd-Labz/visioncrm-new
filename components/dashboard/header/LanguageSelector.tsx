/**
 * Language Selector Component
 * Dropdown menu for selecting application language
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/language-context';
import { LanguageOption } from './types';
import {
  FrenchFlag,
  USFlag,
  SpanishFlag,
  GermanFlag,
  DutchFlag,
  RussianFlag,
  ChineseFlag,
  ArabicFlag,
  HindiFlag,
  BengaliFlag,
  TurkishFlag,
  UrduFlag,
  LuxembourgishFlag,
} from './flags';

// Supported languages configuration
const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'language.french', FlagComponent: FrenchFlag },
  { code: 'en', label: 'language.english', FlagComponent: USFlag },
  { code: 'es', label: 'language.spanish', FlagComponent: SpanishFlag },
  { code: 'de', label: 'language.german', FlagComponent: GermanFlag },
  { code: 'nl', label: 'language.dutch', FlagComponent: DutchFlag },
  { code: 'ru', label: 'language.russian', FlagComponent: RussianFlag },
  { code: 'zh', label: 'language.chinese', FlagComponent: ChineseFlag },
  { code: 'ar', label: 'language.arabic', FlagComponent: ArabicFlag },
  { code: 'hi', label: 'language.hindi', FlagComponent: HindiFlag },
  { code: 'bn', label: 'language.bengali', FlagComponent: BengaliFlag },
  { code: 'tr', label: 'language.turkish', FlagComponent: TurkishFlag },
  { code: 'ur', label: 'language.urdu', FlagComponent: UrduFlag },
  { code: 'lb', label: 'language.luxembourgish', FlagComponent: LuxembourgishFlag },
];

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  // Get current language flag
  const currentLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === language);
  const CurrentFlagComponent = currentLanguage?.FlagComponent || FrenchFlag;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <CurrentFlagComponent />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel>{t('language.select')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {SUPPORTED_LANGUAGES.map(({ code, label, FlagComponent }) => (
          <DropdownMenuItem
            key={code}
            className={`flex items-center gap-3 ${language === code ? 'bg-muted' : ''}`}
            onClick={() => setLanguage(code)}
          >
            <FlagComponent />
            <span className={language === code ? 'font-medium' : ''}>{t(label)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

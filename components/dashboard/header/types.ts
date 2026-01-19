/**
 * Header Component Types
 * Shared TypeScript interfaces for header modules
 */

export type LanguageCode =
  | 'fr'
  | 'en'
  | 'es'
  | 'de'
  | 'nl'
  | 'ru'
  | 'zh'
  | 'ar'
  | 'hi'
  | 'bn'
  | 'tr'
  | 'ur'
  | 'lb';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  FlagComponent: React.ComponentType;
}

export interface Notification {
  id: string;
  name: string;
  action: string;
  target?: string;
  time: string;
  avatar: string;
}

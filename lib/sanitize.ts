/**
 * ✅ SECURITY FIX #6: HTML Sanitization
 *
 * Provides functions to sanitize user inputs and prevent XSS attacks.
 * Uses isomorphic-dompurify (works in both browser and Node.js)
 */

// Lazy load DOMPurify to avoid build-time issues
let DOMPurify: any = null;
const getDOMPurify = () => {
  if (!DOMPurify) {
    DOMPurify = require('isomorphic-dompurify');
  }
  return DOMPurify;
};

/**
 * Configuration stricte pour sanitization HTML
 * Bloque tous les tags HTML et scripts
 */
const STRICT_CONFIG = {
  ALLOWED_TAGS: [], // Aucun tag HTML autorisé
  ALLOWED_ATTR: [], // Aucun attribut autorisé
  KEEP_CONTENT: true, // Garder le contenu texte
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SAFE_FOR_TEMPLATES: true,
};

/**
 * Configuration pour rich text (emails, descriptions)
 * Autorise certains tags HTML sécurisés
 */
const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'h1',
    'h2',
    'h3',
    'ul',
    'ol',
    'li',
    'a',
    'blockquote',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SAFE_FOR_TEMPLATES: true,
  // Forcer target="_blank" et rel="noopener noreferrer" pour les liens
  HOOK_AFTER_SANITIZE: (node: Element) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  },
};

/**
 * Sanitize une chaîne de texte simple (noms, adresses, etc.)
 * Supprime tout HTML et scripts
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  if (typeof input !== 'string') return '';

  // Nettoyer avec DOMPurify en mode strict
  const purify = getDOMPurify();
  const cleaned = purify.sanitize(input, STRICT_CONFIG);

  // Supprimer les espaces multiples
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Sanitize du rich text (descriptions, emails, notes)
 * Autorise certains tags HTML sécurisés
 */
export function sanitizeRichText(input: string | null | undefined): string {
  if (!input) return '';
  if (typeof input !== 'string') return '';

  // Nettoyer avec DOMPurify en autorisant certains tags
  const purify = getDOMPurify();
  const cleaned = purify.sanitize(input, RICH_TEXT_CONFIG);

  return cleaned.trim();
}

/**
 * Sanitize un email
 * Supprime tout HTML et vérifie le format basique
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return '';
  if (typeof input !== 'string') return '';

  // Nettoyer et convertir en minuscules
  const cleaned = sanitizeText(input).toLowerCase();

  // Vérification basique (Zod fera la validation complète)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    return cleaned; // Retourner quand même (Zod rejettera)
  }

  return cleaned;
}

/**
 * Sanitize une URL
 * Bloque javascript:, data:, vbscript: et autres protocoles dangereux
 */
export function sanitizeUrl(input: string | null | undefined): string {
  if (!input) return '';
  if (typeof input !== 'string') return '';

  const cleaned = sanitizeText(input);

  // Bloquer les protocoles dangereux
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ];

  const lowerUrl = cleaned.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[SECURITY] Dangerous URL protocol blocked: ${protocol}`);
      }
      return ''; // Bloquer complètement
    }
  }

  // Autoriser uniquement http://, https://, mailto:, tel:, ou relative
  if (
    !lowerUrl.startsWith('http://') &&
    !lowerUrl.startsWith('https://') &&
    !lowerUrl.startsWith('mailto:') &&
    !lowerUrl.startsWith('tel:') &&
    !lowerUrl.startsWith('/') &&
    !lowerUrl.startsWith('#')
  ) {
    // Ajouter https:// par défaut si manquant
    return `https://${cleaned}`;
  }

  return cleaned;
}

/**
 * Sanitize un numéro de téléphone
 * Garde uniquement les chiffres et caractères autorisés
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (!input) return '';
  if (typeof input !== 'string') return '';

  // Garder uniquement les chiffres, espaces, tirets, parenthèses, +
  return input.replace(/[^0-9\s\-\(\)\+]/g, '').trim();
}

/**
 * Sanitize un objet complet récursivement
 * Utile pour les données JSON
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  richTextFields: string[] = []
): T {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      // Utiliser rich text pour certains champs
      if (richTextFields.includes(key)) {
        sanitized[key] = sanitizeRichText(value);
      } else if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (
        key.toLowerCase().includes('url') ||
        key.toLowerCase().includes('website')
      ) {
        sanitized[key] = sanitizeUrl(value);
      } else if (key.toLowerCase().includes('phone')) {
        sanitized[key] = sanitizePhone(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else if (typeof value === 'object') {
      // Récursion pour les objets imbriqués
      sanitized[key] = sanitizeObject(value, richTextFields);
    } else {
      // Nombres, booléens, etc. passent sans modification
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Helper pour Zod transform
 * Peut être utilisé dans les schémas Zod: .transform(sanitizeInput)
 */
export const sanitizeInput = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  return sanitizeText(val);
};

/**
 * Helper pour Zod rich text transform
 */
export const sanitizeRichTextInput = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  return sanitizeRichText(val);
};

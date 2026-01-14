import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

// Get encryption key from environment
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;

  if (!key) {
    throw new Error('ENCRYPTION_KEY or NEXTAUTH_SECRET must be set in environment variables');
  }

  // Ensure key is 32 bytes for AES-256
  return crypto.createHash('sha256').update(key).digest('hex').substring(0, 32);
}

/**
 * Encrypt a string value
 * @param text - The text to encrypt
 * @returns Encrypted text as base64 string
 */
export function encrypt(text: string | null | undefined): string | null {
  if (!text) return null;

  try {
    const key = getEncryptionKey();

    // Generate a random salt
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive a key using PBKDF2
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');

    // Generate a random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

    // Encrypt the text
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    // Get the auth tag
    const tag = cipher.getAuthTag();

    // Combine salt + IV + tag + encrypted data
    const result = Buffer.concat([salt, iv, tag, encrypted]);

    // Return as base64
    return result.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string
 * @param encryptedText - The encrypted text (base64)
 * @returns Decrypted text
 */
export function decrypt(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) return null;

  try {
    const key = getEncryptionKey();

    // Convert from base64
    const buffer = Buffer.from(encryptedText, 'base64');

    // Extract salt
    const salt = buffer.subarray(0, SALT_LENGTH);

    // Extract IV
    const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION);

    // Extract tag
    const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION);

    // Extract encrypted data
    const encrypted = buffer.subarray(ENCRYPTED_POSITION);

    // Derive the key
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    // Return null instead of throwing to handle gracefully
    return null;
  }
}

/**
 * Encrypt an object's sensitive fields
 * @param obj - The object to encrypt
 * @param fields - Array of field names to encrypt
 * @returns Object with encrypted fields
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };

  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string) as any;
    }
  }

  return result;
}

/**
 * Decrypt an object's encrypted fields
 * @param obj - The object with encrypted fields
 * @param fields - Array of field names to decrypt
 * @returns Object with decrypted fields
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };

  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = decrypt(result[field] as string) as any;
    }
  }

  return result;
}

/**
 * Hash a value (one-way, for passwords, etc.)
 * @param value - The value to hash
 * @returns Hashed value
 */
export function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Compare a value with a hash
 * @param value - The plain value
 * @param hashedValue - The hashed value
 * @returns True if they match
 */
export function compareHash(value: string, hashedValue: string): boolean {
  const hashedInput = hash(value);
  return crypto.timingSafeEqual(
    Buffer.from(hashedInput),
    Buffer.from(hashedValue)
  );
}

/**
 * Generate a secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns Random token as hex string
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Mask sensitive data for display (e.g., email, phone)
 * @param value - The value to mask
 * @param type - The type of value ('email' | 'phone' | 'other')
 * @returns Masked value
 */
export function maskSensitiveData(
  value: string | null | undefined,
  type: 'email' | 'phone' | 'other' = 'other'
): string | null {
  if (!value) return null;

  switch (type) {
    case 'email': {
      const [local, domain] = value.split('@');
      if (!local || !domain) return value;
      const maskedLocal = local.charAt(0) + '*'.repeat(Math.max(local.length - 2, 1)) + local.charAt(local.length - 1);
      return `${maskedLocal}@${domain}`;
    }

    case 'phone': {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length < 4) return '*'.repeat(value.length);
      return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
    }

    default: {
      if (value.length <= 4) return '*'.repeat(value.length);
      return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
    }
  }
}

// Example usage for encrypting/decrypting contact data
export interface EncryptedContact {
  email?: string;
  phone?: string;
  address?: any;
}

export function encryptContactData(contact: EncryptedContact): EncryptedContact {
  const encrypted = { ...contact };

  if (contact.email) {
    encrypted.email = encrypt(contact.email) || undefined;
  }

  if (contact.phone) {
    encrypted.phone = encrypt(contact.phone) || undefined;
  }

  if (contact.address && typeof contact.address === 'object') {
    // Encrypt address as JSON string
    encrypted.address = encrypt(JSON.stringify(contact.address));
  }

  return encrypted;
}

export function decryptContactData(contact: EncryptedContact): EncryptedContact {
  const decrypted = { ...contact };

  if (contact.email) {
    decrypted.email = decrypt(contact.email) || undefined;
  }

  if (contact.phone) {
    decrypted.phone = decrypt(contact.phone) || undefined;
  }

  if (contact.address && typeof contact.address === 'string') {
    try {
      const decryptedAddress = decrypt(contact.address);
      decrypted.address = decryptedAddress ? JSON.parse(decryptedAddress) : null;
    } catch (error) {
      console.error('Failed to decrypt address:', error);
      decrypted.address = null;
    }
  }

  return decrypted;
}

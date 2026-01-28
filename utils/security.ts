/**
 * SECURE ENCRYPTION UTILITIES
 * Uses Web Crypto API for AES-256-GCM encryption
 * 
 * WARNING: This replaces the previous Base64 "encryption" which was NOT secure.
 * This implementation uses industry-standard AES-256-GCM encryption.
 * 
 * NOTE: For React state initialization, we provide synchronous fallback methods
 * that use the legacy Base64 encoding. For new code, use the async methods.
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16;
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Derives an encryption key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-256-GCM (ASYNC)
 * @param data - Plain text data to encrypt
 * @param password - Password for encryption (defaults to app-level key)
 * @returns Base64-encoded encrypted data with salt and IV
 */
export async function encryptDataAsync(data: string, password?: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(data);

    // Use provided password or fall back to environment variable
    const encryptionPassword = password || import.meta.env.VITE_ENCRYPTION_SALT || 'default-key-change-in-production';

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Derive encryption key
    const key = await deriveKey(encryptionPassword, salt);

    // Encrypt the data
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      key,
      plaintext
    );

    // Combine salt + IV + ciphertext
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data encrypted with encryptDataAsync (ASYNC)
 * @param encryptedData - Base64-encoded encrypted data
 * @param password - Password used for encryption
 * @returns Decrypted plain text
 */
export async function decryptDataAsync(encryptedData: string, password?: string): Promise<string> {
  try {
    // Use provided password or fall back to environment variable
    const encryptionPassword = password || import.meta.env.VITE_ENCRYPTION_SALT || 'default-key-change-in-production';

    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    // Extract salt, IV, and ciphertext
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

    // Derive decryption key
    const key = await deriveKey(encryptionPassword, salt);

    // Decrypt the data
    const plaintext = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      key,
      ciphertext
    );

    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(plaintext);
  } catch (error) {
    console.error('Decryption failed:', error);
    // Fall back to trying Base64 decode for backward compatibility
    try {
      return decodeURIComponent(escape(atob(encryptedData)));
    } catch {
      throw new Error('Failed to decrypt data');
    }
  }
}


/**
 * USER-DERIVED ENCRYPTION (PRODUCTION-READY)
 * These methods derive keys from the user's password in-memory.
 * This prevents static key exposure in the client bundle.
 */

let userEncryptionKey: CryptoKey | null = null;

/**
 * Derives a unique encryption key from the user's password and ID.
 * Call this immediately after successful login.
 */
export async function deriveUserKey(password: string, userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  // Import the password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password + userId), // Salt with userId for uniqueness
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Use userId as a consistent salt for the derivation
  const salt = encoder.encode(userId);

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  userEncryptionKey = key;
  return key;
}

/**
 * Encrypts sensitive data using the user's derived key.
 * Throws if the user is not authenticated (key missing).
 */
export async function encryptUserData(data: string): Promise<string> {
  if (!userEncryptionKey) {
    throw new Error('SEC_ERR: User encryption key not initialized. User must be logged in.');
  }

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
      tagLength: 128
    },
    userEncryptionKey,
    plaintext
  );

  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts data using the user's derived key.
 */
export async function decryptUserData(encryptedData: string): Promise<string> {
  if (!userEncryptionKey) {
    throw new Error('SEC_ERR: User encryption key not initialized.');
  }

  try {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);

    const plaintext = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv,
        tagLength: 128
      },
      userEncryptionKey,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(plaintext);
  } catch (error) {
    console.error('Decryption failed with user key:', error);
    throw new Error('Failed to decrypt user data. Key may be invalid.');
  }
}

/**
 * Wipes the encryption key from memory on logout.
 */
export function clearUserKey(): void {
  userEncryptionKey = null;
  console.log('ALSHIFA_SECURITY: User encryption key purged from memory.');
}

/**
 * SYNCHRONOUS encryption (uses Base64 - NOT FOR PRODUCTION SENSITIVE DATA)
 * @deprecated Use encryptDataAsync or encryptUserData for better security.
 */
export function encryptData(data: string): string {
  console.warn('ALSHIFA_SECURITY: Using legacy sync encryption. Migrate to async methods for production.');
  try {
    return btoa(unescape(encodeURIComponent(data)));
  } catch (error) {
    console.error('Sync encryption failed:', error);
    return data;
  }
}

/**
 * SYNCHRONOUS decryption (uses Base64 for backward compatibility)
 * Use this for React state initialization
 * For new code, use decryptDataAsync instead
 */
export function decryptData(data: string): string {
  try {
    return decodeURIComponent(escape(atob(data)));
  } catch (error) {
    console.error('Sync decryption failed:', error);
    return data;
  }
}

/**
 * Migrates data from sync Base64 to async real encryption
 */
export async function migrateToRealEncryption(legacyData: string): Promise<string> {
  const decrypted = decryptData(legacyData);
  return await encryptDataAsync(decrypted);
}

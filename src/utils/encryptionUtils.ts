import crypto from 'crypto';

const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY; // Must be 64 hex characters (32 bytes when converted to a Buffer).
const IV_LENGTH = 16; // For AES, IV is always 16 bytes.

if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
  throw new Error(
    "Invalid ENCRYPTION_KEY: Must be a 64-character hexadecimal string in the .env file."
  );
}

// Convert the 64-character hex string into a 32-byte Buffer for AES-256.
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');

export function generateEncryptedURL(data: object): string {
  const iv = crypto.randomBytes(IV_LENGTH); // Generate a random initialization vector (IV).
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV and encrypted data, separated by a colon.
  return `${iv.toString('hex')}:${encrypted}`;
}

export function verifyEncryptedURL(token: string): any {
  const [ivHex, encryptedData] = token.split(':');
  if (!ivHex || !encryptedData) {
    throw new Error("Invalid token format.");
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY,
    Buffer.from(ivHex, 'hex')
  );

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted); // Return the original object.
}

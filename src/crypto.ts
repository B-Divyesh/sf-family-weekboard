import type { BoardSnapshot } from './models';

interface EncryptedPayload {
  format: 'weekboard-encrypted';
  version: 1;
  salt: string;
  iv: string;
  data: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>, usage: KeyUsage[]): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 210_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usage
  );
}

export async function encryptSnapshot(snapshot: BoardSnapshot, passphrase: string): Promise<string> {
  if (passphrase.length < 8) throw new Error('Use a passphrase with at least 8 characters.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ['encrypt']);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(snapshot)));
  // One compact envelope keeps ordinary household boards within QR capacity.
  // The reader below still accepts the original JSON-in-base64 WB1 envelope.
  return `WB1.${bytesToBase64(salt)}.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(data))}`;
}

export async function decryptSnapshot(code: string, passphrase: string): Promise<BoardSnapshot> {
  try {
    const trimmed = code.trim();
    const parts = trimmed.split('.');
    let payload: EncryptedPayload;
    if (parts.length === 4 && parts[0] === 'WB1') {
      payload = { format: 'weekboard-encrypted', version: 1, salt: parts[1], iv: parts[2], data: parts[3] };
    } else {
      const raw = trimmed.replace(/^WB1\./, '');
      payload = JSON.parse(decoder.decode(base64ToBytes(raw))) as EncryptedPayload;
    }
    if (payload.format !== 'weekboard-encrypted' || payload.version !== 1) throw new Error();
    const salt = base64ToBytes(payload.salt);
    const iv = base64ToBytes(payload.iv);
    const key = await deriveKey(passphrase, salt, ['decrypt']);
    const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToBytes(payload.data));
    return JSON.parse(decoder.decode(data)) as BoardSnapshot;
  } catch {
    throw new Error('That handoff code or passphrase did not match. Check both and try again.');
  }
}
